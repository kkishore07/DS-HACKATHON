import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Award,
  AlertTriangle,
  Users,
  CheckCircle,
  Activity,
  ArrowUpDown,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { api } from '../services/api';
import { CourseItem } from '../types';
import { KPICard } from '../components/KPICard';
import { CourseScatterChart } from '../components/CourseScatterChart';
import { LoadingSkeleton, CardSkeleton } from '../components/LoadingSkeleton';

interface Props {
  onSelectCourse: (courseId: string) => void;
}

export const Courses: React.FC<Props> = ({ onSelectCourse }) => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('completion_rate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchCourses();
  }, [sortBy, sortOrder]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await api.getCourses(sortBy, sortOrder);
      setCourses(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="p-8 space-y-6">
        <CardSkeleton />
        <LoadingSkeleton rows={5} height="h-64" />
      </div>
    );
  }

  // Calculate Course KPIs
  const sortedByComp = [...courses].sort((a, b) => b.completion_rate - a.completion_rate);
  const highestComp = sortedByComp[0];
  const lowestComp = sortedByComp[sortedByComp.length - 1];

  const sortedByEng = [...courses].sort((a, b) => b.avg_engagement - a.avg_engagement);
  const highestEng = sortedByEng[0];

  const sortedByLearners = [...courses].sort((a, b) => b.learners - a.learners);
  const largestEnrollment = sortedByLearners[0];

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Healthy':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'High Risk':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-white">Course Structure Intelligence</h1>
        <p className="text-xs text-slate-400 mt-1">
          Compare curriculum performance, completion rates, and identify course friction points across formats and categories.
        </p>
      </div>

      {/* Course KPI Cards (Section 38) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highestComp && (
          <KPICard
            title="Highest Completion"
            value={`${highestComp.completion_rate}%`}
            subtitle={`${highestComp.course_id} (${highestComp.course_name})`}
            icon={Award}
            color="emerald"
            trend="Top Performing"
            trendPositive={true}
          />
        )}

        {lowestComp && (
          <KPICard
            title="Lowest Completion"
            value={`${lowestComp.completion_rate}%`}
            subtitle={`${lowestComp.course_id} (${lowestComp.course_name})`}
            icon={AlertTriangle}
            color="rose"
            trend="High Risk Friction"
            trendPositive={false}
          />
        )}

        {highestEng && (
          <KPICard
            title="Highest Engagement"
            value={highestEng.avg_engagement}
            subtitle={`${highestEng.course_id} (${highestEng.course_name})`}
            icon={Activity}
            color="cyan"
            trend="Active Cohort"
            trendPositive={true}
          />
        )}

        {largestEnrollment && (
          <KPICard
            title="Largest Enrollment"
            value={largestEnrollment.learners.toLocaleString()}
            subtitle={`${largestEnrollment.course_id} • ${largestEnrollment.format}`}
            icon={Users}
            color="indigo"
          />
        )}
      </div>

      {/* Visual 3: Course Completion vs Engagement Scatter Chart */}
      <CourseScatterChart
        data={courses}
        onCourseClick={onSelectCourse}
        title="Visualization 3 — Course Completion vs Engagement Matrix"
        subtitle="Identifying low-completion, low-engagement curriculum structures (click any course bubble to inspect)"
      />

      {/* Course Completion Matrix Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Course Completion Matrix</h2>
            <p className="text-xs text-slate-400">Click table headers to sort. Select any row to view complete syllabus analytics.</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{courses.length} Courses Cataloged</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Course</th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => toggleSort('learners')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Learners</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => toggleSort('completion_rate')}
                  >
                    <div className="flex items-center gap-1 text-emerald-400">
                      <span>Completion %</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => toggleSort('engagement')}
                  >
                    <div className="flex items-center gap-1 text-indigo-400">
                      <span>Engagement</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => toggleSort('video_completion')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Video %</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => toggleSort('assignments')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Assignments</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => toggleSort('quiz')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Quiz Attempts</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Structure Risk</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {courses.map((course) => (
                  <tr 
                    key={course.course_id}
                    onClick={() => onSelectCourse(course.course_id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white font-mono">{course.course_id}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{course.course_name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{course.category} • {course.level} • {course.format}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {course.learners.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {course.completion_rate}%
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {course.avg_engagement}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {course.avg_video_completion}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-400">
                      {course.avg_assignment_submissions}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-400">
                      {course.avg_quiz_attempts}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getRiskBadge(course.risk_classification)}`}>
                        {course.risk_classification}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCourse(course.course_id);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-600/40 text-slate-300 hover:text-white border border-slate-700/60 transition-all inline-flex items-center gap-1 text-[11px]"
                      >
                        <Eye className="w-3 h-3 text-amber-400" />
                        <span>Inspect</span>
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
