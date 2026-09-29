import io
import os
import pandas as pd
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from app.services.pipeline_service import (
    state, run_full_pipeline, query_tickets
)
from app.ml.naive_bayes import predict_ticket_risk, train_naive_bayes_model
from app.schemas.schemas import (
    ValidationSummary, OverviewKPIs, DropPointAnalysis,
    CategoryFrictionPoint, TeamBenchmark, FrictionDistribution,
    NLPOverview, ModelMetrics, PredictRequest, PredictResponse,
    ExecutiveInsight, OperationalAlert, PaginatedTicketsResponse
)

router = APIRouter(prefix="/api")

DEFAULT_DATASET_PATHS = [
    "data/raw/supportpulse_ai_support_tickets_25000.csv",
    "supportpulse_ai_support_tickets_25000.csv",
    "../supportpulse_ai_support_tickets_25000.csv"
]

def ensure_initialized():
    if not state.is_initialized or state.clean_df is None:
        # Attempt to auto-initialize with default dataset
        for path in DEFAULT_DATASET_PATHS:
            if os.path.exists(path):
                try:
                    df = pd.read_csv(path)
                    run_full_pipeline(df)
                    return
                except Exception as e:
                    print(f"Error loading {path}: {e}")
        raise HTTPException(
            status_code=400,
            detail="No dataset loaded. Please upload a CSV dataset first via POST /api/upload."
        )

@router.post("/upload", response_model=ValidationSummary)
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV files are supported.")
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        if len(df) == 0:
            raise HTTPException(status_code=400, detail="The uploaded CSV file is empty.")
        
        # Save copy to data/raw
        os.makedirs("data/raw", exist_ok=True)
        raw_path = os.path.join("data/raw", f"uploaded_{file.filename}")
        df.to_csv(raw_path, index=False)

        # Run pipeline
        run_full_pipeline(df)
        return state.validation_summary
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process uploaded dataset: {str(e)}")

@router.post("/dataset/reset-default", response_model=ValidationSummary)
def reset_to_default_dataset():
    for path in DEFAULT_DATASET_PATHS:
        if os.path.exists(path):
            try:
                df = pd.read_csv(path)
                run_full_pipeline(df)
                return state.validation_summary
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error loading default dataset: {str(e)}")
    raise HTTPException(status_code=404, detail="Default dataset file not found on disk.")

@router.get("/dataset/summary", response_model=ValidationSummary)
def get_dataset_summary():
    ensure_initialized()
    return state.validation_summary

@router.get("/analytics/overview", response_model=OverviewKPIs)
def get_analytics_overview():
    ensure_initialized()
    return state.overview_kpis

@router.get("/analytics/categories", response_model=List[CategoryFrictionPoint])
def get_analytics_categories():
    ensure_initialized()
    return state.category_points

@router.get("/analytics/teams", response_model=List[TeamBenchmark])
def get_analytics_teams():
    ensure_initialized()
    return state.team_benchmarks

@router.get("/analytics/satisfaction", response_model=DropPointAnalysis)
def get_analytics_satisfaction():
    ensure_initialized()
    return state.drop_point_analysis

@router.get("/analytics/friction", response_model=FrictionDistribution)
def get_analytics_friction():
    ensure_initialized()
    return state.friction_distribution

@router.get("/nlp/themes", response_model=NLPOverview)
def get_nlp_themes():
    ensure_initialized()
    return state.nlp_overview

@router.get("/model/metrics", response_model=ModelMetrics)
def get_model_metrics():
    ensure_initialized()
    return state.model_metrics

@router.post("/model/train", response_model=ModelMetrics)
def retrain_model():
    ensure_initialized()
    ml_pipe, metrics_obj = train_naive_bayes_model(state.clean_df)
    state.ml_pipeline = ml_pipe
    state.model_metrics = metrics_obj
    return metrics_obj

@router.post("/predict", response_model=PredictResponse)
def predict_satisfaction_risk(request: PredictRequest):
    ensure_initialized()
    if state.ml_pipeline is None:
        raise HTTPException(status_code=500, detail="ML Model not loaded or trained.")
    
    result = predict_ticket_risk(
        pipeline=state.ml_pipeline,
        description=request.description,
        category=request.category,
        priority=request.priority,
        team=request.team,
        response_time=request.response_time
    )
    return result

@router.get("/recommendations", response_model=List[Dict[str, Any]])
def get_recommendations():
    ensure_initialized()
    return state.recommendations

@router.get("/executive-insights", response_model=List[ExecutiveInsight])
def get_executive_insights():
    ensure_initialized()
    return state.executive_insights

@router.get("/alerts", response_model=List[OperationalAlert])
def get_operational_alerts():
    ensure_initialized()
    return state.operational_alerts

@router.get("/tickets", response_model=PaginatedTicketsResponse)
def get_paginated_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=5, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    team: Optional[str] = Query(None),
    risk: Optional[str] = Query(None),
    friction_tier: Optional[str] = Query(None),
    satisfaction: Optional[int] = Query(None, ge=1, le=5)
):
    ensure_initialized()
    return query_tickets(
        page=page,
        page_size=page_size,
        search=search,
        category=category,
        priority=priority,
        team=team,
        risk=risk,
        friction_tier=friction_tier,
        satisfaction=satisfaction
    )
