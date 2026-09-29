import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Activity,
  AlertTriangle,
  LifeBuoy,
  Cpu,
  UploadCloud,
  Sparkles,
  Database
} from 'lucide-react';

interface SidebarProps {
  onOpenUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenUpload }) => {
  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard, badge: null },
    { to: '/learners', label: 'Learner Intelligence', icon: Users, badge: '25k' },
    { to: '/courses', label: 'Course Intelligence', icon: BookOpen, badge: '20' },
    { to: '/engagement', label: 'Engagement Analysis', icon: Activity, badge: null },
    { to: '/risk', label: 'Dropout Risk', icon: AlertTriangle, badge: 'ML' },
    { to: '/interventions', label: 'Intervention Center', icon: LifeBuoy, badge: 'Action' },
    { to: '/model', label: 'Model Performance', icon: Cpu, badge: 'RF' }
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950/90 flex flex-col justify-between h-screen sticky top-0 backdrop-blur-xl z-30 select-none">
      <div>
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                LearnPulse <span className="text-indigo-400 font-mono text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">AI</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-tight">
                Dropout Intelligence Platform
              </div>
            </div>
          </div>
        </div>

        {/* Demo Mode Badge */}
        <div className="mx-4 mt-3 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[11px]">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dataset Mode Active</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Synthetic EdTech Learner Cohort (25,000 Records)
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Upload action & footer */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <button
          onClick={onOpenUpload}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/60 text-xs font-semibold transition-all hover:border-indigo-500/40"
        >
          <UploadCloud className="w-4 h-4 text-indigo-400" />
          <span>Upload Custom CSV</span>
        </button>

        <div className="text-[10px] text-slate-500 text-center">
          LearnPulse AI v1.0.0 • Production Ready
        </div>
      </div>
    </aside>
  );
};
