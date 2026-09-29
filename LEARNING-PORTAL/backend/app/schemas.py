from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ValidationSummary(BaseModel):
    rows_processed: int
    duplicate_rows: int
    missing_values: int
    invalid_values: int
    corrected_records: int
    valid_records: int
    duplicates_retained: int
    message: str

class BehaviorMetrics(BaseModel):
    login_frequency: float
    video_completion: float
    quiz_attempts: float
    assignment_submissions: float
    discussion_activity: float

class CompleterComparison(BaseModel):
    feature: str
    completers_avg: float
    non_completers_avg: float
    difference: float
    relative_diff_pct: float

class EarlyEngagementBand(BaseModel):
    band: str
    learners: int
    completion_rate: float
    non_completion_rate: float

class DropoutStageDrop(BaseModel):
    stage: str
    stage_name: str
    avg_engagement: float
    completers_engagement: float
    non_completers_engagement: float
    drop_from_previous: float
    is_major_drop: bool

class DynamicInsight(BaseModel):
    id: str
    title: str
    evidence: str
    business_meaning: str
    recommended_action: str
    type: str # 'warning', 'info', 'success', 'critical'

class OverviewResponse(BaseModel):
    total_learners: int
    total_courses: int
    completion_rate: float
    non_completion_rate: float
    average_engagement: float
    at_risk_learners: int
    at_risk_percentage: float
    critical_intervention_learners: int
    critical_intervention_percentage: float
    operational_alerts: List[str]
    dynamic_insights: List[DynamicInsight]
    behavior_averages: Dict[str, float]
    completer_vs_non_completer: List[CompleterComparison]
    disengagement_point: str

class LearnerItem(BaseModel):
    id: int
    learner_id: str
    course_id: str
    course_name: Optional[str] = None
    login_frequency: float
    video_completion: float
    quiz_attempts: float
    assignment_submissions: float
    discussion_activity: float
    completion_status: str
    engagement_score: float
    engagement_level: str
    early_engagement_index: float
    dropout_probability: float
    risk_level: str
    intervention_priority: float
    priority_level: str
    primary_gap: str
    recommended_intervention: str

class LearnerDetail(LearnerItem):
    course_category: Optional[str] = None
    course_level: Optional[str] = None
    course_format: Optional[str] = None
    enrollment_date: Optional[str] = None
    last_activity_date: Optional[str] = None
    stage_1_engagement: Optional[float] = None
    stage_2_engagement: Optional[float] = None
    stage_3_engagement: Optional[float] = None
    stage_4_engagement: Optional[float] = None
    stage_5_engagement: Optional[float] = None
    course_average_engagement: float
    course_average_video: float
    course_average_login: float
    relative_video_completion: float
    relative_login_frequency: float
    behavioral_diagnosis: List[str]

class PaginatedLearnersResponse(BaseModel):
    items: List[LearnerItem]
    total: int
    page: int
    limit: int
    total_pages: int

class CourseItem(BaseModel):
    course_id: str
    course_name: str
    category: Optional[str] = None
    level: Optional[str] = None
    format: Optional[str] = None
    modules: Optional[int] = None
    learners: int
    completion_rate: float
    avg_engagement: float
    avg_video_completion: float
    avg_quiz_attempts: float
    avg_assignment_submissions: float
    avg_discussion_activity: float
    risk_classification: str # Healthy, Watch, High Risk
    at_risk_count: int

class CourseDetailResponse(CourseItem):
    completer_count: int
    non_completer_count: int
    stages_averages: List[Dict[str, Any]]
    high_risk_learners: List[LearnerItem]

class ConfusionMatrixData(BaseModel):
    matrix: List[List[int]]
    labels: List[str]
    percentages: List[List[float]]
    true_positive: int
    true_negative: int
    false_positive: int
    false_negative: int

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float
    importance_pct: float
    description: str

class ModelMetricsResponse(BaseModel):
    algorithm: str
    target: str
    training_samples: int
    testing_samples: int
    features_used: List[str]
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    non_completer_recall: float
    completer_recall: float
    macro_f1: float
    confusion_matrix: ConfusionMatrixData
    feature_importances: List[FeatureImportanceItem]
    last_trained: str
    training_time_seconds: float

class InterventionItem(BaseModel):
    id: int
    learner_id: str
    course_id: str
    course_name: Optional[str] = None
    dropout_probability: float
    risk_level: str
    priority_score: float
    priority_level: str
    category: str
    gap_summary: str
    recommended_action: str
    status: str
    engagement_score: float
    early_engagement_index: float

class InterventionCenterResponse(BaseModel):
    total_interventions: int
    urgent_count: int
    high_count: int
    medium_count: int
    low_count: int
    categories: Dict[str, int]
    queue: List[InterventionItem]

class EngagementPageResponse(BaseModel):
    average_engagement: float
    level_counts: Dict[str, int]
    level_percentages: Dict[str, float]
    completer_vs_non_completer: List[CompleterComparison]
    early_engagement_bands: List[EarlyEngagementBand]
    drop_off_stages: List[DropoutStageDrop]
    major_disengagement_stage: str
    decay_distribution: Dict[str, int]

class RiskPageResponse(BaseModel):
    critical_count: int
    critical_pct: float
    high_count: int
    high_pct: float
    moderate_count: int
    moderate_pct: float
    low_count: int
    low_pct: float
    high_priority_learners: List[LearnerItem]
    risk_distribution: List[Dict[str, Any]]
