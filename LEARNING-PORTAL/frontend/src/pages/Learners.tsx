import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { LearnerItem, PaginatedLearnersResponse, CourseItem } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { TooltipHelp } from '../components/TooltipHelp';

interface Props {
  onSelectLearner: (learnerId: string) => void;
}

export const Learners: React.FC<Props> = ({ onSelectLearner }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedLearnersResponse | null>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCourse, setSelectedCourse] = useState(searchParams.get('course') || 'all');
  const [selectedCompletion, setSelectedCompletion] = useState(searchParams.get('status') || 'all');
  const [selectedRisk, setSelectedRisk] = useState(searchParams.get('risk') || 'all');
  const [selectedEngagement, setSelectedEngagement] = useState(searchParams.get('engagement') || 'all');
  const [sortBy, setSortBy] = useState('highest_risk');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    api.getCourses().then(setCourses).catch(console.error);
  }, []);

  useEffect(() => {
    fetchLearners();
  }, [selectedCourse, selectedCompletion, selectedRisk, selectedEngagement, sortBy, page, limit]);

  const fetchLearners = async () => {
    setLoading(true);
    try {
      const res = await api.getLearners({
        course_id: selectedCourse !== 'all' ? selectedCourse : undefined,
        completion_status: selectedCompletion !== 'all' ? selectedCompletion : undefined,
        risk_level: selectedRisk !== 'all' ? selectedRisk : undefined,
        engagement_level: selectedEngagement !== 'all' ? selectedEngagement : undefined,
        search: searchTerm.trim() ? searchTerm.trim() : undefined,
        sort_by: sortBy,
        page,
        limit
      });
      setData(res);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLearners();
  };

  const handleResetFilters = () => {
    setSelectedCourse('all');
    setSelectedCompletion('all');
    setSelectedRisk('all');
    setSelectedEngagement('all');
    setSearchTerm('');
    setSortBy('highest_risk');
    setPage(1);
  };

  const getRiskClass = (level: string) => {
    switch (level) {
      case 'Critical Risk': return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'High Risk': return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Moderate Risk': return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
      default: return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Learner Intelligence</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {data ? `${data.total.toLocaleString()} Records` : 'Loading...'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Segment, filter, and inspect granular behavioral signals and predicted dropout risk scores.
          </p>
        </div>

        {/* Sorting options */}
        <div className="flex items-center gap-2 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="highest_risk">Highest Dropout Risk</option>
            <option value="lowest_engagement">Lowest Engagement Score</option>
            <option value="lowest_video">Lowest Video Completion</option>
            <option value="lowest_assignments">Lowest Assignments</option>
            <option value="highest_priority">Highest Intervention Priority</option>
            <option value="id_asc">Learner ID (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Learner ID (e.g. LNR-000001) or Course ID..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Course filter */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => { setSelectedCourse(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Courses ({courses.length})</option>
              {courses.map(c => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_id} - {c.course_name}
                </option>
              ))}
            </select>
          </div>

          {/* Completion Status */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Completion Status</label>
            <select
              value={selectedCompletion}
              onChange={(e) => { setSelectedCompletion(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Not Completed">Not Completed</option>
            </select>
          </div>

          {/* Risk Level */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Dropout Risk</label>
            <select
              value={selectedRisk}
              onChange={(e) => { setSelectedRisk(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="Critical Risk">Critical Risk (&gt;80%)</option>
              <option value="High Risk">High Risk (61–80%)</option>
              <option value="Moderate Risk">Moderate Risk (31–60%)</option>
              <option value="Low Risk">Low Risk (0–30%)</option>
            </select>
          </div>

          {/* Engagement Level */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Engagement Level</label>
            <select
              value={selectedEngagement}
              onChange={(e) => { setSelectedEngagement(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Engagement Levels</option>
              <option value="Low Engagement">Low (0–30)</option>
              <option value="Moderate Engagement">Moderate (31–60)</option>
              <option value="High Engagement">High (61–80)</option>
              <option value="Very High Engagement">Very High (81–100)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton rows={8} height="h-14" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No learners match current filters"
          description="Try broadening your course, risk, or engagement parameters, or resetting search keywords."
          onReset={handleResetFilters}
        />
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Learner ID</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">
                    Engagement
                    <TooltipHelp content="Composite score: 0.25*Login + 0.25*Video + 0.20*Quiz + 0.20*Assignment + 0.10*Discussion" />
                  </th>
                  <th className="py-3 px-4">
                    Early Index
                    <TooltipHelp content="Early trajectory proxy within initial 20–30% course window" />
                  </th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">
                    Dropout Risk
                    <TooltipHelp content="Random Forest predicted probability of non-completion" />
                  </th>
                  <th className="py-3 px-4">Primary Gap</th>
                  <th className="py-3 px-4">Intervention</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {data.items.map((learner) => (
                  <tr 
                    key={learner.id}
                    onClick={() => onSelectLearner(learner.learner_id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {learner.learner_id}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="font-semibold text-white">{learner.course_id}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{learner.course_name}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="text-indigo-400 font-bold">{learner.engagement_score}</div>
                      <div className="text-[10px] text-slate-500">{learner.engagement_level.replace(' Engagement', '')}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-400">
                      {learner.early_engagement_index}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        learner.completion_status === 'Completed'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {learner.completion_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskClass(learner.risk_level)}`}>
                          {Math.round(learner.dropout_probability * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-[160px] truncate text-[11px]">
                      {learner.primary_gap}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-[200px] truncate text-[11px]">
                      {learner.recommended_intervention}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLearner(learner.learner_id);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-600/40 text-slate-300 hover:text-white border border-slate-700/60 transition-all inline-flex items-center gap-1 text-[11px]"
                      >
                        <Eye className="w-3 h-3 text-indigo-400" />
                        <span>Profile</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 bg-slate-950/40">
            <div>
              Showing <span className="font-semibold text-white">{((page - 1) * limit) + 1}</span> to{' '}
              <span className="font-semibold text-white">{Math.min(page * limit, data.total)}</span> of{' '}
              <span className="font-semibold text-white">{data.total.toLocaleString()}</span> learners
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Per page:</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-1 font-mono">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-slate-200">
                  Page {page} of {data.total_pages}
                </span>
                <button
                  disabled={page >= data.total_pages}
                  onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
