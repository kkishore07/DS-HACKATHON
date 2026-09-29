import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { FeatureImportanceItem } from '../types';
import { Cpu, Info } from 'lucide-react';

interface Props {
  data: FeatureImportanceItem[];
  title?: string;
  subtitle?: string;
}

export const FeatureImportanceChart: React.FC<Props> = ({
  data,
  title = "Visualization 4 — Random Forest Feature Importance",
  subtitle = "Relative predictive power of behavioral features in determining course completion vs dropout"
}) => {
  // Sort descending and take top 8 for clean presentation
  const sortedData = [...data].sort((a, b) => b.importance - a.importance).slice(0, 8);

  const colors = [
    '#6366F1', '#818CF8', '#A5B4FC', '#38BDF8',
    '#06B6D4', '#2DD4BF', '#10B981', '#34D399'
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Primary Visual 4
            </span>
            <h3 className="text-base font-semibold text-white">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>

        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
          <Cpu className="w-4 h-4" />
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 120, bottom: 15 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
            <XAxis 
              type="number" 
              domain={[0, 'auto']}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
              unit="%"
            />
            <YAxis 
              type="category" 
              dataKey="feature" 
              tick={{ fill: '#E2E8F0', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as FeatureImportanceItem;
                  return (
                    <div className="rounded-lg bg-slate-950/95 border border-slate-700 p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md max-w-xs">
                      <div className="font-bold text-white border-b border-slate-800 pb-1">{item.feature}</div>
                      <div className="flex justify-between gap-4 text-cyan-400 font-semibold">
                        <span>Model Importance:</span>
                        <span className="font-mono">{item.importance_pct}%</span>
                      </div>
                      <div className="text-slate-300 text-[11px] leading-relaxed pt-1">
                        {item.description}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="importance_pct" radius={[0, 4, 4, 0]}>
              {sortedData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Analytical Rule Notice */}
      <div className="mt-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-start gap-2.5 text-xs text-slate-300">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-cyan-300">Analytical Interpretability Note: </span>
          Random Forest feature importance reflects statistical predictive utility in classifying dropout, not direct causal impact. Interventions should combine these signals with pedagogical best practices.
        </div>
      </div>
    </div>
  );
};
