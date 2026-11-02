import {
  OverviewStats,
  LiveFloorAgent,
  Employee,
  Campaign,
  RosterItem,
  AttendanceRecord,
  QAEvaluation,
  LeaveRequest,
  PayrollRecord,
} from '../types';

const API_BASE = '/api';

export const api = {
  async getOverview(): Promise<OverviewStats> {
    const res = await fetch(`${API_BASE}/overview`);
    if (!res.ok) throw new Error('Failed to fetch overview metrics');
    return res.json();
  },

  async getLiveFloor(campaignId?: string, state?: string): Promise<LiveFloorAgent[]> {
    const params = new URLSearchParams();
    if (campaignId) params.append('campaign_id', campaignId);
    if (state) params.append('state', state);
    const res = await fetch(`${API_BASE}/live-floor?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch live floor data');
    return res.json();
  },

  async updateAgentState(employeeId: string, state: string): Promise<any> {
    const res = await fetch(`${API_BASE}/live-floor/${employeeId}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });
    if (!res.ok) throw new Error('Failed to update agent state');
    return res.json();
  },

  async getEmployees(role?: string, campaignId?: string): Promise<Employee[]> {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (campaignId) params.append('campaign_id', campaignId);
    const res = await fetch(`${API_BASE}/employees?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch employees');
    return res.json();
  },

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create employee');
    }
    return res.json();
  },

  async getCampaigns(): Promise<Campaign[]> {
    const res = await fetch(`${API_BASE}/campaigns`);
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    return res.json();
  },

  async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    const res = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create campaign');
    }
    return res.json();
  },

  async getRoster(shiftDate?: string): Promise<RosterItem[]> {
    const params = new URLSearchParams();
    if (shiftDate) params.append('shift_date', shiftDate);
    const res = await fetch(`${API_BASE}/roster?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch roster');
    return res.json();
  },

  async requestSwap(rosterId: number, requestedCode: string): Promise<any> {
    const res = await fetch(`${API_BASE}/roster/swap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roster_id: rosterId, requested_code: requestedCode }),
    });
    if (!res.ok) throw new Error('Failed to submit swap');
    return res.json();
  },

  async getAttendance(workDate?: string): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (workDate) params.append('work_date', workDate);
    const res = await fetch(`${API_BASE}/attendance?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },

  async punchAttendance(employeeId: string, punchType: 'IN' | 'OUT'): Promise<any> {
    const res = await fetch(`${API_BASE}/attendance/punch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_id: employeeId, punch_type: punchType }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Punch failed');
    }
    return res.json();
  },

  async getQAEvaluations(): Promise<QAEvaluation[]> {
    const res = await fetch(`${API_BASE}/qa-evaluations`);
    if (!res.ok) throw new Error('Failed to fetch QA evaluations');
    return res.json();
  },

  async createQAEvaluation(data: {
    call_id: string;
    employee_id: string;
    auditor_name: string;
    greeting_score: number;
    empathy_score: number;
    accuracy_score: number;
    compliance_score: number;
    fatal_error: number;
    feedback_notes: string;
  }): Promise<QAEvaluation> {
    const res = await fetch(`${API_BASE}/qa-evaluations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create QA evaluation');
    return res.json();
  },

  async getLeaveRequests(): Promise<LeaveRequest[]> {
    const res = await fetch(`${API_BASE}/leave-requests`);
    if (!res.ok) throw new Error('Failed to fetch leave requests');
    return res.json();
  },

  async createLeaveRequest(data: {
    employee_id: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
  }): Promise<LeaveRequest> {
    const res = await fetch(`${API_BASE}/leave-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit leave request');
    return res.json();
  },

  async updateLeaveStatus(leaveId: number, status: 'Approved' | 'Rejected'): Promise<any> {
    const res = await fetch(`${API_BASE}/leave-requests/${leaveId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update leave request status');
    return res.json();
  },

  async getPayroll(): Promise<PayrollRecord[]> {
    const res = await fetch(`${API_BASE}/payroll`);
    if (!res.ok) throw new Error('Failed to fetch payroll records');
    return res.json();
  },
};

