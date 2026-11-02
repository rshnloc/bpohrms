from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Optional
from datetime import datetime
import os

from app.database import get_db, init_db
from app.seed_data import seed_database_if_empty
from app.models import (
    CampaignModel, CampaignCreate,
    EmployeeModel, EmployeeCreate,
    LiveFloorAgent, StateUpdateRequest,
    RosterItem, RosterSwapRequest,
    AttendanceRecord, PunchRequest,
    QAEvaluation, QACreate,
    LeaveRequest, LeaveCreate, LeaveStatusUpdate,
    PayrollRecord, OverviewStats
)

app = FastAPI(
    title="NexPulse BPO & HRMS Platform API",
    description="Synthetic Operations Command Center and Workforce HR Management Suite. No real PII or live credentials used.",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    seed_database_if_empty()

@app.get("/api/health")
def health():
    return {
        "platform": "NexPulse BPO Operations & HRMS Suite",
        "status": "Operational",
        "data_mode": "Synthetic & Privacy Compliant (Zero PII / No Live Credentials)"
    }

# -------------------- OVERVIEW STATS --------------------
@app.get("/api/overview", response_model=OverviewStats)
def get_overview():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Total headcount
        cursor.execute("SELECT COUNT(*) FROM employees")
        total_headcount = cursor.fetchone()[0]

        # Active on floor (not offline)
        cursor.execute("SELECT COUNT(*) FROM live_floor WHERE current_state != 'Offline'")
        active_on_floor = cursor.fetchone()[0]

        # Occupancy rate = (In Call + Wrap Up) / (Available + In Call + Wrap Up + Break)
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN current_state IN ('In Call', 'Wrap Up') THEN 1 ELSE 0 END),
                SUM(CASE WHEN current_state IN ('Available', 'In Call', 'Wrap Up', 'Break') THEN 1 ELSE 0 END),
                AVG(adherence_percent),
                AVG(csat_score),
                AVG(avg_handle_time_sec),
                SUM(calls_handled_today)
            FROM live_floor
            WHERE current_state != 'Offline'
        """)
        row = cursor.fetchone()
        in_service = row[0] or 0
        total_floor = row[1] or 1
        occupancy = round((in_service / total_floor) * 100, 1) if total_floor > 0 else 0.0
        avg_adherence = round(row[2] or 95.0, 1)
        avg_csat = round(row[3] or 4.6, 2)
        avg_aht = int(row[4] or 280)
        total_calls = int(row[5] or 0)

        # SLA compliance avg from active campaigns
        cursor.execute("SELECT AVG(target_sla) FROM campaigns WHERE active = 1")
        sla_row = cursor.fetchone()
        sla_val = round(sla_row[0] or 93.5, 1)

        return OverviewStats(
            total_headcount=total_headcount,
            active_on_floor=active_on_floor,
            occupancy_rate=occupancy,
            shift_adherence=avg_adherence,
            avg_csat=avg_csat,
            avg_aht_seconds=avg_aht,
            sla_compliance=sla_val,
            total_calls_today=total_calls
        )

# -------------------- LIVE FLOOR MONITOR --------------------
@app.get("/api/live-floor", response_model=List[LiveFloorAgent])
def get_live_floor(campaign_id: Optional[str] = None, state: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT 
                lf.employee_id,
                e.full_name,
                e.role,
                e.campaign_id,
                c.name as campaign_name,
                lf.current_state,
                lf.state_started_at,
                lf.calls_handled_today,
                lf.avg_handle_time_sec,
                lf.csat_score,
                lf.adherence_percent,
                e.seat_number
            FROM live_floor lf
            JOIN employees e ON lf.employee_id = e.id
            LEFT JOIN campaigns c ON e.campaign_id = c.id
            WHERE 1=1
        """
        params = []
        if campaign_id:
            query += " AND e.campaign_id = ?"
            params.append(campaign_id)
        if state:
            query += " AND lf.current_state = ?"
            params.append(state)

        query += " ORDER BY lf.current_state ASC, lf.calls_handled_today DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        return [
            LiveFloorAgent(
                employee_id=r["employee_id"],
                full_name=r["full_name"],
                role=r["role"],
                campaign_id=r["campaign_id"],
                campaign_name=r["campaign_name"],
                current_state=r["current_state"],
                state_started_at=r["state_started_at"],
                calls_handled_today=r["calls_handled_today"],
                avg_handle_time_sec=r["avg_handle_time_sec"],
                csat_score=r["csat_score"],
                adherence_percent=r["adherence_percent"],
                seat_number=r["seat_number"]
            )
            for r in rows
        ]

