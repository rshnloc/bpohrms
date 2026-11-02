import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(__file__), "bpo_hrms.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Campaigns / Client Processes
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS campaigns (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            client_code TEXT NOT NULL,
            channel_type TEXT NOT NULL,
            target_sla REAL NOT NULL,
            target_aht_seconds INTEGER NOT NULL,
            target_csat REAL NOT NULL,
            head_count INTEGER NOT NULL,
            lead_name TEXT NOT NULL,
            active INTEGER DEFAULT 1
        );
        """)

        # Employees (Agents, Leads, QA, Managers)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS employees (
            id TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT NOT NULL,
            department TEXT NOT NULL,
            campaign_id TEXT,
            shift_name TEXT NOT NULL,
            status TEXT NOT NULL,
            hourly_rate REAL NOT NULL,
            hire_date TEXT NOT NULL,
            phone TEXT NOT NULL,
            seat_number TEXT NOT NULL,
            FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
        );
        """)

        # Live Floor Status Monitor
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS live_floor (
            employee_id TEXT PRIMARY KEY,
            current_state TEXT NOT NULL,
            state_started_at TEXT NOT NULL,
            calls_handled_today INTEGER DEFAULT 0,
            avg_handle_time_sec INTEGER DEFAULT 0,
            csat_score REAL DEFAULT 0.0,
            adherence_percent REAL DEFAULT 100.0,
            FOREIGN KEY (employee_id) REFERENCES employees (id)
        );
        """)

        # Shift Rosters (7-Day schedule matrix)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS roster (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT NOT NULL,
            shift_date TEXT NOT NULL,
            shift_code TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            swap_status TEXT DEFAULT 'None',
            FOREIGN KEY (employee_id) REFERENCES employees (id)
        );
        """)

        # Daily Attendance & Overtime
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT NOT NULL,
            work_date TEXT NOT NULL,
            punch_in TEXT,
            punch_out TEXT,
            total_hours REAL DEFAULT 0,
            overtime_hours REAL DEFAULT 0,
            status TEXT NOT NULL,
            FOREIGN KEY (employee_id) REFERENCES employees (id)
        );
        """)

        # Quality Assurance (QA) Evaluations
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS qa_evaluations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            call_id TEXT NOT NULL,
            employee_id TEXT NOT NULL,
            auditor_name TEXT NOT NULL,
            evaluation_date TEXT NOT NULL,
            greeting_score REAL NOT NULL,
            empathy_score REAL NOT NULL,
            accuracy_score REAL NOT NULL,
            compliance_score REAL NOT NULL,
            fatal_error INTEGER DEFAULT 0,
            total_score REAL NOT NULL,
            feedback_notes TEXT NOT NULL,
            FOREIGN KEY (employee_id) REFERENCES employees (id)
        );
        """)

        # Leave Requests
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS leave_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT NOT NULL,
            leave_type TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            reason TEXT NOT NULL,
            status TEXT DEFAULT 'Pending',
            FOREIGN KEY (employee_id) REFERENCES employees (id)
        );
        """)

        # Payroll & Shift Allowance Calculation
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS payroll_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT NOT NULL,
            pay_period TEXT NOT NULL,
            base_hours REAL NOT NULL,
            night_diff_hours REAL NOT NULL,
            overtime_hours REAL NOT NULL,
            base_salary REAL NOT NULL,
            night_allowance REAL NOT NULL,
            quality_incentive REAL NOT NULL,
            deductions REAL NOT NULL,
            net_pay REAL NOT NULL,
            status TEXT DEFAULT 'Draft',
            FOREIGN KEY (employee_id) REFERENCES employees (id)
        );
        """)

