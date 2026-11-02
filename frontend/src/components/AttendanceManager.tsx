import React, { useState } from 'react';
import { Clock, Check, X, LogIn, LogOut, Calendar, PlusCircle } from 'lucide-react';
import { AttendanceRecord, LeaveRequest, Employee } from '../types';

interface AttendanceManagerProps {
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  employees: Employee[];
  onPunch: (employeeId: string, punchType: 'IN' | 'OUT') => Promise<void>;
  onUpdateLeaveStatus: (leaveId: number, status: 'Approved' | 'Rejected') => Promise<void>;
  onCreateLeaveRequest: (data: any) => Promise<void>;
  onRefresh: () => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  attendance,
  leaveRequests,
  employees,
  onPunch,
  onUpdateLeaveStatus,
  onCreateLeaveRequest,
  onRefresh,
}) => {
  const [selectedAgentForPunch, setSelectedAgentForPunch] = useState<string>(
    employees[0]?.id || 'EMP-1001'
  );
  const [punching, setPunching] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  const [leaveForm, setLeaveForm] = useState({
    employee_id: employees[0]?.id || 'EMP-1001',
    leave_type: 'Casual Leave',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reason: 'Personal family occasion',
  });

  const handlePunch = async (punchType: 'IN' | 'OUT') => {
    setPunching(true);
    try {
      await onPunch(selectedAgentForPunch, punchType);
      onRefresh();
    } finally {
      setPunching(false);
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLeave(true);
    try {
      await onCreateLeaveRequest(leaveForm);
      setShowLeaveModal(false);
      onRefresh();
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  const statusColors: Record<string, string> = {
    Present: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
    Late: 'bg-amber-950/60 text-amber-400 border-amber-500/30',
    Absent: 'bg-red-950/60 text-red-400 border-red-500/30',
    'Half-Day': 'bg-purple-950/60 text-purple-400 border-purple-500/30',
    'On-Leave': 'bg-sky-950/60 text-sky-400 border-sky-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header and Punch Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-white">Attendance & Time Management</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated punch clocking, shift adherence tracking, late punches, and overtime hours.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-800 items-center justify-between">
            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Apply Leave Request</span>
            </button>
            <div className="text-xs text-slate-500">
              Shift Grace Period: <span className="text-slate-300 font-medium">10 mins</span>
            </div>
          </div>
        </div>

        {/* Biometric / Web Clock Simulator */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Web Clock Punch Terminal
            </span>
            <div className="mt-2">
              <label className="block text-[11px] text-slate-400 mb-1">Select Employee ID:</label>
              <select
                value={selectedAgentForPunch}
                onChange={(e) => setSelectedAgentForPunch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name} ({e.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              disabled={punching}
              onClick={() => handlePunch('IN')}
              className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/30 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Punch IN</span>
            </button>

            <button
              disabled={punching}
              onClick={() => handlePunch('OUT')}
              className="py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-rose-600/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Punch OUT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leave Approval Queue */}
      <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Leave Approvals & Time-Off Queue</h3>
          </div>
          <span className="text-xs text-slate-400">
            Pending: {leaveRequests.filter((l) => l.status === 'Pending').length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {leaveRequests.map((lr) => (
            <div
              key={lr.id}
              className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 flex items-start justify-between text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{lr.employee_name || lr.employee_id}</span>
                  <span className="text-slate-500">({lr.employee_id})</span>
                </div>
                <div className="text-sky-300 font-medium">
                  {lr.leave_type} • {lr.start_date} to {lr.end_date}
                </div>
                <div className="text-slate-400 text-[11px] italic">"{lr.reason}"</div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    lr.status === 'Approved'
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                      : lr.status === 'Rejected'
                      ? 'bg-red-950/60 text-red-400 border-red-500/40'
                      : 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                  }`}
                >
                  {lr.status}
                </span>

                {lr.status === 'Pending' && (
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onUpdateLeaveStatus(lr.id, 'Approved')}
                      className="p-1.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/30"
                      title="Approve"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdateLeaveStatus(lr.id, 'Rejected')}
                      className="p-1.5 rounded bg-red-950 hover:bg-red-900 text-red-400 border border-red-500/30"
                      title="Reject"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Punch Logs */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-800/60 border-b border-slate-700/80 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Recent Shift Punch Logs</h3>
          <span className="text-xs text-slate-400">{attendance.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">Agent</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Punch In</th>
                <th className="py-3 px-4 font-semibold">Punch Out</th>
                <th className="py-3 px-4 font-semibold">Total Hours</th>
                <th className="py-3 px-4 font-semibold">Overtime</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {attendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-medium text-slate-200">
                    <div>{rec.full_name || rec.employee_id}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{rec.employee_id}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{rec.work_date}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400">{rec.punch_in || '--:--'}</td>
                  <td className="py-3 px-4 font-mono text-rose-400">{rec.punch_out || '--:--'}</td>
                  <td className="py-3 px-4 font-mono text-slate-200">{rec.total_hours} hrs</td>
                  <td className="py-3 px-4 font-mono text-sky-400">
                    {rec.overtime_hours > 0 ? `+${rec.overtime_hours} hrs` : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        statusColors[rec.status] || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-sky-400">
                <Calendar className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Submit Leave Request</h3>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Employee</label>
                <select
                  value={leaveForm.employee_id}
                  onChange={(e) => setLeaveForm({ ...leaveForm, employee_id: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Leave Type</label>
                <select
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Comp-off">Comp-off (Overtime replacement)</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Reason</label>
                <textarea
                  rows={2}
                  required
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium shadow-md"
                >
                  {isSubmittingLeave ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
