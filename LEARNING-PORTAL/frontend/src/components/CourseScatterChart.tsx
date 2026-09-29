import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { CourseItem } from '../types';
import { BookOpen, Layers } from 'lucide-react';

interface Props {
  data: CourseItem[];
  onCourseClick?: (courseId: string) => void;
  title?: string;
  subtitle?: string;
}

export const CourseScatterChart: React.FC<Props> = ({
  data,
  onCourseClick,
  title = "Visualization 3 — Course Completion vs Engagement",
  subtitle = "Evaluating curriculum structures (X: Avg Engagement, Y: Completion Rate, Bubble: Enrollment)"
}) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Healthy': return '#10B981';
      case 'High Risk': return '#F43F5E';
      default: return '#F59E0B'; // Watch
    }
  };

  const scatterData = data.map(c => ({
    ...c,
    x: c.avg_engagement,
    y: c.completion_rate,
    z: c.learners
  }));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Primary Visual 3
            </span>
            <h3 className="text-base font-semibold text-white">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Watch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">High Risk</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 15, right: 30, bottom: 25, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Engagement Score" 
              domain={[30, 80]}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
              label={{ value: 'Average Engagement Score', position: 'insideBottom', offset: -10, fill: '#64748B', fontSize: 11 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Completion Rate" 
              domain={[30, 80]}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
              label={{ value: 'Completion Rate (%)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748B', fontSize: 11 }}
            />
            <ZAxis type="number" dataKey="z" range={[80, 450]} name="Learners" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as (CourseItem & { x: number; y: number; z: number });
                  return (
                    <div className="rounded-lg bg-slate-950/95 border border-slate-700 p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
                      <div className="font-bold text-white border-b border-slate-800 pb-1 flex justify-between items-center gap-3">
                        <span>{pt.course_name}</span>
                        <span className="font-mono text-[10px] text-slate-400">{pt.course_id}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-300">
                        <span>Completion Rate:</span>
                        <span className="font-mono font-semibold text-emerald-400">{pt.completion_rate}%</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-300">
                        <span>Avg Engagement:</span>
                        <span className="font-mono font-semibold text-indigo-400">{pt.avg_engagement}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-300">
                        <span>Learners Enrolled:</span>
                        <span className="font-mono font-semibold text-cyan-400">{pt.learners.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-300 pt-1 border-t border-slate-800">
                        <span>Classification:</span>
                        <span className={`font-semibold ${
                          pt.risk_classification === 'Healthy' ? 'text-emerald-400' :
                          pt.risk_classification === 'High Risk' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {pt.risk_classification}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter 
              name="Courses" 
              data={scatterData} 
              onClick={(pt: any) => onCourseClick && pt?.course_id && onCourseClick(pt.course_id)}
              className="cursor-pointer"
            >
              {scatterData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getRiskColor(entry.risk_classification)} 
                  fillOpacity={0.8}
                  stroke="#FFFFFF"
                  strokeWidth={1}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
        <span>* Bubble size reflects enrolled learner count. Click any bubble to view course intelligence.</span>
        <span className="font-medium text-slate-300">{data.length} Courses Analyzed</span>
      </div>
    </div>
  );
};
