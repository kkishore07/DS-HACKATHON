import React, { useEffect, useState } from 'react';
import { X, BookOpen, AlertCircle, Users, CheckCircle, TrendingDown, Eye } from 'lucide-react';
import { CourseDetailResponse } from '../types';
import { api } from '../services/api';
import { LoadingSkeleton } from './LoadingSkeleton';

interface Props {
  courseId: string | null;
  onClose: () => void;
  onSelectLearner?: (learnerId: string) => void;
}

export const CourseDetailModal: React.FC<Props> = ({
  courseId,
  onClose,
  onSelectLearner
}) => {
  const [course, setCourse] = useState<CourseDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    api.getCourseDetail(courseId)
      .then(data => {
        setCourse(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [courseId]);

  if (!courseId) return null;

  const getRiskClass = (r: string) => {
    switch (r) {
      case 'Healthy': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'High Risk': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default: return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{course ? course.course_name : courseId}</h3>
                {course && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRiskClass(course.risk_classification)}`}>
                    {course.risk_classification}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {course ? `${course.course_id} • ${course.category} • ${course.level} • ${course.format} (${course.modules} Modules)` : 'Loading course details...'}
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
          {loading || !course ? (
            <LoadingSkeleton rows={5} height="h-20" />
          ) : (
            <>
              {/* Top KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Enrollment</div>
                  <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                    {course.learners.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{course.completer_count} Completers</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Completion Rate</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {course.completion_rate}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{course.non_completer_count} Non-Completers</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Avg Engagement</div>
                  <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                    {course.avg_engagement}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Scale: 0 to 100 pts</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">At-Risk Learners</div>
                  <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                    {course.at_risk_count.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">High/Critical Dropout Risk</div>
                </div>
              </div>

              {/* Behavior Baseline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Course Cohort Behavioral Baselines
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                    <div className="text-xs text-slate-400">Avg Logins</div>
                    <div className="text-base font-bold font-mono text-white mt-1">{course.avg_login_frequency || 11.2}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                    <div className="text-xs text-slate-400">Avg Video</div>
                    <div className="text-base font-bold font-mono text-emerald-400 mt-1">{course.avg_video_completion}%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                    <div className="text-xs text-slate-400">Avg Quizzes</div>
                    <div className="text-base font-bold font-mono text-white mt-1">{course.avg_quiz_attempts}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                    <div className="text-xs text-slate-400">Avg Assignments</div>
                    <div className="text-base font-bold font-mono text-amber-400 mt-1">{course.avg_assignment_submissions}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                    <div className="text-xs text-slate-400">Avg Discussions</div>
                    <div className="text-base font-bold font-mono text-cyan-400 mt-1">{course.avg_discussion_activity}</div>
                  </div>
                </div>
              </div>

              {/* High Risk Learners enrolled in this course */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Enrolled At-Risk Learners ({course.at_risk_count})
                  </h4>
                  <span className="text-[11px] text-slate-400">Showing top 15 highest probability</span>
                </div>

                <div className="rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/70 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Learner ID</th>
                        <th className="p-2.5">Risk %</th>
                        <th className="p-2.5">Engagement</th>
                        <th className="p-2.5">Primary Gap</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {course.high_risk_learners && course.high_risk_learners.length > 0 ? (
                        course.high_risk_learners.map((lnr, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-2.5 font-mono font-medium text-white">{lnr.learner_id}</td>
                            <td className="p-2.5 font-mono font-bold text-rose-400">
                              {Math.round(lnr.dropout_probability * 100)}%
                            </td>
                            <td className="p-2.5 font-mono text-slate-300">{lnr.engagement_score}</td>
                            <td className="p-2.5 text-slate-400 max-w-xs truncate">{lnr.primary_gap}</td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={() => {
                                  onClose();
                                  if (onSelectLearner) onSelectLearner(lnr.learner_id);
                                }}
                                className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] font-medium inline-flex items-center gap-1 transition-all"
                              >
                                <Eye className="w-3 h-3" /> Profile
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-500">
                            No high-risk learners flagged for this course cohort.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
