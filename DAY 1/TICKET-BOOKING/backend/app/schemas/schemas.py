from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# Upload & Validation Schemas
class ColumnMissingInfo(BaseModel):
    column: str
    missing_count: int
    missing_percentage: float
    imputation_strategy: str

class OutlierSummary(BaseModel):
    metric: str
    q1: float
    q3: float
    iqr: float
    lower_bound: float
    upper_bound: float
    outlier_count: int
    outlier_percentage: float

class ValidationSummary(BaseModel):
    total_raw_rows: int
    clean_rows: int
    duplicates_removed: int
    missing_values_handled: int
    invalid_records_removed: int
    missing_breakdown: List[ColumnMissingInfo]
    outlier_analysis: List[OutlierSummary]
    status: str

# Overview KPIs
class OverviewKPIs(BaseModel):
    total_tickets: int
    avg_response_time: float
    median_response_time: float
    avg_resolution_time: float
    median_resolution_time: float
    avg_satisfaction: float
    satisfaction_distribution: Dict[int, int]
    high_risk_tickets: int
    high_risk_percentage: float
    critical_friction_tickets: int
    critical_friction_percentage: float
    priority_distribution: Dict[str, int]
    category_distribution: Dict[str, int]
    team_distribution: Dict[str, int]
    sla_breached_count: Optional[int] = 0
    sla_breached_percentage: Optional[float] = 0.0

# Visualization 1: Friction Matrix (Bubble Chart)
class CategoryFrictionPoint(BaseModel):
    category: str
    ticket_count: int
    percentage: float
    avg_response_time: float
    avg_resolution_time: float
    avg_satisfaction: float
    friction_score: float
    risk_level: str

# Visualization 2: Satisfaction Drop Curve
class ResponseTimeBucket(BaseModel):
    bucket_name: str
    min_hours: float
    max_hours: float
    ticket_count: int
    avg_satisfaction: float
    dissatisfied_count: int
    dissatisfaction_rate: float

class DropPointAnalysis(BaseModel):
    drop_point_hours: float
    drop_point_description: str
    pre_drop_avg_sat: float
    post_drop_avg_sat: float
    buckets: List[ResponseTimeBucket]
    curve_points: List[Dict[str, Any]]

# Visualization 3: Team Benchmark
class TeamBenchmark(BaseModel):
    team: str
    ticket_count: int
    avg_response_time: float
    median_response_time: float
    avg_resolution_time: float
    median_resolution_time: float
    avg_expected_resolution: float
    avg_resolution_deviation: float
    resolution_efficiency: float
    avg_satisfaction: float
    friction_score: float
    z_score: float
    status: str  # Normal, Watch, Anomalous
    explanation: str

# Visualization 4: NLP Themes & Heatmap
class IssueTheme(BaseModel):
    cluster_id: int
    theme_name: str
    top_keywords: List[str]
    ticket_count: int
    ticket_percentage: float
    avg_satisfaction: float
    dissatisfaction_rate: float
    avg_response_time: float
    avg_resolution_time: float
    avg_friction_score: float
    priority_concentration: Dict[str, int]

class NLPOverview(BaseModel):
    themes: List[IssueTheme]
    top_unigrams: List[Dict[str, Any]]
    top_bigrams: List[Dict[str, Any]]

# Support Friction Breakdown
class FrictionDistribution(BaseModel):
    low_friction_count: int
    low_friction_pct: float
    moderate_friction_count: int
    moderate_friction_pct: float
    critical_friction_count: int
    critical_friction_pct: float
    avg_friction: float
    formula_weights: Dict[str, float]
    tiers: List[Dict[str, Any]]

# Executive Insight & Alert
class ExecutiveInsight(BaseModel):
    id: str
    title: str
    category: str
    evidence: str
    business_impact: str
    recommended_action: str
    severity: str  # Critical, Warning, Positive, Info

class OperationalAlert(BaseModel):
    id: str
    type: str  # category, team, sla, response_drop
    severity: str  # critical, warning, info
    message: str
    metric: str
    timestamp: Optional[str] = None

# Model Metrics
class ConfusionMatrixData(BaseModel):
    labels: List[str]
    matrix: List[List[int]]

class ModelMetrics(BaseModel):
    model_name: str
    train_size: int
    test_size: int
    accuracy: float
    macro_f1: float
    weighted_f1: float
    high_risk_recall: float
    high_risk_precision: float
    high_risk_f1: float
    class_distribution: Dict[str, int]
    classification_report: Dict[str, Any]
    confusion_matrix: ConfusionMatrixData
    informative_features: Dict[str, List[Dict[str, Any]]]
    limitations: List[str]

# Live Prediction
class PredictRequest(BaseModel):
    description: str
    category: str
    priority: str
    team: str
    response_time: float = Field(..., ge=0.0)

class PredictResponse(BaseModel):
    predicted_risk: str
    confidence: float
    probabilities: Dict[str, float]
    primary_indicators: List[str]
    recommended_action: str
    ticket_summary: Dict[str, Any]

# Ticket List Query & Item
class TicketItem(BaseModel):
    ticket_id: str
    category: str
    description: str
    priority: str
    response_time: float
    resolution_time: float
    team: str
    satisfaction_score: float
    friction_score: Optional[float] = None
    friction_tier: Optional[str] = None
    expected_resolution_time: Optional[float] = None
    resolution_deviation: Optional[float] = None
    satisfaction_risk: Optional[str] = None
    nlp_theme: Optional[str] = None

class PaginatedTicketsResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    tickets: List[TicketItem]
