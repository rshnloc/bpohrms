import React, { useState } from 'react';
import {
  PhoneCall,
  Clock,
  CheckCircle2,
  Coffee,
  PowerOff,
  Filter,
  Search,
  RefreshCw,
} from 'lucide-react';
import { LiveFloorAgent, AgentState, Campaign } from '../types';

interface LiveFloorMonitorProps {
  agents: LiveFloorAgent[];
  campaigns: Campaign[];
  onUpdateState: (employeeId: string, state: AgentState) => Promise<void>;
  onRefresh: () => void;
}

export const LiveFloorMonitor: React.FC<LiveFloorMonitorProps> = ({
  agents,
  campaigns,
  onUpdateState,
  onRefresh,
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const stateColors: Record<AgentState, { bg: string; text: string; border: string; dot: string }> = {
    Available: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-500/40', dot: 'bg-emerald-400' },
    'In Call': { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-500/40', dot: 'bg-blue-400' },
    'Wrap Up': { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-500/40', dot: 'bg-amber-400' },
    Break: { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-500/40', dot: 'bg-purple-400' },
    Training: { bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-500/40', dot: 'bg-cyan-400' },
    Offline: { bg: 'bg-slate-900/60', text: 'text-slate-400', border: 'border-slate-700/50', dot: 'bg-slate-500' },
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesCampaign = selectedCampaign === 'ALL' || agent.campaign_id === selectedCampaign;
    const matchesState = selectedState === 'ALL' || agent.current_state === selectedState;
    const matchesSearch =
      agent.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.seat_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCampaign && matchesState && matchesSearch;
  });

  const handleStateChange = async (employeeId: string, newState: AgentState) => {
    try {
      setUpdatingId(employeeId);
      await onUpdateState(employeeId, newState);
    } finally {
      setUpdatingId(null);
    }
  };

  const countByState = (stateName: AgentState) =>
    agents.filter((a) => a.current_state === stateName).length;

  return (
    <div className="space-y-6">
      {/* Top Operations KPI Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setSelectedState('ALL')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedState === 'ALL'
              ? 'bg-slate-800 border-sky-500 ring-1 ring-sky-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-slate-400 font-medium">All Roster Floor</div>
          <div className="text-xl font-bold text-white mt-1">{agents.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Total monitored</div>
        </button>

        <button
          onClick={() => setSelectedState('Available')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedState === 'Available'
              ? 'bg-emerald-950/50 border-emerald-500 ring-1 ring-emerald-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-emerald-400 flex items-center justify-between font-medium">
            <span>Available</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <div className="text-xl font-bold text-emerald-300 mt-1">{countByState('Available')}</div>
          <div className="text-[10px] text-emerald-400/70 mt-0.5">Ready for dispatch</div>
        </button>

        <button
          onClick={() => setSelectedState('In Call')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedState === 'In Call'
              ? 'bg-blue-950/50 border-blue-500 ring-1 ring-blue-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-blue-400 flex items-center justify-between font-medium">
            <span>In Call</span>
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          </div>
          <div className="text-xl font-bold text-blue-300 mt-1">{countByState('In Call')}</div>
          <div className="text-[10px] text-blue-400/70 mt-0.5">Active conversations</div>
        </button>

        <button
          onClick={() => setSelectedState('Wrap Up')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedState === 'Wrap Up'
              ? 'bg-amber-950/50 border-amber-500 ring-1 ring-amber-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-amber-400 flex items-center justify-between font-medium">
            <span>Wrap Up (ACW)</span>
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          </div>
          <div className="text-xl font-bold text-amber-300 mt-1">{countByState('Wrap Up')}</div>
          <div className="text-[10px] text-amber-400/70 mt-0.5">Ticket notes logging</div>
        </button>

        <button
          onClick={() => setSelectedState('Break')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedState === 'Break'
              ? 'bg-purple-950/50 border-purple-500 ring-1 ring-purple-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-purple-400 flex items-center justify-between font-medium">
            <span>Aux / Break</span>
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          </div>
          <div className="text-xl font-bold text-purple-300 mt-1">{countByState('Break')}</div>
          <div className="text-[10px] text-purple-400/70 mt-0.5">Scheduled pause</div>
        </button>

        <button
          onClick={() => setSelectedState('Offline')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedState === 'Offline'
              ? 'bg-slate-800 border-slate-500 ring-1 ring-slate-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-slate-400 flex items-center justify-between font-medium">
            <span>Offline</span>
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
          </div>
          <div className="text-xl font-bold text-slate-300 mt-1">{countByState('Offline')}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Logged out</div>
        </button>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="font-semibold">Filter Campaign:</span>
          </div>
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ALL">All Campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.client_code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search agent ID, name, bay..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder-slate-500"
            />
          </div>
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Refresh Floor"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => {
          const cfg = stateColors[agent.current_state] || stateColors.Offline;
          const isBusy = updatingId === agent.employee_id;

          return (
            <div
              key={agent.employee_id}
              className={`rounded-xl border p-4 bg-slate-900/70 ${cfg.border} transition-all duration-150 hover:shadow-lg relative overflow-hidden`}
            >
              {/* Status color indicator bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${cfg.dot}`} />

              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white text-sm">{agent.full_name}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span className="font-mono text-slate-500">{agent.employee_id}</span>
                    <span>•</span>
                    <span className="text-sky-400">{agent.role}</span>
                  </div>
                </div>

                <div className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center space-x-1.5 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                  <span>{agent.current_state}</span>
                </div>
              </div>

              {/* Campaign and Bay Information */}
              <div className="mt-3 py-2 px-3 rounded-lg bg-slate-800/40 border border-slate-800 text-xs flex justify-between items-center text-slate-300">
                <span className="truncate max-w-[180px] text-slate-400">
                  {agent.campaign_name || 'General Operations'}
                </span>
                <span className="font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                  {agent.seat_number}
                </span>
              </div>

              {/* Agent KPIs */}
              <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-800/30 p-2 rounded-lg border border-slate-800/60">
                  <div className="text-slate-500 text-[10px]">Time in State</div>
                  <div className="font-mono font-medium text-slate-200 mt-0.5">{agent.state_started_at}</div>
                </div>
                <div className="bg-slate-800/30 p-2 rounded-lg border border-slate-800/60">
                  <div className="text-slate-500 text-[10px]">Calls Today</div>
                  <div className="font-mono font-medium text-sky-400 mt-0.5">{agent.calls_handled_today}</div>
                </div>
                <div className="bg-slate-800/30 p-2 rounded-lg border border-slate-800/60">
                  <div className="text-slate-500 text-[10px]">Avg AHT</div>
                  <div className="font-mono font-medium text-slate-200 mt-0.5">
                    {Math.floor(agent.avg_handle_time_sec / 60)}m {agent.avg_handle_time_sec % 60}s
                  </div>
                </div>
                <div className="bg-slate-800/30 p-2 rounded-lg border border-slate-800/60">
                  <div className="text-slate-500 text-[10px]">CSAT</div>
                  <div className="font-mono font-medium text-amber-400 mt-0.5">
                    {agent.csat_score.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Interactive State Toggle Buttons (Simulate floor manager or agent actions) */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">Quick State Switch:</span>
                <div className="flex items-center space-x-1">
                  <button
                    disabled={isBusy || agent.current_state === 'Available'}
                    onClick={() => handleStateChange(agent.employee_id, 'Available')}
                    className="p-1 rounded bg-slate-800 hover:bg-emerald-950 hover:text-emerald-400 text-slate-400 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    title="Set Available"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={isBusy || agent.current_state === 'In Call'}
                    onClick={() => handleStateChange(agent.employee_id, 'In Call')}
                    className="p-1 rounded bg-slate-800 hover:bg-blue-950 hover:text-blue-400 text-slate-400 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    title="Simulate In-Call"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={isBusy || agent.current_state === 'Wrap Up'}
                    onClick={() => handleStateChange(agent.employee_id, 'Wrap Up')}
                    className="p-1 rounded bg-slate-800 hover:bg-amber-950 hover:text-amber-400 text-slate-400 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    title="Set Wrap Up (ACW)"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={isBusy || agent.current_state === 'Break'}
                    onClick={() => handleStateChange(agent.employee_id, 'Break')}
                    className="p-1 rounded bg-slate-800 hover:bg-purple-950 hover:text-purple-400 text-slate-400 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    title="Set Break / Aux"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={isBusy || agent.current_state === 'Offline'}
                    onClick={() => handleStateChange(agent.employee_id, 'Offline')}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    title="Log Off"
                  >
                    <PowerOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800">
          <p className="text-slate-400 text-sm">No agents match the selected campaign or state filter.</p>
        </div>
      )}
    </div>
  );
};
