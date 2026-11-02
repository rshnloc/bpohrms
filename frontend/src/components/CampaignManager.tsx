import React, { useState } from 'react';
import { Headphones, PlusCircle, CheckCircle, Target, Users, Zap, Award } from 'lucide-react';
import { Campaign } from '../types';

interface CampaignManagerProps {
  campaigns: Campaign[];
  onCreateCampaign: (camp: Partial<Campaign>) => Promise<void>;
}

export const CampaignManager: React.FC<CampaignManagerProps> = ({
  campaigns,
  onCreateCampaign,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    id: `CAMP-${Math.floor(100 + Math.random() * 900)}`,
    name: 'Horizon Digital Support',
    client_code: 'CLI-SYNTH-HRZ',
    channel_type: 'Inbound Voice & Chat',
    target_sla: 94.0,
    target_aht_seconds: 300,
    target_csat: 4.5,
    head_count: 24,
    lead_name: 'Synthetic Lead Cameron P.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateCampaign(form);
      setShowModal(false);
      setForm({
        id: `CAMP-${Math.floor(100 + Math.random() * 900)}`,
        name: 'Horizon Digital Support',
        client_code: 'CLI-SYNTH-HRZ',
        channel_type: 'Inbound Voice & Chat',
        target_sla: 94.0,
        target_aht_seconds: 300,
        target_csat: 4.5,
        head_count: 24,
        lead_name: 'Synthetic Lead Cameron P.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Headphones className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Campaigns & Client Process Manager</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Contractual SLAs, channel distribution, and headcount allocation across active client programs.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/30 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Synthetic Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-md space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
                  {camp.id} • {camp.client_code}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{camp.name}</h3>
                <span className="text-xs text-slate-400">{camp.channel_type}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Active Process</span>
              </span>
            </div>

            {/* SLA Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center space-x-1">
                  <Target className="w-3.5 h-3.5 text-sky-400" />
                  <span>Target SLA Compliance</span>
                </span>
                <span className="font-bold text-sky-300">{camp.target_sla}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-sky-500 to-emerald-400 h-2 rounded-full"
                  style={{ width: `${Math.min(100, camp.target_sla)}%` }}
                ></div>
              </div>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs pt-2 border-t border-slate-800">
              <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px] flex items-center justify-center space-x-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Target AHT</span>
                </div>
                <div className="font-mono font-bold text-white text-sm mt-1">
                  {Math.floor(camp.target_aht_seconds / 60)}m {camp.target_aht_seconds % 60}s
                </div>
              </div>

              <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px] flex items-center justify-center space-x-1">
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span>Target CSAT</span>
                </div>
                <div className="font-mono font-bold text-white text-sm mt-1">
                  {camp.target_csat.toFixed(1)} / 5.0
                </div>
              </div>

              <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px] flex items-center justify-center space-x-1">
                  <Users className="w-3 h-3 text-sky-400" />
                  <span>Seats / Headcount</span>
                </div>
                <div className="font-mono font-bold text-white text-sm mt-1">
                  {camp.head_count} Agents
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex justify-between items-center pt-2 border-t border-slate-800/60">
              <span>Account Lead: <strong className="text-slate-400">{camp.lead_name}</strong></span>
              <span className="font-mono text-slate-600">Strict SLA Tier-1</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-sky-400">
                <PlusCircle className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Add Synthetic Client Campaign</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Campaign ID</label>
                  <input
                    type="text"
                    required
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Client Code</label>
                  <input
                    type="text"
                    required
                    value={form.client_code}
                    onChange={(e) => setForm({ ...form, client_code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Channel Type</label>
                <select
                  value={form.channel_type}
                  onChange={(e) => setForm({ ...form, channel_type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Inbound Voice">Inbound Voice</option>
                  <option value="Blended Tier-2">Blended Tier-2</option>
                  <option value="Omni-channel Chat">Omni-channel Chat</option>
                  <option value="Back-Office / Ops">Back-Office / Ops</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Target SLA (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.target_sla}
                    onChange={(e) => setForm({ ...form, target_sla: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target AHT (sec)</label>
                  <input
                    type="number"
                    value={form.target_aht_seconds}
                    onChange={(e) => setForm({ ...form, target_aht_seconds: parseInt(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target CSAT</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.target_csat}
                    onChange={(e) => setForm({ ...form, target_csat: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Headcount Allocated</label>
                  <input
                    type="number"
                    value={form.head_count}
                    onChange={(e) => setForm({ ...form, head_count: parseInt(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Account Lead</label>
                  <input
                    type="text"
                    value={form.lead_name}
                    onChange={(e) => setForm({ ...form, lead_name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium shadow-md"
                >
                  {isSubmitting ? 'Adding...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

