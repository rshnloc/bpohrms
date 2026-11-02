import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export const PrivacyBadge: React.FC = () => {
  return (
    <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm text-emerald-200 shadow-lg backdrop-blur">
      <div className="flex items-center space-x-3">
        <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-emerald-300">Strict Privacy & Synthetic Data Mode:</span>{' '}
          <span className="text-emerald-300/80">
            Zero PII, zero live credentials, and zero confidential materials. All metrics, names, and contact records (+1-555-01xx) are completely synthetic.
          </span>
        </div>
      </div>
      <div className="hidden lg:flex items-center space-x-2 bg-emerald-900/40 px-3 py-1 rounded-md text-emerald-300 text-xs border border-emerald-500/30">
        <Lock className="w-3.5 h-3.5" />
        <span>Demo Environment Active</span>
      </div>
    </div>
  );
};
