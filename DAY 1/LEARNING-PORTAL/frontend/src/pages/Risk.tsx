import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Users,
  Eye,
  Send,
  HelpCircle,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { RiskPageData, LearnerItem, CourseItem } from '../types';
import { KPICard } from '../components/KPICard';
import { LoadingSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import { TooltipHelp } from '../components/TooltipHelp';

interface Props {
  onSelectLearner: (learnerId: string) => void;
}

export const Risk: React.FC<Props> = ({ onSelectLearner }) => {
  const [data, setData] = useState<RiskPageData | null>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCourses().then(setCourses).catch(console.error);
  }, []);

  useEffect(() => {
    fetchRiskData();
  }, [selectedCourse]);

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      const res = await api.getDropoutRisk({
        course_id: selectedCourse !== 'all' ? selectedCourse : undefined,
        limit_learners: 30
      });
      setData(res);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 space-y-6">
        <CardSkeleton />
        <LoadingSkeleton rows={5} height="h-64" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Predictive Intelligence Engine</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Dropout Risk Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">
            Identify learners who may need support before they disengage completely using Random Forest probability scoring.
          </p>
        </div>

        {/* Filter by course */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Filter Course:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c.course_id} value={c.course_id}>
                {c.course_id} - {c.course_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards (Section 42) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Critical Risk (81–100%)"
          value={data.critical_count.toLocaleString()}
          subtitle={`${data.critical_pct}% of learners`}
          icon={Flame}
          color="rose"
          trend="Immediate Intervention"
          trendPositive={false}
          tooltip="Random Forest predicted non-completion probability >= 81%. Extreme risk of dropout."
        />

        <KPICard
          title="High Risk (61–80%)"
          value={data.high_count.toLocaleString()}
          subtitle={`${data.high_pct}% of learners`}
          icon={AlertTriangle}
          color="amber"
          trend="Elevated Disengagement"
          trendPositive={false}
          tooltip="Predicted probability of non-completion between 61% and 80%."
        />

        <KPICard
          title="Moderate Risk (31–60%)"
          value={data.moderate_count.toLocaleString()}
          subtitle={`${data.moderate_pct}% of learners`}
          icon={ShieldAlert}
          color="cyan"
          trend="Watch Status"
          trendPositive={true}
          tooltip="Predicted probability of non-completion between 31% and 60%."
        />

        <KPICard
          title="Low Risk (0–30%)"
          value={data.low_count.toLocaleString()}
          subtitle={`${data.low_pct}% of learners`}
          icon={CheckCircle2}
          color="emerald"
          trend="Stable Trajectory"
          trendPositive={true}
          tooltip="Predicted probability of non-completion <= 30%. On track for successful completion."
        />
      </div>

      {/* Section 43: Risk Distribution Histogram / Bands */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Cohort Dropout Risk Distribution</h2>
            <p className="text-xs text-slate-400">Distribution of learners across model-predicted non-completion probabilities</p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            N = {(data.critical_count + data.high_count + data.moderate_count + data.low_count).toLocaleString()} Learners
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {data.risk_distribution.map((bucket, i) => {
            const isHigh = i >= 3;
            const isCritical = i === 4;
            return (
              <div 
                key={bucket.range}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                    <span className="font-semibold">Band {bucket.range}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isCritical ? 'bg-rose-500/20 text-rose-300' :
                      isHigh ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {bucket.percentage}%
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {bucket.count.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Learners</div>
                </div>

                <div className="mt-4 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${bucket.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-Priority Learners Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              High-Priority At-Risk Learners
            </h2>
            <p className="text-xs text-slate-400">
              Learners ranked by composite intervention priority score (combining predicted risk and engagement gap).
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Showing Top {data.high_priority_learners.length}</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Learner</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Dropout Probability</th>
                  <th className="py-3 px-4">Engagement</th>
                  <th className="py-3 px-4">Early Trajectory</th>
                  <th className="py-3 px-4">Main Behavioral Gap</th>
                  <th className="py-3 px-4">Recommended Action</th>
                  <th className="py-3 px-4 text-right">Intervene</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {data.high_priority_learners.map((learner) => (
                  <tr 
                    key={learner.id}
                    onClick={() => onSelectLearner(learner.learner_id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {learner.learner_id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{learner.course_id}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{learner.course_name}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold">
                          {Math.round(learner.dropout_probability * 100)}%
                        </span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {learner.risk_level.replace(' Risk', '')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-indigo-400 font-semibold">
                      {learner.engagement_score}
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-400">
                      {learner.early_engagement_index}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs truncate">
                      {learner.primary_gap}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-sm truncate">
                      {learner.recommended_intervention}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLearner(learner.learner_id);
                        }}
                        className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition-all inline-flex items-center gap-1 text-[11px]"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Action</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
