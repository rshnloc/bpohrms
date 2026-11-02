from pydantic import BaseModel, Field
from typing import Optional, List

class CampaignModel(BaseModel):
    id: str
    name: str
    client_code: str
    channel_type: str
    target_sla: float
    target_aht_seconds: int
    target_csat: float
    head_count: int
    lead_name: str
    active: int = 1

class CampaignCreate(BaseModel):
    id: str
    name: str
    client_code: str
    channel_type: str
    target_sla: float
    target_aht_seconds: int
    target_csat: float
    head_count: int
    lead_name: str

class EmployeeModel(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    department: str
    campaign_id: Optional[str] = None
    shift_name: str
    status: str
    hourly_rate: float
    hire_date: str
    phone: str
    seat_number: str

class EmployeeCreate(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    department: str
    campaign_id: Optional[str] = None
    shift_name: str
    hourly_rate: float = 18.0
    phone: str = "+1-555-0199"
    seat_number: str = "FLR1-BAY-00"

class LiveFloorAgent(BaseModel):
    employee_id: str
    full_name: str
    role: str
    campaign_id: Optional[str] = None
    campaign_name: Optional[str] = None
    current_state: str  # Available, In Call, Wrap Up, Break, Training, Offline
    state_started_at: str
    calls_handled_today: int
    avg_handle_time_sec: int
    csat_score: float
    adherence_percent: float
    seat_number: str

class StateUpdateRequest(BaseModel):
    state: str

class RosterItem(BaseModel):
    id: int
    employee_id: str
    full_name: Optional[str] = None
    shift_date: str
    shift_code: str
    start_time: str
    end_time: str
    swap_status: str

class RosterSwapRequest(BaseModel):
    roster_id: int
    requested_code: str

class AttendanceRecord(BaseModel):
    id: int
    employee_id: str
    full_name: Optional[str] = None
    work_date: str
    punch_in: Optional[str] = None
    punch_out: Optional[str] = None
    total_hours: float
    overtime_hours: float
    status: str

class PunchRequest(BaseModel):
    employee_id: str
    punch_type: str  # "IN" or "OUT"

class QAEvaluation(BaseModel):
    id: int
    call_id: str
    employee_id: str
    employee_name: Optional[str] = None
    auditor_name: str
    evaluation_date: str
    greeting_score: float
    empathy_score: float
    accuracy_score: float
    compliance_score: float
    fatal_error: int
    total_score: float
    feedback_notes: str

class QACreate(BaseModel):
    call_id: str
    employee_id: str
    auditor_name: str
    greeting_score: float
    empathy_score: float
    accuracy_score: float
    compliance_score: float
    fatal_error: int = 0
    feedback_notes: str

class LeaveRequest(BaseModel):
    id: int
    employee_id: str
    employee_name: Optional[str] = None
    leave_type: str
    start_date: str
    end_date: str
    reason: str
    status: str

class LeaveCreate(BaseModel):
    employee_id: str
    leave_type: str
    start_date: str
    end_date: str
    reason: str

class LeaveStatusUpdate(BaseModel):
    status: str  # "Approved" or "Rejected"

class PayrollRecord(BaseModel):
    id: int
    employee_id: str
    employee_name: Optional[str] = None
    pay_period: str
    base_hours: float
    night_diff_hours: float
    overtime_hours: float
    base_salary: float
    night_allowance: float
    quality_incentive: float
    deductions: float
    net_pay: float
    status: str

class OverviewStats(BaseModel):
    total_headcount: int
    active_on_floor: int
    occupancy_rate: float
    shift_adherence: float
    avg_csat: float
    avg_aht_seconds: int
    sla_compliance: float
    total_calls_today: int