@app.put("/api/live-floor/{employee_id}/state")
def update_agent_state(employee_id: str, body: StateUpdateRequest):
    valid_states = ["Available", "In Call", "Wrap Up", "Break", "Training", "Offline"]
    if body.state not in valid_states:
        raise HTTPException(status_code=400, detail=f"State must be one of {valid_states}")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM employees WHERE id = ?", (employee_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Employee not found")

        cursor.execute("""
            UPDATE live_floor 
            SET current_state = ?, state_started_at = '00m 05s' 
            WHERE employee_id = ?
        """, (body.state, employee_id))
        
        cursor.execute("UPDATE employees SET status = ? WHERE id = ?", (body.state, employee_id))
        return {"success": True, "employee_id": employee_id, "new_state": body.state}

# -------------------- EMPLOYEES --------------------
@app.get("/api/employees", response_model=List[EmployeeModel])
def get_employees(role: Optional[str] = None, campaign_id: Optional[str] = None, status: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM employees WHERE 1=1"
        params = []
        if role:
            query += " AND role = ?"
            params.append(role)
        if campaign_id:
            query += " AND campaign_id = ?"
            params.append(campaign_id)
        if status:
            query += " AND status = ?"
            params.append(status)
        
        query += " ORDER BY id ASC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [EmployeeModel(**dict(r)) for r in rows]

@app.post("/api/employees", response_model=EmployeeModel)
def create_employee(emp: EmployeeCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM employees WHERE id = ?", (emp.id,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Employee ID already exists")

        hire_date = datetime.now().strftime("%Y-%m-%d")
        status = "Available"
        cursor.execute("""
            INSERT INTO employees (id, full_name, email, role, department, campaign_id, shift_name, status, hourly_rate, hire_date, phone, seat_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (emp.id, emp.full_name, emp.email, emp.role, emp.department, emp.campaign_id, emp.shift_name, status, emp.hourly_rate, hire_date, emp.phone, emp.seat_number))

        # Also add to live floor
        cursor.execute("""
            INSERT OR IGNORE INTO live_floor (employee_id, current_state, state_started_at, calls_handled_today, avg_handle_time_sec, csat_score, adherence_percent)
            VALUES (?, 'Available', '01m 00s', 0, 0, 5.0, 100.0)
        """, (emp.id,))

        cursor.execute("SELECT * FROM employees WHERE id = ?", (emp.id,))
        return EmployeeModel(**dict(cursor.fetchone()))

# -------------------- CAMPAIGNS --------------------
@app.get("/api/campaigns", response_model=List[CampaignModel])
def get_campaigns():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM campaigns ORDER BY id ASC")
        return [CampaignModel(**dict(r)) for r in cursor.fetchall()]

@app.post("/api/campaigns", response_model=CampaignModel)
def create_campaign(camp: CampaignCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM campaigns WHERE id = ?", (camp.id,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Campaign ID already exists")

        cursor.execute("""
            INSERT INTO campaigns (id, name, client_code, channel_type, target_sla, target_aht_seconds, target_csat, head_count, lead_name, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (camp.id, camp.name, camp.client_code, camp.channel_type, camp.target_sla, camp.target_aht_seconds, camp.target_csat, camp.head_count, camp.lead_name))

        cursor.execute("SELECT * FROM campaigns WHERE id = ?", (camp.id,))
        return CampaignModel(**dict(cursor.fetchone()))

# -------------------- ROSTER --------------------
@app.get("/api/roster", response_model=List[RosterItem])
def get_roster(shift_date: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT r.id, r.employee_id, e.full_name, r.shift_date, r.shift_code, r.start_time, r.end_time, r.swap_status
            FROM roster r
            JOIN employees e ON r.employee_id = e.id
            WHERE 1=1
        """
        params = []
        if shift_date:
            query += " AND r.shift_date = ?"
            params.append(shift_date)
        
        query += " ORDER BY r.shift_date ASC, r.employee_id ASC"
        cursor.execute(query, params)
        return [RosterItem(**dict(r)) for r in cursor.fetchall()]

@app.post("/api/roster/swap")
def request_swap(swap: RosterSwapRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        shift_times = {
            "MOR": ("06:00", "15:00"),
            "DAY": ("14:00", "23:00"),
            "GRA": ("22:00", "07:00"),
            "SPL": ("10:00", "19:00"),
            "OFF": ("-", "-")
        }
        if swap.requested_code not in shift_times:
            raise HTTPException(status_code=400, detail="Invalid shift code")
        
        st, et = shift_times[swap.requested_code]
        cursor.execute("""
            UPDATE roster 
            SET shift_code = ?, start_time = ?, end_time = ?, swap_status = 'Approved'
            WHERE id = ?
        """, (swap.requested_code, st, et, swap.roster_id))
        return {"success": True, "message": f"Shift updated to {swap.requested_code}"}

# -------------------- ATTENDANCE --------------------
@app.get("/api/attendance", response_model=List[AttendanceRecord])
def get_attendance(work_date: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT a.id, a.employee_id, e.full_name, a.work_date, a.punch_in, a.punch_out, a.total_hours, a.overtime_hours, a.status
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE 1=1
        """
        params = []
        if work_date:
            query += " AND a.work_date = ?"
            params.append(work_date)
        
        query += " ORDER BY a.work_date DESC, a.employee_id ASC"
        cursor.execute(query, params)
        return [AttendanceRecord(**dict(r)) for r in cursor.fetchall()]

@app.post("/api/attendance/punch")
def handle_punch(punch: PunchRequest):
    now_time = datetime.now().strftime("%H:%M")
    today_date = datetime.now().strftime("%Y-%m-%d")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM attendance WHERE employee_id = ? AND work_date = ?", (punch.employee_id, today_date))
        record = cursor.fetchone()

        if punch.punch_type == "IN":
            if record:
                cursor.execute("UPDATE attendance SET punch_in = ?, status = 'Present' WHERE id = ?", (now_time, record["id"]))
            else:
                cursor.execute("""
                    INSERT INTO attendance (employee_id, work_date, punch_in, punch_out, total_hours, overtime_hours, status)
                    VALUES (?, ?, ?, NULL, 0, 0, 'Present')
                """, (punch.employee_id, today_date, now_time))
        elif punch.punch_type == "OUT":
            if not record:
                raise HTTPException(status_code=400, detail="No punch-in recorded today")
            cursor.execute("UPDATE attendance SET punch_out = ?, total_hours = 8.5 WHERE id = ?", (now_time, record["id"]))
            cursor.execute("UPDATE live_floor SET current_state = 'Offline' WHERE employee_id = ?", (punch.employee_id,))
            cursor.execute("UPDATE employees SET status = 'Offline' WHERE id = ?", (punch.employee_id,))
        
        return {"success": True, "punch_type": punch.punch_type, "time": now_time}

# -------------------- QUALITY ASSURANCE (QA) --------------------
@app.get("/api/qa-evaluations", response_model=List[QAEvaluation])
def get_qa_evaluations():
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT q.id, q.call_id, q.employee_id, e.full_name as employee_name, q.auditor_name, 
                   q.evaluation_date, q.greeting_score, q.empathy_score, q.accuracy_score, 
                   q.compliance_score, q.fatal_error, q.total_score, q.feedback_notes
            FROM qa_evaluations q
            JOIN employees e ON q.employee_id = e.id
            ORDER BY q.id DESC
        """
        cursor.execute(query)
        return [QAEvaluation(**dict(r)) for r in cursor.fetchall()]

@app.post("/api/qa-evaluations", response_model=QAEvaluation)
def create_qa_evaluation(qa: QACreate):
    # Total calculation (Greeting: max 15, Empathy: max 25, Accuracy: max 35, Compliance: max 25)
    # If fatal error, total score drops to 0 immediately
    if qa.fatal_error == 1:
        total = 0.0
    else:
        total = min(100.0, qa.greeting_score + qa.empathy_score + qa.accuracy_score + qa.compliance_score)
    
    eval_date = datetime.now().strftime("%Y-%m-%d")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO qa_evaluations (call_id, employee_id, auditor_name, evaluation_date, greeting_score, empathy_score, accuracy_score, compliance_score, fatal_error, total_score, feedback_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (qa.call_id, qa.employee_id, qa.auditor_name, eval_date, qa.greeting_score, qa.empathy_score, qa.accuracy_score, qa.compliance_score, qa.fatal_error, total, qa.feedback_notes))
        new_id = cursor.lastrowid
        
        cursor.execute("""
            SELECT q.id, q.call_id, q.employee_id, e.full_name as employee_name, q.auditor_name, 
                   q.evaluation_date, q.greeting_score, q.empathy_score, q.accuracy_score, 
                   q.compliance_score, q.fatal_error, q.total_score, q.feedback_notes
            FROM qa_evaluations q
            JOIN employees e ON q.employee_id = e.id
            WHERE q.id = ?
        """, (new_id,))
        return QAEvaluation(**dict(cursor.fetchone()))

# -------------------- LEAVE REQUESTS --------------------
@app.get("/api/leave-requests", response_model=List[LeaveRequest])
def get_leave_requests():
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT l.id, l.employee_id, e.full_name as employee_name, l.leave_type, l.start_date, l.end_date, l.reason, l.status
            FROM leave_requests l
            JOIN employees e ON l.employee_id = e.id
            ORDER BY l.id DESC
        """
        cursor.execute(query)
        return [LeaveRequest(**dict(r)) for r in cursor.fetchall()]

@app.post("/api/leave-requests", response_model=LeaveRequest)
def create_leave_request(lr: LeaveCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
            VALUES (?, ?, ?, ?, ?, 'Pending')
        """, (lr.employee_id, lr.leave_type, lr.start_date, lr.end_date, lr.reason))
        new_id = cursor.lastrowid

        cursor.execute("""
            SELECT l.id, l.employee_id, e.full_name as employee_name, l.leave_type, l.start_date, l.end_date, l.reason, l.status
            FROM leave_requests l
            JOIN employees e ON l.employee_id = e.id
            WHERE l.id = ?
        """, (new_id,))
        return LeaveRequest(**dict(cursor.fetchone()))

@app.put("/api/leave-requests/{leave_id}/status")
def update_leave_status(leave_id: int, body: LeaveStatusUpdate):
    if body.status not in ["Approved", "Rejected"]:
        raise HTTPException(status_code=400, detail="Status must be Approved or Rejected")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE leave_requests SET status = ? WHERE id = ?", (body.status, leave_id))
        return {"success": True, "leave_id": leave_id, "new_status": body.status}

# -------------------- PAYROLL & INCENTIVES --------------------
@app.get("/api/payroll", response_model=List[PayrollRecord])
def get_payroll():
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT p.id, p.employee_id, e.full_name as employee_name, p.pay_period, p.base_hours,
                   p.night_diff_hours, p.overtime_hours, p.base_salary, p.night_allowance,
                   p.quality_incentive, p.deductions, p.net_pay, p.status
            FROM payroll_records p
            JOIN employees e ON p.employee_id = e.id
            ORDER BY p.id ASC
        """
        cursor.execute(query)
        return [PayrollRecord(**dict(r)) for r in cursor.fetchall()]

# Mount frontend production build if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
