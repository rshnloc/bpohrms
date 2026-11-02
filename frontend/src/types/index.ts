export interface OverviewStats {
  total_headcount: number;
  active_on_floor: number;
  occupancy_rate: number;
  shift_adherence: number;
  avg_csat: number;
  avg_aht_seconds: number;
  sla_compliance: number;
  total_calls_today: number;
}

export type AgentState = 'Available' | 'In Call' | 'Wrap Up' | 'Break' | 'Training' | 'Offline';

export interface LiveFloorAgent {
  employee_id: string;
  full_name: string;
  role: string;
  campaign_id: string | null;
  campaign_name: string | null;
  current_state: AgentState;
  state_started_at: string;
  calls_handled_today: number;
  avg_handle_time_sec: number;
  csat_score: number;
  adherence_percent: number;
  seat_number: string;
}

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  campaign_id: string | null;
  shift_name: string;
  status: AgentState;
  hourly_rate: number;
  hire_date: string;
  phone: string;
  seat_number: string;
}

export interface Campaign {
  id: string;
  name: string;
  client_code: string;
  channel_type: string;
  target_sla: number;
  target_aht_seconds: number;
  target_csat: number;
  head_count: number;
  lead_name: string;
  active: number;
}

export interface RosterItem {
  id: number;
  employee_id: string;
  full_name?: string;
  shift_date: string;
  shift_code: 'MOR' | 'DAY' | 'GRA' | 'SPL' | 'OFF';
  start_time: string;
  end_time: string;
  swap_status: string;
}

export interface AttendanceRecord {
  id: number;
  employee_id: string;
  full_name?: string;
  work_date: string;
  punch_in: string | null;
  punch_out: string | null;
  total_hours: number;
  overtime_hours: number;
  status: 'Present' | 'Late' | 'Half-Day' | 'Absent' | 'On-Leave';
}

export interface QAEvaluation {
  id: number;
  call_id: string;
  employee_id: string;
  employee_name?: string;
  auditor_name: string;
  evaluation_date: string;
  greeting_score: number;
  empathy_score: number;
  accuracy_score: number;
  compliance_score: number;
  fatal_error: number;
  total_score: number;
  feedback_notes: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: string;
  employee_name?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface PayrollRecord {
  id: number;
  employee_id: string;
  employee_name?: string;
  pay_period: string;
  base_hours: number;
  night_diff_hours: number;
  overtime_hours: number;
  base_salary: number;
  night_allowance: number;
  quality_incentive: number;
  deductions: number;
  net_pay: number;
  status: string;
}

