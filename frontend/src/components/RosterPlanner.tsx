import React, { useState } from 'react';
import { Calendar, RefreshCw, ArrowLeftRight, Check } from 'lucide-react';
import { RosterItem } from '../types';

interface RosterPlannerProps {
  roster: RosterItem[];
  onRequestSwap: (rosterId: number, requestedCode: string) => Promise<void>;
  onRefresh: () => void;
}

export const RosterPlanner: React.FC<RosterPlannerProps> = ({
  roster,
  onRequestSwap,
  onRefresh,
}) => {
  const [selectedItem, setSelectedItem] = useState<RosterItem | null>(null);
  const [targetCode, setTargetCode] = useState<string>('MOR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group roster items by employee_id
  const employeeMap = new Map<string, { name: string; shifts: RosterItem[] }>();
  const uniqueDates = Array.from(new Set(roster.map((r) => r.shift_date))).sort();

  roster.forEach((item) => {
    if (!employeeMap.has(item.employee_id)) {
      employeeMap.set(item.employee_id, {
        name: item.full_name || item.employee_id,
        shifts: [],
      });
    }
    employeeMap.get(item.employee_id)!.shifts.push(item);
  });

  const shiftBadgeColors: Record<string, string> = {
    MOR: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    DAY: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    GRA: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    SPL: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    OFF: 'bg-slate-800 text-slate-500 border-slate-700/40',
  };

  const shiftLabels: Record<string, string> = {
    MOR: 'Morning (06:00 - 15:00)',
    DAY: 'Day (14:00 - 23:00)',
    GRA: 'Graveyard (22:00 - 07:00)',
    SPL: 'Split (10:00 - 19:00)',
    OFF: 'Weekly Rest Off',
  };

  const handleSwapSubmit = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await onRequestSwap(selectedItem.id, targetCode);
      setSelectedItem(null);
      onRefresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Workforce Shift & Roster Matrix</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            24/7 Rotational schedule with automated night differential tagging and shift swap coordination.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <span className="font-semibold">MOR</span>
            <span className="text-[11px] text-amber-400/80">06:00-15:00</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300">
            <span className="font-semibold">DAY</span>
            <span className="text-[11px] text-sky-400/80">14:00-23:00</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300">
            <span className="font-semibold">GRA</span>
            <span className="text-[11px] text-purple-400/80">22:00-07:00 (+15% Diff)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300">
            <span className="font-semibold">SPL</span>
            <span className="text-[11px] text-teal-400/80">10:00-19:00</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400">
            <span className="font-semibold">OFF</span>
            <span className="text-[11px] text-slate-500">Rest Day</span>
          </div>
        </div>
      </div>

      {/* Roster Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700/80">
              <th className="py-3 px-4 font-semibold w-56 sticky left-0 bg-slate-800 z-10">
                Agent / Specialist
              </th>
              {uniqueDates.map((d) => (
                <th key={d} className="py-3 px-3 font-semibold text-center min-w-[110px]">
                  <div className="text-white font-medium">
                    {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal">{d.slice(5)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {Array.from(employeeMap.entries()).map(([empId, data]) => (
              <tr key={empId} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                  <div className="font-medium text-slate-200">{data.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{empId}</div>
                </td>
                {uniqueDates.map((dateStr) => {
                  const shift = data.shifts.find((s) => s.shift_date === dateStr);
                  if (!shift) {
                    return (
                      <td key={dateStr} className="p-2 text-center text-slate-600">
                        -
                      </td>
                    );
                  }

                  const badgeClass =
                    shiftBadgeColors[shift.shift_code] || 'bg-slate-800 text-slate-400 border-slate-700';

                  return (
                    <td key={dateStr} className="p-2 text-center">
                      <button
                        onClick={() => {
                          setSelectedItem(shift);
                          setTargetCode(shift.shift_code === 'OFF' ? 'MOR' : 'OFF');
                        }}
                        className={`w-full py-1.5 px-2 rounded-lg border text-center transition-all hover:scale-105 ${badgeClass}`}
                        title={shiftLabels[shift.shift_code] || "Click to edit or swap shift"}
                      >
                        <div className="font-bold tracking-wide">{shift.shift_code}</div>
                        <div className="text-[10px] opacity-75">{shift.start_time}</div>
                        {shift.swap_status === 'Requested' && (
                          <div className="mt-1 text-[9px] font-bold text-amber-400 flex items-center justify-center space-x-1">
                            <ArrowLeftRight className="w-2.5 h-2.5" />
                            <span>Swap Pending</span>
                          </div>
                        )}
                        {shift.swap_status === 'Approved' && (
                          <div className="mt-1 text-[9px] font-bold text-emerald-400 flex items-center justify-center space-x-1">
                            <Check className="w-2.5 h-2.5" />
                            <span>Swapped</span>
                          </div>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shift Swap Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-sky-400">
                <ArrowLeftRight className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Adjust or Swap Shift</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <div className="text-slate-400">Agent:</div>
                <div className="font-semibold text-white text-sm">
                  {selectedItem.full_name || selectedItem.employee_id}
                </div>
                <div className="text-slate-400 mt-2">Scheduled Date:</div>
                <div className="font-mono text-sky-300 font-medium">{selectedItem.shift_date}</div>
                <div className="text-slate-400 mt-2">Current Shift:</div>
                <div className="font-medium text-amber-300">
                  {selectedItem.shift_code} ({selectedItem.start_time} - {selectedItem.end_time})
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Reassign To Shift Type:
                </label>
                <select
                  value={targetCode}
                  onChange={(e) => setTargetCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="MOR">MOR - Morning (06:00 - 15:00)</option>
                  <option value="DAY">DAY - Day (14:00 - 23:00)</option>
                  <option value="GRA">GRA - Graveyard / Night (22:00 - 07:00, +15% Allowance)</option>
                  <option value="SPL">SPL - Split (10:00 - 19:00)</option>
                  <option value="OFF">OFF - Rest Day Off</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSwapSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-md shadow-sky-600/30 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Confirm Shift Change</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
