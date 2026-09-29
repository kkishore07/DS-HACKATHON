import React from 'react';
import { LucideIcon } from 'lucide-react';
import { TooltipHelp } from './TooltipHelp';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';
  trend?: string;
  trendPositive?: boolean;
  tooltip?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  trend,
  trendPositive = true,
  tooltip
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      text: 'text-indigo-400',
      glow: 'shadow-[0_0_20px_rgba(99,102,241,0.12)]',
      gradient: 'from-indigo-500/10 to-transparent'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.12)]',
      gradient: 'from-emerald-500/10 to-transparent'
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.12)]',
      gradient: 'from-amber-500/10 to-transparent'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.12)]',
      gradient: 'from-rose-500/10 to-transparent'
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.12)]',
      gradient: 'from-cyan-500/10 to-transparent'
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.12)]',
      gradient: 'from-purple-500/10 to-transparent'
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`relative overflow-hidden rounded-xl border ${scheme.border} bg-slate-900/70 p-5 ${scheme.glow} backdrop-blur-md transition-all duration-200 hover:scale-[1.01] hover:border-slate-600`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${scheme.gradient} rounded-bl-full pointer-events-none`} />
      
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
            {tooltip && <TooltipHelp content={tooltip} title={title} />}
          </div>
          <div className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight text-white font-mono">
            {value}
          </div>
        </div>

        <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.border} border ${scheme.text} shadow-inner`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`font-semibold ${trendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
