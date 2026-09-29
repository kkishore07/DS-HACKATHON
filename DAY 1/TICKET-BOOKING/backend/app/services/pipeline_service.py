import os
import pandas as pd
from typing import Dict, Any, Optional, List
from app.preprocessing.validator import validate_and_clean_data
from app.analytics.friction import compute_friction_scores
from app.analytics.drop_point import analyze_satisfaction_drop_point
from app.analytics.categories import analyze_categories
from app.analytics.teams import analyze_teams
from app.analytics.overview import compute_overview_kpis
from app.analytics.insights import generate_executive_insights, generate_operational_alerts
from app.analytics.recommendations import get_actionable_recommendations
from app.nlp.engine import extract_nlp_themes
from app.ml.naive_bayes import train_naive_bayes_model, predict_ticket_risk, load_or_train_model, map_satisfaction_to_risk
from app.schemas.schemas import (
    ValidationSummary, OverviewKPIs, DropPointAnalysis, CategoryFrictionPoint,
    TeamBenchmark, FrictionDistribution, NLPOverview, ModelMetrics,
    PredictRequest, PredictResponse, ExecutiveInsight, OperationalAlert,
    PaginatedTicketsResponse, TicketItem
)
from app.models.database import SessionLocal, TicketRecord, ThemeRecord, ModelMetricRecord, AnalysisRunRecord, init_db

class PipelineState:
    def __init__(self):
        self.raw_df: Optional[pd.DataFrame] = None
        self.clean_df: Optional[pd.DataFrame] = None
        self.validation_summary: Optional[ValidationSummary] = None
        self.overview_kpis: Optional[OverviewKPIs] = None
        self.drop_point_analysis: Optional[DropPointAnalysis] = None
        self.category_points: Optional[List[CategoryFrictionPoint]] = None
        self.team_benchmarks: Optional[List[TeamBenchmark]] = None
        self.friction_distribution: Optional[FrictionDistribution] = None
        self.nlp_overview: Optional[NLPOverview] = None
        self.ml_pipeline = None
        self.model_metrics: Optional[ModelMetrics] = None
        self.executive_insights: Optional[List[ExecutiveInsight]] = None
        self.operational_alerts: Optional[List[OperationalAlert]] = None
        self.recommendations: Optional[List[Dict[str, Any]]] = None
        self.is_initialized: bool = False

state = PipelineState()

def run_full_pipeline(df: pd.DataFrame) -> PipelineState:
    global state
    init_db()

    # 1. Validation & Data Cleaning
    clean_df, val_summary = validate_and_clean_data(df)

    # 2. Friction Scoring
    clean_df, friction_dist = compute_friction_scores(clean_df)

    # 3. Satisfaction Drop Point Analysis
    drop_analysis = analyze_satisfaction_drop_point(clean_df)

    # 4. Team Performance & Complexity Benchmarking
    clean_df, team_benchmarks = analyze_teams(clean_df)

    # 5. Category Intelligence & Friction Matrix
    category_points = analyze_categories(clean_df)

    # 6. NLP Processing & Recurring Themes Discovery
    clean_df, nlp_overview = extract_nlp_themes(clean_df)

    # 7. Add Risk Label to DataFrame
    clean_df["Satisfaction_Risk"] = clean_df["Satisfaction_Score"].apply(map_satisfaction_to_risk)

    # 8. Train / Retrain Naive Bayes ML Pipeline
    ml_pipe, metrics_obj = train_naive_bayes_model(clean_df)

    # 9. Dynamic Executive Insights & Alerts
    anomalous_team_names = [t.team for t in team_benchmarks if t.status == "Anomalous"]
    high_fric_cats = [c.category for c in category_points if c.risk_level == "High"]
    theme_names = [th.theme_name for th in nlp_overview.themes]

    insights = generate_executive_insights(clean_df, drop_analysis.drop_point_hours, anomalous_team_names)
    alerts = generate_operational_alerts(clean_df, drop_analysis.drop_point_hours, anomalous_team_names)
    recs = get_actionable_recommendations(drop_analysis.drop_point_hours, anomalous_team_names, high_fric_cats, theme_names)

    # 10. Overview KPIs
    overview_kpis = compute_overview_kpis(clean_df)

    # Update state
    state.raw_df = df
    state.clean_df = clean_df
    state.validation_summary = val_summary
    state.overview_kpis = overview_kpis
    state.drop_point_analysis = drop_analysis
    state.category_points = category_points
    state.team_benchmarks = team_benchmarks
    state.friction_distribution = friction_dist
    state.nlp_overview = nlp_overview
    state.ml_pipeline = ml_pipe
    state.model_metrics = metrics_obj
    state.executive_insights = insights
    state.operational_alerts = alerts
    state.recommendations = recs
    state.is_initialized = True

    # Persist summary to SQLite
    try:
        db = SessionLocal()
        # Save run record
        run_rec = AnalysisRunRecord(
            total_rows=val_summary.total_raw_rows,
            duplicates_removed=val_summary.duplicates_removed,
            missing_handled=val_summary.missing_values_handled,
            invalid_records=val_summary.invalid_records_removed,
            response_outliers=val_summary.outlier_analysis[0].outlier_count if len(val_summary.outlier_analysis) > 0 else 0,
            resolution_outliers=val_summary.outlier_analysis[1].outlier_count if len(val_summary.outlier_analysis) > 1 else 0,
            status="completed"
        )
        db.add(run_rec)
        db.commit()
        db.close()
    except Exception as e:
        print(f"Warning: Failed to save run to DB: {e}")

    return state

