import React, { useEffect, useState } from 'react';
import {
  Cpu,
  RefreshCw,
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ShieldCheck,
  Info,
  Clock,
  Layers,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import { ModelMetricsData } from '../types';
import { KPICard } from '../components/KPICard';
import { ConfusionMatrix } from '../components/ConfusionMatrix';
import { FeatureImportanceChart } from '../components/FeatureImportanceChart';
import { LoadingSkeleton, CardSkeleton } from '../components/LoadingSkeleton';

export const Model: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainMsg, setRetrainMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchModelMetrics();
  }, []);

  const fetchModelMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getModelMetrics();
      setMetrics(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainMsg(null);
    try {
      const res = await api.retrainModel();
      setMetrics(res.metrics);
      setRetraining(false);
      setRetrainMsg("Model retrained successfully in " + res.metrics.training_time_seconds + "s!");
      setTimeout(() => setRetrainMsg(null), 4000);
    } catch (err) {
      setRetraining(false);
      setRetrainMsg("Retraining failed.");
    }
  };

  if (loading || !metrics) {
    return (
      <div className="p-8 space-y-6">
        <CardSkeleton />
        <LoadingSkeleton rows={4} height="h-64" />
      </div>
    );
  }

  // Top 3 features for explanation
  const topFeatures = [...metrics.feature_importances].slice(0, 3);

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Machine Learning Operations</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Random Forest Model Performance</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Binary classification architecture predicting course completion vs dropout risk with balanced class weighting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {retrainMsg && (
            <span className="text-xs font-medium text-emerald-400 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
              {retrainMsg}
            </span>
          )}

          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Retraining...' : 'Retrain Random Forest'}</span>
          </button>
        </div>
      </div>

      {/* Model Specs Card (Section 46) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Algorithm</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">{metrics.algorithm}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">n_estimators=300, balanced</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Target Variable</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{metrics.target}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Completed / Not Completed</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Training Split (80%)</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">{metrics.training_samples.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Stratified random_state=42</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Testing Split (20%)</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">{metrics.testing_samples.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Independent Holdout</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Training Latency</div>
            <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{metrics.training_time_seconds}s</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Multi-core parallelized</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Last Trained</div>
            <div className="text-xs font-semibold text-slate-300 font-mono mt-0.5 truncate">{metrics.last_trained}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Auto-serialized artifact</div>
          </div>
        </div>
      </div>

      {/* Model Metrics Cards (Section 47) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Most Important Business Metric (Section 26) */}
        <KPICard
          title="Non-Completer Recall"
          value={`${Math.round(metrics.non_completer_recall * 1000) / 10}%`}
          subtitle="Key business objective"
          icon={XCircle}
          color="rose"
          trend="Critical Success Metric"
          trendPositive={true}
          tooltip="Recall for non-completers. Identifying learners who will drop out is paramount for EdTech retention."
        />

        <KPICard
          title="ROC-AUC Score"
          value={metrics.roc_auc}
          subtitle="Area under ROC curve"
          icon={TrendingUp}
          color="indigo"
          trend="Strong Discrimination"
          trendPositive={true}
          tooltip="Discrimination threshold ability across all decision cutoffs."
        />

        <KPICard
          title="Overall Accuracy"
          value={`${Math.round(metrics.accuracy * 1000) / 10}%`}
          subtitle="Balanced test evaluation"
          icon={Award}
          color="emerald"
        />

        <KPICard
          title="F1-Score (Macro)"
          value={metrics.macro_f1}
          subtitle="Harmonic mean of classes"
          icon={Layers}
          color="purple"
        />

        <KPICard
          title="Model Precision"
          value={`${Math.round(metrics.precision * 1000) / 10}%`}
          subtitle="True positive precision"
          icon={ShieldCheck}
          color="cyan"
        />

        <KPICard
          title="Completer Recall"
          value={`${Math.round(metrics.completer_recall * 1000) / 10}%`}
          subtitle="Completed class recall"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Confusion Matrix (Section 48) */}
      <ConfusionMatrix
        data={metrics.confusion_matrix}
        nonCompleterRecall={metrics.non_completer_recall}
        completerRecall={metrics.completer_recall}
      />

      {/* Visual 4: Feature Importance (Section 49) */}
      <FeatureImportanceChart
        data={metrics.feature_importances}
        title="Visualization 4 — Random Forest Feature Importance"
        subtitle="Ranked behavioral predictors derived from Gini impurity reductions"
      />

      {/* Section 50: Model Explanation: What Drives Completion? */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            Model Explainability
          </span>
          <h2 className="text-base font-bold text-white">What Drives Course Completion?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {topFeatures.map((feat, idx) => (
            <div key={feat.feature} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400">Driver #{idx + 1}</span>
                <span className="text-xs font-mono font-bold text-cyan-400">{feat.importance_pct}% Importance</span>
              </div>
              <h3 className="text-sm font-bold text-white">{feat.feature}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>

        {/* Section 68 & 50 Analytical Rule Callout */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3 text-xs text-slate-300">
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <span className="font-bold text-white text-sm block">Core Data Science Analytical Distinction:</span>
            <p>
              These feature importance percentages represent <strong className="text-indigo-300">statistical predictive signals</strong> within the trained Random Forest ensemble, not proof that modifying one isolated behavior in a silo will causally guarantee completion.
            </p>
            <p className="text-slate-400 text-[11px] pt-1">
              For instance, while higher video completion is strongly associated with course completion, learning success is driven by holistic engagement across lecture comprehension, formative quizzes, and project deliverables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
