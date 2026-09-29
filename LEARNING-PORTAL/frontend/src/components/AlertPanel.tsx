import React from 'react';
import { AlertTriangle, ChevronRight, ShieldAlert } from 'lucide-react';

interface AlertPanelProps {
  alerts: string[];
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300">
          Operational Intelligence Alerts
        </h3>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {alerts.length} Active Signals
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {alerts.map((alert, idx) => (
          <div 
            key={idx}
            className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 hover:border-amber-500/40 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">
              {alert.replace(/^[⚠\s]+/, '')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
