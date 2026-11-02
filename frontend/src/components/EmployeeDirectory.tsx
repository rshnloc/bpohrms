import React, { useState } from 'react';
import { Users, UserPlus, Search, Mail, Phone } from 'lucide-react';
import { Employee, Campaign } from '../types';

interface EmployeeDirectoryProps {
  employees: Employee[];
  campaigns: Campaign[];
  onCreateEmployee: (emp: Partial<Employee>) => Promise<void>;
}

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({
  employees,
  campaigns,
  onCreateEmployee,
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [campaignFilter, setCampaignFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New employee form state (pre-filled with synthetic non-PII defaults)
  const [form, setForm] = useState({
    id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    full_name: 'Synthetic Agent (Demo)',
    email: `agent.${Math.floor(1000 + Math.random() * 9000)}@pulse-bpo.internal`,
    role: 'Customer Support Agent',
    department: 'Operations',
    campaign_id: campaigns[0]?.id || 'CAMP-101',
    shift_name: 'Morning (06:00-15:00)',
    hourly_rate: 19.5,
    phone: `+1-555-01${Math.floor(10 + Math.random() * 89)}`,
    seat_number: 'FLR2-BAY-E10',
  });

  const roles = Array.from(new Set(employees.map((e) => e.role)));

  const filtered = employees.filter((emp) => {
    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
    const matchesCampaign = campaignFilter === 'ALL' || emp.campaign_id === campaignFilter;
    const matchesSearch =
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.seat_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesCampaign && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateEmployee(form);
      setShowAddModal(false);
      // reset form
      setForm({
        id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        full_name: 'Synthetic Agent (Demo)',
        email: `agent.${Math.floor(1000 + Math.random() * 9000)}@pulse-bpo.internal`,
        role: 'Customer Support Agent',
        department: 'Operations',
        campaign_id: campaigns[0]?.id || 'CAMP-101',
        shift_name: 'Morning (06:00-15:00)',
        hourly_rate: 19.5,
        phone: `+1-555-01${Math.floor(10 + Math.random() * 89)}`,
        seat_number: 'FLR2-BAY-E10',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Workforce & Talent Directory</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Centralized headcount roster with process assignments, seat bays, and synthetic credentials.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/30 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard Synthetic Agent</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search name, ID, seat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="ALL">All Roles ({employees.length})</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="ALL">All Campaign Deployments</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((emp) => {
          const camp = campaigns.find((c) => c.id === emp.campaign_id);

          return (
            <div
              key={emp.id}
              className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all hover:shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{emp.full_name}</h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-mono text-xs text-sky-400 font-semibold">{emp.id}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">{emp.department}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-300">
                  {emp.role}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Campaign:</span>
                  <span className="text-slate-300 font-medium">{camp ? camp.name : 'Shared Ops'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Shift Pattern:</span>
                  <span className="text-slate-300 font-medium">{emp.shift_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Seat / Bay:</span>
                  <span className="font-mono text-sky-300 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40">
                    {emp.seat_number}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Rate / Hr:</span>
                  <span className="font-semibold text-emerald-400">${emp.hourly_rate.toFixed(2)}/hr</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center space-x-1.5 truncate">
                  <Mail className="w-3 h-3 text-slate-600 flex-shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Phone className="w-3 h-3 text-slate-600 flex-shrink-0" />
                  <span>{emp.phone}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Onboard Synthetic Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-sky-400">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Onboard Synthetic Agent</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Synthetic Name</label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Synthetic Email (@pulse-bpo.internal)</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Customer Support Agent">Customer Support Agent</option>
                    <option value="Technical Support Tier-2">Technical Support Tier-2</option>
                    <option value="Fraud Specialist">Fraud Specialist</option>
                    <option value="Team Leader">Team Leader</option>
                    <option value="Quality Assurance Specialist">Quality Assurance Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Assigned Campaign</label>
                  <select
                    value={form.campaign_id}
                    onChange={(e) => setForm({ ...form, campaign_id: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Shift</label>
                  <select
                    value={form.shift_name}
                    onChange={(e) => setForm({ ...form, shift_name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Morning (06:00-15:00)">Morning (06:00-15:00)</option>
                    <option value="Day (14:00-23:00)">Day (14:00-23:00)</option>
                    <option value="Night/Graveyard (22:00-07:00)">Night/Graveyard (22:00-07:00)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.hourly_rate}
                    onChange={(e) => setForm({ ...form, hourly_rate: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Mock Phone (555-01xx)</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Seat / Bay Number</label>
                  <input
                    type="text"
                    value={form.seat_number}
                    onChange={(e) => setForm({ ...form, seat_number: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium shadow-md"
                >
                  {isSubmitting ? 'Adding...' : 'Onboard Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
