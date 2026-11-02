import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, PlusCircle, CheckCircle, Award, MessageSquare } from 'lucide-react';
import { QAEvaluation, Employee } from '../types';

interface QAScorecardsProps {
  evaluations: QAEvaluation[];
  employees: Employee[];
  onCreateEvaluation: (data: any) => Promise<void>;
}

export const QAScorecards: React.FC<QAScorecardsProps> = ({
  evaluations,
  employees,
  onCreateEvaluation,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    call_id: `CALL-SYNTH-${Math.floor(1000 + Math.random() * 9000)}`,
    employee_id: employees[0]?.id || 'EMP-1001',
    auditor_name: 'Synthetic QA Specialist',
    greeting_score: 14.0,
    empathy_score: 23.0,
    accuracy_score: 33.0,
    compliance_score: 25.0,
    fatal_error: 0,
    feedback_notes: 'Consistent call flow. Excellent verification steps and clear resolution summary given.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateEvaluation(form);
      setShowModal(false);
      setForm({
        call_id: `CALL-SYNTH-${Math.floor(1000 + Math.random() * 9000)}`,
        employee_id: employees[0]?.id || 'EMP-1001',
        auditor_name: 'Synthetic QA Specialist',
        greeting_score: 14.0,
        empathy_score: 23.0,
        accuracy_score: 33.0,
        compliance_score: 25.0,
        fatal_error: 0,
        feedback_notes: 'Consistent call flow. Excellent verification steps and clear resolution summary given.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgQualityScore =
    evaluations.length > 0
      ? (evaluations.reduce((sum, e) => sum + e.total_score, 0) / evaluations.length).toFixed(1)
      : '0.0';

  const fatalCount = evaluations.filter((e) => e.fatal_error === 1).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Quality Assurance (QA) & Scorecards</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rubric-based transaction audits, fatal error tracking, and agent coaching calibration.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/30 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Audit Synthetic Interaction</span>
        </button>
      </div>

      {/* High-Level Quality Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Audits Completed</div>
            <div className="text-2xl font-bold text-white mt-1">{evaluations.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Synthetic evaluations</div>
          </div>
          <Award className="w-8 h-8 text-sky-400/40" />
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Average QA Score</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{avgQualityScore}%</div>
            <div className="text-[11px] text-emerald-500/80 mt-0.5">Floor target: 85.0%</div>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-400/40" />
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Zero-Tolerance Fatal Errors</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{fatalCount}</div>
            <div className="text-[11px] text-amber-500/80 mt-0.5">PCI/Security non-adherence</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-400/40" />
        </div>
      </div>

      {/* Evaluations List */}
      <div className="space-y-4">
        {evaluations.map((ev) => (
          <div
            key={ev.id}
            className={`bg-slate-900/70 border rounded-xl p-5 transition-all hover:border-slate-700 shadow-md ${
              ev.fatal_error ? 'border-red-500/40' : 'border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
                  {ev.call_id}
                </span>
                <span className="font-semibold text-white text-sm">
                  {ev.employee_name || ev.employee_id}
                </span>
                <span className="text-xs text-slate-500">({ev.employee_id})</span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400">Date: {ev.evaluation_date}</span>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    ev.fatal_error
                      ? 'bg-red-950/60 text-red-400 border-red-500/40'
                      : ev.total_score >= 90
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                      : 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                  }`}
                >
                  {ev.fatal_error ? 'FATAL (0%)' : `${ev.total_score.toFixed(1)}%`}
                </div>
              </div>
            </div>

            {/* Rubric Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
              <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[11px]">Greeting (Max 15)</span>
                <div className="font-mono font-bold text-white mt-0.5">{ev.greeting_score} pts</div>
              </div>
              <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[11px]">Empathy (Max 25)</span>
                <div className="font-mono font-bold text-white mt-0.5">{ev.empathy_score} pts</div>
              </div>
              <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[11px]">Accuracy (Max 35)</span>
                <div className="font-mono font-bold text-white mt-0.5">{ev.accuracy_score} pts</div>
              </div>
              <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[11px]">Compliance (Max 25)</span>
                <div className="font-mono font-bold text-white mt-0.5">{ev.compliance_score} pts</div>
              </div>
            </div>

            {/* Feedback Notes */}
            <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-800/60 text-xs text-slate-300 flex items-start space-x-2">
              <MessageSquare className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">QA Feedback & Coaching Notes: </span>
                <span>{ev.feedback_notes}</span>
                <span className="block text-[11px] text-slate-500 mt-1">Evaluated by: {ev.auditor_name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal to Audit Interaction */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-sky-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">New QA Transaction Audit</h3>
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
                  <label className="block text-slate-400 mb-1">Call / Ticket ID</label>
                  <input
                    type="text"
                    required
                    value={form.call_id}
                    onChange={(e) => setForm({ ...form, call_id: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Agent Being Audited</label>
                  <select
                    value={form.employee_id}
                    onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Auditor Name</label>
                <input
                  type="text"
                  required
                  value={form.auditor_name}
                  onChange={(e) => setForm({ ...form, auditor_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Greeting & Verification (0 - 15)</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={form.greeting_score}
                    onChange={(e) => setForm({ ...form, greeting_score: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Empathy & Listening (0 - 25)</label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    step="0.5"
                    value={form.empathy_score}
                    onChange={(e) => setForm({ ...form, empathy_score: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Accuracy & Resolution (0 - 35)</label>
                  <input
                    type="number"
                    min="0"
                    max="35"
                    step="0.5"
                    value={form.accuracy_score}
                    onChange={(e) => setForm({ ...form, accuracy_score: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Compliance & Disclaimers (0 - 25)</label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    step="0.5"
                    value={form.compliance_score}
                    onChange={(e) => setForm({ ...form, compliance_score: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-red-300">Fatal Non-Compliance Event</div>
                  <div className="text-[11px] text-red-400/80">Forces audit result directly to 0%</div>
                </div>
                <input
                  type="checkbox"
                  checked={form.fatal_error === 1}
                  onChange={(e) => setForm({ ...form, fatal_error: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 text-red-600 rounded bg-slate-800 border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Coaching Feedback</label>
                <textarea
                  rows={2}
                  required
                  value={form.feedback_notes}
                  onChange={(e) => setForm({ ...form, feedback_notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
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
                  {isSubmitting ? 'Submitting...' : 'Save Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

