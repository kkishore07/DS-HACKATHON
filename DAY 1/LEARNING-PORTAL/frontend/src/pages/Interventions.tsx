import React, { useEffect, useState } from 'react';
import {
  LifeBuoy,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  Video,
  FileText,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Eye,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { InterventionCenterData, InterventionItem } from '../types';
import { KPICard } from '../components/KPICard';
import { LoadingSkeleton, CardSkeleton } from '../components/LoadingSkeleton';

interface Props {
  onSelectLearner: (learnerId: string) => void;
}

export const Interventions: React.FC<Props> = ({ onSelectLearner }) => {
  const [data, setData] = useState<InterventionCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [actionFeedback, setActionFeedback] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchInterventions();
  }, [selectedCategory, selectedPriority]);

  const fetchInterventions = async () => {
    setLoading(true);
    try {
      const res = await api.getInterventions({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        priority: selectedPriority !== 'all' ? selectedPriority : undefined,
        limit: 50
      });
      setData(res);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleTakeAction = async (item: InterventionItem, actionText: string) => {
    setActionFeedback(prev => ({ ...prev, [item.id]: 'Dispatching...' }));
    try {
      await api.takeInterventionAction(item.learner_id, actionText);
      setActionFeedback(prev => ({ ...prev, [item.id]: actionText }));
    } catch {
      setActionFeedback(prev => ({ ...prev, [item.id]: 'Failed' }));
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

  const categoryMeta: Record<string, { icon: any; color: string; desc: string }> = {
    'Re-engagement': { icon: RefreshCw, color: 'text-indigo-400', desc: 'Targeted login incentives & schedule reminders' },
    'Video Support': { icon: Video, color: 'text-emerald-400', desc: 'Shortened 3-5 min lessons & resume bookmarks' },
    'Quiz Support': { icon: Sparkles, color: 'text-cyan-400', desc: 'Low-stakes formative practice quizzes' },
    'Assignment Support': { icon: FileText, color: 'text-amber-400', desc: 'Step-by-step project guides & deadline extensions' },
    'Community Engagement': { icon: MessageSquare, color: 'text-purple-400', desc: 'Peer study circles & forum prompt challenges' },
    'Academic Outreach': { icon: UserCheck, color: 'text-rose-400', desc: 'Direct 1-on-1 academic success advisor calls' }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Urgent Intervention': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High Priority': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Medium Priority': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Action-Oriented Retention Hub</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">Learner Intervention Center</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Turn predictive insights into targeted learner-support actions. Interventions are determined by rule-based pedagogical workflows paired with ML risk prioritization.
        </p>
      </div>

      {/* Top KPIs (Section 44) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Urgent Interventions"
          value={data.urgent_count.toLocaleString()}
          subtitle="Priority Score: 80–100 pts"
          icon={AlertTriangle}
          color="rose"
          trend="Immediate Action"
          trendPositive={false}
          tooltip="Calculated Priority = Dropout Risk * Engagement Gap. Urgent learners require same-day contact."
        />

        <KPICard
          title="High Priority"
          value={data.high_count.toLocaleString()}
          subtitle="Priority Score: 60–79 pts"
          icon={LifeBuoy}
          color="amber"
          trend="Priority Queue"
          trendPositive={false}
        />

        <KPICard
          title="Medium Priority"
          value={data.medium_count.toLocaleString()}
          subtitle="Priority Score: 35–59 pts"
          icon={Clock}
          color="cyan"
          trend="Nudge Automation"
          trendPositive={true}
        />

        <KPICard
          title="Low Priority / Monitored"
          value={data.low_count.toLocaleString()}
          subtitle="Priority Score: 0–34 pts"
          icon={CheckCircle}
          color="emerald"
          trend="Self-Directed"
          trendPositive={true}
        />
      </div>

      {/* Intervention Categories Cards (Section 44) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Targeted Support Categories</h2>
          <span className="text-xs text-slate-400">Click any category to filter the intervention queue</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(data.categories).map(([cat, count]) => {
            const meta = categoryMeta[cat] || { icon: LifeBuoy, color: 'text-indigo-400', desc: 'Support category' };
            const Icon = meta.icon;
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();

            return (
              <div
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{cat}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{meta.desc}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-base font-bold text-white">{count.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 block">Learners</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 45: Prioritized Intervention Queue */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              Live Prioritized Intervention Queue
            </h2>
            <p className="text-xs text-slate-400">
              Ranked in descending order by Intervention Priority = Dropout Risk × Engagement Gap.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3">
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                Clear Category Filter ({selectedCategory})
              </button>
            )}

            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Priorities</option>
                <option value="Urgent Intervention">Urgent Intervention</option>
                <option value="High Priority">High Priority</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Learner</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Dropout Risk</th>
                  <th className="py-3 px-4">Priority Score</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Behavioral Gap</th>
                  <th className="py-3 px-4">Recommended Support Workflow</th>
                  <th className="py-3 px-4 text-right">Dispatch Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {data.queue.map((item) => {
                  const status = actionFeedback[item.id] || item.status;
                  const isDispatched = status !== 'Pending';

                  return (
                    <tr 
                      key={item.id}
                      onClick={() => onSelectLearner(item.learner_id)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {item.learner_id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{item.course_id}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{item.course_name}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-400">
                        {Math.round(item.dropout_probability * 100)}%
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getPriorityBadge(item.priority_level)}`}>
                          {item.priority_score} pts
                        </span>
                      </td>
                      <td className="py-3 px-4 text-indigo-300 font-semibold text-[11px]">
                        {item.category}
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs truncate">
                        {item.gap_summary}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] max-w-sm truncate">
                        {item.recommended_action}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleTakeAction(item, 'Triggered Nudge')}
                            disabled={isDispatched}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                              isDispatched
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25'
                            }`}
                          >
                            {isDispatched ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Send className="w-3 h-3" />}
                            <span>{status}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