def query_tickets(
    page: int = 1,
    page_size: int = 25,
    search: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    team: Optional[str] = None,
    risk: Optional[str] = None,
    friction_tier: Optional[str] = None,
    satisfaction: Optional[int] = None
) -> PaginatedTicketsResponse:
    if state.clean_df is None or len(state.clean_df) == 0:
        return PaginatedTicketsResponse(total=0, page=page, page_size=page_size, total_pages=0, tickets=[])

    df = state.clean_df

    if search:
        s = search.lower().strip()
        df = df[
            df["Ticket_ID"].str.lower().str.contains(s, na=False) |
            df["Description"].str.lower().str.contains(s, na=False)
        ]

    if category and category != "All":
        df = df[df["Category"] == category]

    if priority and priority != "All":
        df = df[df["Priority"] == priority]

    if team and team != "All":
        df = df[df["Team"] == team]

    if risk and risk != "All":
        df = df[df["Satisfaction_Risk"] == risk]

    if friction_tier and friction_tier != "All":
        df = df[df["Friction_Tier"] == friction_tier]

    if satisfaction is not None:
        df = df[df["Satisfaction_Score"] == satisfaction]

    total = len(df)
    total_pages = max(1, (total + page_size - 1) // page_size)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size

    subset = df.iloc[start_idx:end_idx]

    tickets: List[TicketItem] = []
    for _, row in subset.iterrows():
        tickets.append(TicketItem(
            ticket_id=str(row["Ticket_ID"]),
            category=str(row["Category"]),
            description=str(row["Description"]),
            priority=str(row["Priority"]),
            response_time=round(float(row["Response_Time"]), 2),
            resolution_time=round(float(row["Resolution_Time"]), 2),
            team=str(row["Team"]),
            satisfaction_score=float(row["Satisfaction_Score"]),
            friction_score=round(float(row["Friction_Score"]), 3) if "Friction_Score" in row else None,
            friction_tier=str(row["Friction_Tier"]) if "Friction_Tier" in row else None,
            expected_resolution_time=round(float(row["Expected_Resolution_Time"]), 2) if "Expected_Resolution_Time" in row else None,
            resolution_deviation=round(float(row["Resolution_Deviation"]), 2) if "Resolution_Deviation" in row else None,
            satisfaction_risk=str(row["Satisfaction_Risk"]) if "Satisfaction_Risk" in row else None,
            nlp_theme=str(row["nlp_theme"]) if "nlp_theme" in row else None
        ))

    return PaginatedTicketsResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        tickets=tickets
    )
