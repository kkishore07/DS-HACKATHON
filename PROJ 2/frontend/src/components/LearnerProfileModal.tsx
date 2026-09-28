import React, { useEffect, useState } from 'react';
import { X, User, BookOpen, AlertTriangle, CheckCircle, Clock, Award, ArrowUpRight, Send } from 'lucide-react';
import { LearnerDetail } from '../types';
import { api } from '../services/api';
import { LoadingSkeleton } from './LoadingSkeleton';

interface Props {
  learnerId: string | null;
  onClose: () => void;
  onActionTriggered?: (learnerId: string, action: string) => void;
}

export const LearnerProfileModal: React.FC<Props> = ({
  learnerId,
  onClose,
  onActionTriggered
}) => {
  const [learner, setLearner] = useState<LearnerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!learnerId) return;
    setLoading(true);
    api.getLearnerDetail(learnerId)
      .then(data => {
        setLearner(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [learnerId]);

  if (!learnerId) return null;

  const handleAction = async (action: string) => {
    setActionStatus("Dispatching...");
    try {
      await api.takeInterventionAction(learnerId, action);
      setActionStatus(action);
      if (onActionTriggered) onActionTriggered(learnerId, action);
    } catch {
      setActionStatus("Failed");
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Critical Risk': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High Risk': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Moderate Risk': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-mono">{learnerId}</h3>
                {learner && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRiskBadge(learner.risk_level)}`}>
                    {learner.risk_level}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {learner ? `${learner.course_name} (${learner.course_id})` : 'Loading profile...'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {loading || !learner ? (
            <LoadingSkeleton rows={5} height="h-20" />
          ) : (
            <>
              {/* Primary Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Predicted Dropout Risk</div>
                  <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                    {Math.round(learner.dropout_probability * 100)}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Random Forest Probability</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Engagement Score</div>
                  <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                    {learner.engagement_score}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Course Cohort Avg: {learner.course_average_engagement}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Early Engagement</div>
                  <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                    {learner.early_engagement_index}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Initial 20-30% Window</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Completion Status</div>
                  <div className={`text-xl font-bold mt-1.5 ${learner.completion_status === 'Completed' ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {learner.completion_status}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Observed Record</div>
                </div>
              </div>

              {/* Behavioral Indicators Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Behavioral Activity Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Logins</div>
                    <div className="text-lg font-mono font-bold text-white mt-1">{learner.login_frequency}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Course: {learner.course_average_login}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Video Progress</div>
                    <div className="text-lg font-mono font-bold text-emerald-400 mt-1">{learner.video_completion}%</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Course: {learner.course_average_video}%</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Quiz Attempts</div>
                    <div className="text-lg font-mono font-bold text-white mt-1">{learner.quiz_attempts}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Formative Quizzes</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Assignments</div>
                    <div className="text-lg font-mono font-bold text-amber-400 mt-1">{learner.assignment_submissions}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Graded Projects</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Discussions</div>
                    <div className="text-lg font-mono font-bold text-cyan-400 mt-1">{learner.discussion_activity}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Community Posts</div>
                  </div>
                </div>
              </div>

              {/* Behavioral Diagnosis Section */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2.5">
                  <AlertTriangle className="w-4 h-4" />
                  Empirical Behavioral Diagnosis
                </div>
                <div className="space-y-2">
                  {learner.behavioral_diagnosis && learner.behavioral_diagnosis.length > 0 ? (
                    learner.behavioral_diagnosis.map((diag, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{diag}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400">
                      Behavior metrics demonstrate balanced progress across syllabus milestones.
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Intervention */}
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    Targeted Intervention Plan
                  </div>
                  <div className="text-xs text-slate-200 font-medium">
                    {learner.recommended_intervention}
                  </div>
                  <div className="text-[10px] text-indigo-300/80">
                    Priority Score: {learner.intervention_priority}/100 ({learner.priority_level})
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAction("Re-engagement Email Sent")}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {actionStatus || "Deploy Intervention"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
