import React, { useState, useEffect } from 'react';
import { Headphones, Activity, Users, Clock, ShieldAlert } from 'lucide-react';
import { OverviewStats } from '../types';

interface NavbarProps {
  stats: OverviewStats | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ stats, activeTab, setActiveTab }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'floor', label: 'Live Floor Ops', icon: Activity },
    { id: 'roster', label: 'Roster & Shifts', icon: Clock },
    { id: 'employees', label: 'Workforce & HR', icon: Users },
    { id: 'campaigns', label: 'Campaigns & SLA', icon: Headphones },
    { id: 'qa', label: 'QA Scorecards', icon: ShieldAlert },
    { id: 'attendance', label: 'Time & Leave', icon: Clock },
    { id: 'payroll', label: 'Payroll & Allowances', icon: Activity },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">NexPulse</span>
                <span className="text-xs bg-sky-500/20 text-sky-400 font-semibold px-2 py-0.5 rounded border border-sky-500/30">
                  BPO & HRMS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Workforce Management & Operations Floor</p>
            </div>
          </div>

          {/* Real-time Ticker */}
          <div className="hidden md:flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">Shift Clock:</span>
              <span className="font-mono text-slate-200 font-medium">{time}</span>
            </div>

            {stats && (
              <div className="flex items-center space-x-4">
                <div className="bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400">On Floor:</span>{' '}
                  <span className="font-bold text-sky-400">{stats.active_on_floor}</span>
                  <span className="text-slate-500">/{stats.total_headcount}</span>
                </div>
                <div className="bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400">Occupancy:</span>{' '}
                  <span className="font-bold text-emerald-400">{stats.occupancy_rate}%</span>
                </div>
                <div className="bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400">Avg CSAT:</span>{' '}
                  <span className="font-bold text-amber-400">{stats.avg_csat} / 5.0</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto pb-2 pt-1 border-t border-slate-800/60 text-sm no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-150 ${
                  active
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

