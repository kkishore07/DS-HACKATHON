export interface CompleterComparison {
  feature: string;
  completers_avg: number;
  non_completers_avg: number;
  difference: number;
  relative_diff_pct: number;
}

export interface EarlyEngagementBand {
  band: string;
  learners: number;
  completion_rate: number;
  non_completion_rate: number;
}

export interface DropoutStageDrop {
  stage: string;
  stage_name: string;
  avg_engagement: number;
  completers_engagement: number;
  non_completers_engagement: number;
  drop_from_previous: number;
  is_major_drop: boolean;
}

export interface DynamicInsight {
  id: string;
  title: string;
  evidence: string;
  business_meaning: string;
  recommended_action: string;
  type: 'warning' | 'info' | 'success' | 'critical';
}

export interface OverviewData {
  total_learners: number;
  total_courses: number;
  completion_rate: number;
  non_completion_rate: number;
  average_engagement: number;
  at_risk_learners: number;
  at_risk_percentage: number;
  critical_intervention_learners: number;
  critical_intervention_percentage: number;
  operational_alerts: string[];
  dynamic_insights: DynamicInsight[];
  behavior_averages: Record<string, number>;
  completer_vs_non_completer: CompleterComparison[];
  disengagement_point: string;
}

export interface LearnerItem {
  id: number;
  learner_id: string;
  course_id: string;
  course_name?: string;
  login_frequency: number;
  video_completion: number;
  quiz_attempts: number;
  assignment_submissions: number;
  discussion_activity: number;
  completion_status: string;
  engagement_score: number;
  engagement_level: string;
  early_engagement_index: number;
  dropout_probability: number;
  risk_level: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Critical Risk';
  intervention_priority: number;
  priority_level: 'Low Priority' | 'Medium Priority' | 'High Priority' | 'Urgent Intervention';
  primary_gap: string;
  recommended_intervention: string;
}

export interface LearnerDetail extends LearnerItem {
  course_category?: string;
  course_level?: string;
  course_format?: string;
  enrollment_date?: string;
  last_activity_date?: string;
  stage_1_engagement?: number;
  stage_2_engagement?: number;
  stage_3_engagement?: number;
  stage_4_engagement?: number;
  stage_5_engagement?: number;
  course_average_engagement: number;
  course_average_video: number;
  course_average_login: number;
  relative_video_completion: number;
  relative_login_frequency: number;
  behavioral_diagnosis: string[];
}

export interface PaginatedLearnersResponse {
  items: LearnerItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CourseItem {
  course_id: string;
  course_name: string;
  category?: string;
  level?: string;
  format?: string;
  modules?: number;
  learners: number;
  completion_rate: number;
  avg_engagement: number;
  avg_login_frequency?: number;
  avg_video_completion: number;
  avg_quiz_attempts: number;
  avg_assignment_submissions: number;
  avg_discussion_activity: number;
  risk_classification: 'Healthy' | 'Watch' | 'High Risk';
  at_risk_count: number;
}

export interface CourseDetailResponse extends CourseItem {
  completer_count: number;
  non_completer_count: number;
  stages_averages: Array<{ stage: string; avg: number }>;
  high_risk_learners: LearnerItem[];
}

export interface EngagementPageData {
  average_engagement: number;
  level_counts: Record<string, number>;
  level_percentages: Record<string, number>;
  completer_vs_non_completer: CompleterComparison[];
  early_engagement_bands: EarlyEngagementBand[];
  drop_off_stages: DropoutStageDrop[];
  major_disengagement_stage: string;
  decay_distribution: Record<string, number>;
}

export interface RiskDistributionBucket {
  range: string;
  count: number;
  percentage: number;
}

export interface RiskPageData {
  critical_count: number;
  critical_pct: number;
  high_count: number;
  high_pct: number;
  moderate_count: number;
  moderate_pct: number;
  low_count: number;
  low_pct: number;
  high_priority_learners: LearnerItem[];
  risk_distribution: RiskDistributionBucket[];
}

export interface InterventionItem {
  id: number;
  learner_id: string;
  course_id: string;
  course_name?: string;
  dropout_probability: number;
  risk_level: string;
  priority_score: number;
  priority_level: string;
  category: string;
  gap_summary: string;
  recommended_action: string;
  status: string;
  engagement_score: number;
  early_engagement_index: number;
}

export interface InterventionCenterData {
  total_interventions: number;
  urgent_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  categories: Record<string, number>;
  queue: InterventionItem[];
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  importance_pct: number;
  description: string;
}

export interface ConfusionMatrixData {
  matrix: number[][];
  labels: string[];
  percentages: number[][];
  true_positive: number;
  true_negative: number;
  false_positive: number;
  false_negative: number;
}

export interface ModelMetricsData {
  algorithm: string;
  target: string;
  training_samples: number;
  testing_samples: number;
  features_used: string[];
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  non_completer_recall: number;
  completer_recall: number;
  macro_f1: number;
  confusion_matrix: ConfusionMatrixData;
  feature_importances: FeatureImportanceItem[];
  last_trained: string;
  training_time_seconds: number;
}

export interface ValidationSummary {
  rows_processed: number;
  duplicate_rows: number;
  missing_values: number;
  invalid_values: number;
  corrected_records: number;
  valid_records: number;
  duplicates_retained: number;
  message: string;
}
