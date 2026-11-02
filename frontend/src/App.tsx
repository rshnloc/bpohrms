import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
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
  AgentState,
} from './types';
import { Navbar } from './components/Navbar';
import { PrivacyBadge } from './components/PrivacyBadge';
import { LiveFloorMonitor } from './components/LiveFloorMonitor';
import { RosterPlanner } from './components/RosterPlanner';
import { EmployeeDirectory } from './components/EmployeeDirectory';
import { CampaignManager } from './components/CampaignManager';
import { QAScorecards } from './components/QAScorecards';
import { AttendanceManager } from './components/AttendanceManager';
import { PayrollIncentives } from './components/PayrollIncentives';
import { AlertCircle, Headphones } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('floor');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [agents, setAgents] = useState<LiveFloorAgent[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [evaluations, setEvaluations] = useState<QAEvaluation[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [
        statsData,
        agentsData,
        employeesData,
        campaignsData,
        rosterData,
        attendanceData,
        evalData,
        leaveData,
        payrollData,
      ] = await Promise.all([
        api.getOverview(),
        api.getLiveFloor(),
        api.getEmployees(),
        api.getCampaigns(),
        api.getRoster(),
        api.getAttendance(),
        api.getQAEvaluations(),
        api.getLeaveRequests(),
        api.getPayroll(),
      ]);

      setStats(statsData);
      setAgents(agentsData);
      setEmployees(employeesData);
      setCampaigns(campaignsData);
      setRoster(rosterData);
      setAttendance(attendanceData);
      setEvaluations(evalData);
      setLeaveRequests(leaveData);
      setPayroll(payrollData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with backend service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Optional floor refresh every 15s to simulate live telemetry
    const interval = setInterval(() => {
      api.getOverview().then(setStats).catch(() => {});
      api.getLiveFloor().then(setAgents).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleUpdateState = async (employeeId: string, newState: AgentState) => {
    await api.updateAgentState(employeeId, newState);
    // Refresh agents & overview
    const [updatedAgents, updatedOverview] = await Promise.all([
      api.getLiveFloor(),
      api.getOverview(),
    ]);
    setAgents(updatedAgents);
    setStats(updatedOverview);
  };

  const handleRequestSwap = async (rosterId: number, requestedCode: string) => {
    await api.requestSwap(rosterId, requestedCode);
    const updatedRoster = await api.getRoster();
    setRoster(updatedRoster);
  };

  const handleCreateEmployee = async (empData: Partial<Employee>) => {
    await api.createEmployee(empData);
    const [updatedEmps, updatedAgents, updatedOverview] = await Promise.all([
      api.getEmployees(),
      api.getLiveFloor(),
      api.getOverview(),
    ]);
    setEmployees(updatedEmps);
    setAgents(updatedAgents);
    setStats(updatedOverview);
  };

  const handleCreateCampaign = async (campData: Partial<Campaign>) => {
    await api.createCampaign(campData);
    const updatedCamps = await api.getCampaigns();
    setCampaigns(updatedCamps);
  };

  const handlePunch = async (employeeId: string, punchType: 'IN' | 'OUT') => {
    await api.punchAttendance(employeeId, punchType);
    const [updatedAtt, updatedAgents, updatedOverview] = await Promise.all([
      api.getAttendance(),
      api.getLiveFloor(),
      api.getOverview(),
    ]);
    setAttendance(updatedAtt);
    setAgents(updatedAgents);
    setStats(updatedOverview);
  };

  const handleCreateQA = async (qaData: any) => {
    await api.createQAEvaluation(qaData);
    const updatedQA = await api.getQAEvaluations();
    setEvaluations(updatedQA);
  };

  const handleCreateLeave = async (leaveData: any) => {
    await api.createLeaveRequest(leaveData);
    const updatedLeaves = await api.getLeaveRequests();
    setLeaveRequests(updatedLeaves);
  };

  const handleUpdateLeaveStatus = async (leaveId: number, status: 'Approved' | 'Rejected') => {
    await api.updateLeaveStatus(leaveId, status);
    const updatedLeaves = await api.getLeaveRequests();
    setLeaveRequests(updatedLeaves);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-xl shadow-sky-500/20 animate-pulse">
          <Headphones className="w-6 h-6" />
        </div>
        <div className="text-white font-semibold text-base">Loading NexPulse Operations Suite...</div>
        <div className="text-slate-400 text-xs mt-1">Booting synthetic telemetry & database models</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-sky-500 selection:text-white">
      <Navbar stats={stats} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Synthetic Privacy Banner */}
        <PrivacyBadge />

        {error && (
          <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-4 flex items-center justify-between text-rose-300 text-xs shadow-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700/60"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dynamic Tab Views */}
        {activeTab === 'floor' && (
          <LiveFloorMonitor
            agents={agents}
            campaigns={campaigns}
            onUpdateState={handleUpdateState}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'roster' && (
          <RosterPlanner
            roster={roster}
            onRequestSwap={handleRequestSwap}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeDirectory
            employees={employees}
            campaigns={campaigns}
            onCreateEmployee={handleCreateEmployee}
          />
        )}

        {activeTab === 'campaigns' && (
          <CampaignManager
            campaigns={campaigns}
            onCreateCampaign={handleCreateCampaign}
          />
        )}

        {activeTab === 'qa' && (
          <QAScorecards
            evaluations={evaluations}
            employees={employees}
            onCreateEvaluation={handleCreateQA}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceManager
            attendance={attendance}
            leaveRequests={leaveRequests}
            employees={employees}
            onPunch={handlePunch}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
            onCreateLeaveRequest={handleCreateLeave}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'payroll' && <PayrollIncentives payroll={payroll} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NexPulse BPO Command Center & HRMS Platform (Python FastAPI + TypeScript React)</span>
          <span className="text-slate-600">
            Fictional Sandboxed Environment • 100% Synthetic Data • Zero PII
          </span>
        </div>
      </footer>
    </div>
  );
};
