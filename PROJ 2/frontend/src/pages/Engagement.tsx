import React, { useEffect, useState } from 'react';
import {
  Activity,
  Layers,
  TrendingDown,
  Sparkles,
  Zap,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { EngagementPageData } from '../types';
import { KPICard } from '../components/KPICard';
import { CompleterComparisonChart } from '../components/CompleterComparisonChart';
import { EngagementDropOffChart } from '../components/EngagementDropOffChart';
import { LoadingSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import { TooltipHelp } from '../components/TooltipHelp';

export const Engagement: React.FC = () => {
  const [data, setData] = useState<EngagementPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngagementData();
  }, []);

  const fetchEngagementData = async () => {
    setLoading(true);
    try {
      const res = await api.getEngagement();
      setData(res);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 space-y-6">
        <CardSkeleton />
        <LoadingSkeleton rows={4} height="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Activity className="w-3.5 h-3.5" />
          <span>Behavioral Analytics Suite</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">Learner Engagement Intelligence</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Multi-dimensional composite scoring across 5 behavioral channels: Login, Video, Quiz, Assignment, and Discussion activity.
        </p>
      </div>

      {/* Engagement Levels Distribution KPIs (Section 13 & 40) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Overall Engagement"
          value={data.average_engagement}
          subtitle="Cohort weighted average"
          icon={Sparkles}
          color="indigo"
          tooltip="Composite formula: 0.25*Login + 0.25*Video + 0.20*Quiz + 0.20*Assignment + 0.10*Discussion"
        />

        <KPICard
          title="Low (0–30 pts)"
          value={`${data.level_percentages['Low Engagement'] || 0}%`}
          subtitle={`${(data.level_counts['Low Engagement'] || 0).toLocaleString()} learners`}
          icon={TrendingDown}
          color="rose"
          trend="Critical Dropout Zone"
          trendPositive={false}
        />

        <KPICard
          title="Moderate (31–60)"
          value={`${data.level_percentages['Moderate Engagement'] || 0}%`}
          subtitle={`${(data.level_counts['Moderate Engagement'] || 0).toLocaleString()} learners`}
          icon={Activity}
          color="amber"
          trend="Intervention Window"
          trendPositive={true}
        />

        <KPICard
          title="High (61–80)"
          value={`${data.level_percentages['High Engagement'] || 0}%`}
          subtitle={`${(data.level_counts['High Engagement'] || 0).toLocaleString()} learners`}
          icon={Layers}
          color="cyan"
          trend="Healthy Progress"
          trendPositive={true}
        />

        <KPICard
          title="Very High (81–100)"
          value={`${data.level_percentages['Very High Engagement'] || 0}%`}
          subtitle={`${(data.level_counts['Very High Engagement'] || 0).toLocaleString()} learners`}
          icon={Zap}
          color="emerald"
          trend="Likely Completers"
          trendPositive={true}
        />
      </div>

      {/* Visual 1: Completer vs Non-Completer */}
      <CompleterComparisonChart
        data={data.completer_vs_non_completer}
        title="Completer vs Non-Completer Behavioral Divergence"
        subtitle="Comparing average behavior of students who persisted to completion vs those who dropped out"
      />

      {/* Section 41: Early Engagement Section */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Major Differentiator
              </span>
              <h2 className="text-base font-bold text-white">
                Early Engagement Predicts Course Completion
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Can we identify future dropouts before they disengage? Comparing completion rates across early engagement index quintiles (calculated during the initial 20–30% course window).
            </p>
          </div>

          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Bands Table & Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {data.early_engagement_bands.map((band) => (
            <div
              key={band.band}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                  <span>Band: {band.band}</span>
                  <span className="font-mono text-[11px] text-slate-500">{band.learners.toLocaleString()} students</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {band.completion_rate}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Completion Rate</div>
              </div>

              {/* Progress bar visual */}
              <div className="mt-4 space-y-1.5">
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      band.completion_rate >= 75 ? 'bg-emerald-500' :
                      band.completion_rate >= 50 ? 'bg-cyan-500' :
                      band.completion_rate >= 30 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${band.completion_rate}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>Dropout: {band.non_completion_rate}%</span>
                  <span>Completed: {band.completion_rate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-cyan-300">Empirical Early Trajectory Finding: </span>
            Learners in the lowest 0–20 early engagement quintile achieve only{' '}
            <strong className="text-white underline">{data.early_engagement_bands[0]?.completion_rate}%</strong> completion,
            compared to{' '}
            <strong className="text-white underline">{data.early_engagement_bands[data.early_engagement_bands.length - 1]?.completion_rate}%</strong> for the 81–100 quintile.
            This demonstrates that early behavioral friction is strongly predictive of eventual non-completion, giving instructors a valuable window to intervene.
          </div>
        </div>
      </div>

      {/* Engagement Drop-off Curve (Visual 2) & Decay Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EngagementDropOffChart
            data={data.drop_off_stages}
            majorStage={data.major_disengagement_stage}
            title="Dropout Stage Progression Curve (Stages 1 to 5)"
            subtitle="Stage-by-stage cohort retention demonstrating where momentum is lost"
          />
        </div>

        {/* Section 17: Engagement Decay Rate */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Decay Dynamics
              </span>
              <h3 className="text-base font-semibold text-white">Engagement Decay Rate</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Formula: <code className="text-indigo-300 font-mono text-[11px]">Initial (Stage 1) - Later (Stage 5)</code>.
              Categorizing persistence vs progressive disengagement across course modules.
            </p>

            <div className="space-y-3 mt-5">
              {Object.entries(data.decay_distribution).map(([tier, count]) => {
                const total = Object.values(data.decay_distribution).reduce((a, b) => a + b, 0);
                const pct = Math.round((count / (total || 1)) * 100);
                const isRapid = tier.includes('Rapid');
                const isMod = tier.includes('Moderate');

                return (
                  <div key={tier} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-semibold ${isRapid ? 'text-rose-400' : isMod ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {tier}
                      </span>
                      <span className="font-mono font-bold text-white">{count.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isRapid ? 'bg-rose-500' : isMod ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            Rapid decline learners exhibit early module completion but experience steep engagement loss before final capstones.
          </div>
        </div>
      </div>
    </div>
  );
};
