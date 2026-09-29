import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CompleterComparison } from '../types';
import { Users } from 'lucide-react';

interface Props {
  data: CompleterComparison[];
  title?: string;
  subtitle?: string;
}

export const CompleterComparisonChart: React.FC<Props> = ({
  data,
  title = "Visualization 1 — Completer vs Non-Completer Behavior",
  subtitle = "Direct comparison of behavioral indicators between students who completed vs dropped out"
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Primary Visual 1
            </span>
            <h3 className="text-base font-semibold text-white">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Users className="w-4 h-4" />
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 25 }}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis 
              dataKey="feature" 
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis 
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const compVal = payload[0]?.value;
                  const nonCompVal = payload[1]?.value;
                  const item = data.find(d => d.feature === label);
                  return (
                    <div className="rounded-lg bg-slate-950/95 border border-slate-700 p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
                      <div className="font-bold text-white border-b border-slate-800 pb-1">{label}</div>
                      <div className="flex items-center justify-between gap-4 text-emerald-400">
                        <span>Completed:</span>
                        <span className="font-mono font-semibold">{compVal}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-rose-400">
                        <span>Not Completed:</span>
                        <span className="font-mono font-semibold">{nonCompVal}</span>
                      </div>
                      {item && (
                        <div className="pt-1 border-t border-slate-800 flex justify-between gap-4 text-cyan-400 font-medium">
                          <span>Relative Gap:</span>
                          <span className="font-mono">+{item.relative_diff_pct}%</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
            />
            <Bar 
              dataKey="completers_avg" 
              name="Completed Learners" 
              fill="#10B981" 
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="non_completers_avg" 
              name="Non-Completed Learners" 
              fill="#F43F5E" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-slate-800/80">
        {data.map((item, idx) => (
          <div key={idx} className="p-2 rounded bg-slate-800/40 text-center border border-slate-800">
            <div className="text-[10px] text-slate-400 truncate">{item.feature}</div>
            <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
              +{item.relative_diff_pct}%
            </div>
            <div className="text-[9px] text-slate-400">Completer Lead</div>
          </div>
        ))}
      </div>
    </div>
  );
};
