import React, { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  CheckCircle,
  Activity,
  AlertTriangle,
  LifeBuoy,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { OverviewData, CourseItem, DropoutStageDrop, FeatureImportanceItem } from '../types';
import { KPICard } from '../components/KPICard';
import { AlertPanel } from '../components/AlertPanel';
import { CompleterComparisonChart } from '../components/CompleterComparisonChart';
import { EngagementDropOffChart } from '../components/EngagementDropOffChart';
import { CourseScatterChart } from '../components/CourseScatterChart';
import { FeatureImportanceChart } from '../components/FeatureImportanceChart';
import { LoadingSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import { Link } from 'react-router-dom';

interface Props {
  onSelectCourse: (courseId: string) => void;
}

export const Overview: React.FC<Props> = ({ onSelectCourse }) => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [stages, setStages] = useState<DropoutStageDrop[]>([]);
  const [features, setFeatures] = useState<FeatureImportanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const [overviewRes, coursesRes, engagementRes, featuresRes] = await Promise.all([
        api.getOverview(),
        api.getCourses(),
        api.getEngagement(),
        api.getModelFeatures()
      ]);
      setData(overviewRes);
      setCourses(coursesRes);
      setStages(engagementRes.drop_off_stages);
      setFeatures(featuresRes);
      setLoading(false);
    } catch (err) {
      console.error("Error loading overview data:", err);
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-slate-800 rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-slate-800 rounded w-1/3 animate-pulse"></div>
        </div>
        <CardSkeleton />
        <LoadingSkeleton rows={4} height="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Intelligence Command Center
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
            Learner Success Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Detect disengagement early. Understand why learners drop out. Intervene before they leave.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/interventions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <span>Intervention Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Learners"
          value={data.total_learners.toLocaleString()}
          subtitle="Enrolled active records"
          icon={Users}
          color="indigo"
          tooltip="Total distinct learner-course enrollments in current dataset."
        />

        <KPICard
          title="Total Courses"
          value={data.total_courses}
          subtitle="Cohort & self-paced"
          icon={BookOpen}
          color="purple"
          tooltip="Total distinct active courses monitored on platform."
        />

        <KPICard
          title="Completion Rate"
          value={`${data.completion_rate}%`}
          subtitle={`Non-completion: ${data.non_completion_rate}%`}
          icon={CheckCircle}
          color="emerald"
          trend={`${data.completion_rate >= 50 ? 'Healthy' : 'Sub-50%'}`}
          trendPositive={data.completion_rate >= 50}
          tooltip="Percentage of learners who successfully achieved course completion."
        />

        <KPICard
          title="Avg Engagement"
          value={data.average_engagement}
          subtitle="Scale: 0 – 100 pts"
          icon={Activity}
          color="cyan"
          tooltip="Project-defined composite measure of learner activity across login (25%), video (25%), quiz (20%), assignment (20%), and discussion (10%)."
        />

        <KPICard
          title="At-Risk Learners"
          value={data.at_risk_learners.toLocaleString()}
          subtitle={`${data.at_risk_percentage}% of total cohort`}
          icon={AlertTriangle}
          color="amber"
          trend="Action Required"
          trendPositive={false}
          tooltip="Learners classified as High or Critical dropout probability by the Random Forest model."
        />

        <KPICard
          title="Critical Interventions"
          value={data.critical_intervention_learners.toLocaleString()}
          subtitle={`${data.critical_intervention_percentage}% urgent queue`}
          icon={LifeBuoy}
          color="rose"
          trend="High Priority"
          trendPositive={false}
          tooltip="Learners where both dropout probability and engagement deficit are severely elevated, maximizing intervention utility."
        />
      </div>

      {/* Operational Alerts */}
      <AlertPanel alerts={data.operational_alerts} />

      {/* Primary Visualizations 1 & 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompleterComparisonChart 
          data={data.completer_vs_non_completer}
          title="Visualization 1 — Completer vs Non-Completer Behavior"
          subtitle="Observing behavioral divergence: where non-completers fall behind"
        />

        <EngagementDropOffChart 
          data={stages}
          majorStage={data.disengagement_point}
          title="Visualization 2 — Engagement Drop-Off Curve"
          subtitle={`Tracking learner disengagement across lifecycle (Major Drop: ${data.disengagement_point})`}
        />
      </div>

      {/* Primary Visualizations 3 & 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CourseScatterChart 
          data={courses}
          onCourseClick={onSelectCourse}
          title="Visualization 3 — Course Completion vs Engagement"
          subtitle="Analyzing course health: Low Completion + Low Engagement structures"
        />

        <FeatureImportanceChart 
          data={features}
          title="Visualization 4 — Random Forest Feature Importance"
          subtitle="Relative contribution of behavioral features to completion prediction"
        />
      </div>

      {/* Dynamic Key Insights (Section 66) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Automated Intelligence Engine
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Evidence-Based Key Strategic Insights
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {data.dynamic_insights.length} Empirical Findings Generated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.dynamic_insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-5 rounded-xl border bg-slate-900/80 backdrop-blur-md flex flex-col justify-between transition-all hover:border-slate-600 ${
                insight.type === 'critical' ? 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.08)]' :
                insight.type === 'warning' ? 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.08)]' :
                insight.type === 'success' ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)]' :
                'border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.08)]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    insight.type === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    insight.type === 'warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    insight.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {insight.type} signal
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {insight.title}
                </h3>

                <div className="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="font-semibold text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Empirical Evidence:</span>
                  {insight.evidence}
                </div>

                <div className="text-xs text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-300">Business Impact: </span>
                  {insight.business_meaning}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-start gap-2 text-xs font-medium text-indigo-300">
                <span className="font-bold text-indigo-400 shrink-0">Action:</span>
                <span>{insight.recommended_action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
