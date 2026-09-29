import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { DropoutStageDrop } from '../types';
import { TrendingDown, AlertOctagon } from 'lucide-react';

interface Props {
  data: DropoutStageDrop[];
  majorStage?: string;
  title?: string;
  subtitle?: string;
}

export const EngagementDropOffChart: React.FC<Props> = ({
  data,
  majorStage,
  title = "Visualization 2 — Engagement Drop-Off Curve",
  subtitle = "Progression of learner engagement across course lifecycle (Stages 1 to 5)"
}) => {
  const majorDropItem = data.find(d => d.is_major_drop) || data[2];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Primary Visual 2
            </span>
            <h3 className="text-base font-semibold text-white">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>

        {majorDropItem && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold shrink-0">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>Major Drop: {majorDropItem.stage_name} (-{majorDropItem.drop_from_previous} pts)</span>
          </div>
        )}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 15, right: 30, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorNonComp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis 
              dataKey="stage" 
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = data.find(d => d.stage === label);
                  return (
                    <div className="rounded-lg bg-slate-950/95 border border-slate-700 p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
                      <div className="font-bold text-white border-b border-slate-800 pb-1">
                        {item ? item.stage_name : label}
                      </div>
                      <div className="flex items-center justify-between gap-4 text-emerald-400">
                        <span>Completers:</span>
                        <span className="font-mono font-semibold">{payload[1]?.value} pts</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-indigo-400">
                        <span>Overall Average:</span>
                        <span className="font-mono font-semibold">{payload[0]?.value} pts</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-rose-400">
                        <span>Non-Completers:</span>
                        <span className="font-mono font-semibold">{payload[2]?.value} pts</span>
                      </div>
                      {item && item.drop_from_previous > 0 && (
                        <div className="pt-1 border-t border-slate-800 text-amber-400 font-medium">
                          Drop from previous stage: -{item.drop_from_previous} pts
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
            {majorDropItem && (
              <ReferenceLine 
                x={majorDropItem.stage} 
                stroke="#F43F5E" 
                strokeDasharray="4 4" 
                label={{ value: 'Major Drop', fill: '#F43F5E', fontSize: 11, position: 'top' }}
              />
            )}
            <Area 
              type="monotone" 
              dataKey="avg_engagement" 
              name="Overall Average" 
              stroke="#6366F1" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorAvg)" 
            />
            <Area 
              type="monotone" 
              dataKey="completers_engagement" 
              name="Completers Curve" 
              stroke="#10B981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorComp)" 
            />
            <Area 
              type="monotone" 
              dataKey="non_completers_engagement" 
              name="Non-Completers Curve" 
              stroke="#F43F5E" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorNonComp)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 p-3 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <TrendingDown className="w-4 h-4 text-rose-400" />
          <span>Stage 1 (Onboarding) → Stage 5 (Capstone Completion) Total Decay:</span>
        </div>
        <div className="font-mono font-bold text-rose-400">
          {data.length >= 2 ? `${roundVal(data[0].avg_engagement - data[data.length - 1].avg_engagement)} pts decline` : 'Calculating...'}
        </div>
      </div>
    </div>
  );
};

function roundVal(n: number): number {
  return Math.round(n * 10) / 10;
}
