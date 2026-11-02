import React from 'react';
import { DollarSign, Moon, Award } from 'lucide-react';
import { PayrollRecord } from '../types';

interface PayrollIncentivesProps {
  payroll: PayrollRecord[];
}

export const PayrollIncentives: React.FC<PayrollIncentivesProps> = ({ payroll }) => {
  const totalDisbursed = payroll.reduce((sum, p) => sum + p.net_pay, 0);
  const totalNightDiff = payroll.reduce((sum, p) => sum + p.night_allowance, 0);
  const totalIncentives = payroll.reduce((sum, p) => sum + p.quality_incentive, 0);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Payroll & 24/7 Shift Differential Calculator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated calculations including base hours, 15% graveyard night differentials, and QA performance bonuses.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
          <span className="text-slate-400">Pay Period:</span>
          <span className="font-mono text-sky-400 font-semibold">Cycle-Nov-A (Semi-Monthly)</span>
        </div>
      </div>

      {/* High-Level Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Cycle Payout (Net)</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              ${totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Synthetic payroll batch</div>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-400/40" />
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Night Differential Paid</div>
            <div className="text-2xl font-bold text-purple-400 mt-1">
              ${totalNightDiff.toFixed(2)}
            </div>
            <div className="text-[11px] text-purple-400/80 mt-0.5">+15% for Graveyard shifts</div>
          </div>
          <Moon className="w-8 h-8 text-purple-400/40" />
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">QA & SLA Quality Bonuses</div>
            <div className="text-2xl font-bold text-sky-400 mt-1">
              ${totalIncentives.toFixed(2)}
            </div>
            <div className="text-[11px] text-sky-400/80 mt-0.5">Performance-linked incentives</div>
          </div>
          <Award className="w-8 h-8 text-sky-400/40" />
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-800/60 border-b border-slate-700/80 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Disbursement Register</h3>
          <span className="text-xs text-slate-400 font-mono">100% Mock Synthetic Calculations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/40 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">Employee</th>
                <th className="py-3 px-4 font-semibold">Base Hours</th>
                <th className="py-3 px-4 font-semibold">Night Diff Hrs</th>
                <th className="py-3 px-4 font-semibold">Base Salary</th>
                <th className="py-3 px-4 font-semibold">Night Allowance</th>
                <th className="py-3 px-4 font-semibold">QA Bonus</th>
                <th className="py-3 px-4 font-semibold">Deductions</th>
                <th className="py-3 px-4 font-semibold">Net Pay</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payroll.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-medium text-slate-200">
                    <div>{p.employee_name || p.employee_id}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.employee_id}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">{p.base_hours}h</td>
                  <td className="py-3 px-4 font-mono text-purple-300">
                    {p.night_diff_hours > 0 ? `${p.night_diff_hours}h` : '-'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">${p.base_salary.toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono text-purple-400 font-medium">
                    {p.night_allowance > 0 ? `+$${p.night_allowance.toFixed(2)}` : '$0.00'}
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-medium">
                    {p.quality_incentive > 0 ? `+$${p.quality_incentive.toFixed(2)}` : '$0.00'}
                  </td>
                  <td className="py-3 px-4 font-mono text-rose-400">-${p.deductions.toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-300 text-sm">
                    ${p.net_pay.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        p.status === 'Processed'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
