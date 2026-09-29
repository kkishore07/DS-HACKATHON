from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.ml_service import ml_service
from app.analytics_service import analytics_service
from app.schemas import ModelMetricsResponse, FeatureImportanceItem

router = APIRouter(prefix="/api/model", tags=["Model"])

@router.get("/metrics", response_model=ModelMetricsResponse)
def get_model_metrics():
    if not ml_service.is_trained or not ml_service.metrics:
        # If not trained yet, train on currently loaded dataset
        if analytics_service.is_initialized and analytics_service.df is not None:
            ml_service.train_model(analytics_service.df)
        else:
            raise HTTPException(status_code=503, detail="Model is not trained yet and no dataset is available.")
            
    return ml_service.metrics

@router.get("/features", response_model=List[FeatureImportanceItem])
def get_feature_importances():
    if not ml_service.is_trained or not ml_service.metrics:
        raise HTTPException(status_code=503, detail="Model is not trained yet.")
    return ml_service.metrics.get("feature_importances", [])

@router.post("/train")
def retrain_model():
    if not analytics_service.is_initialized or analytics_service.df is None:
        raise HTTPException(status_code=400, detail="Cannot train model without loaded dataset.")
        
    metrics = ml_service.train_model(analytics_service.df)
    
    # Recompute risk predictions & interventions with updated model
    dropout_probs, risk_levels = ml_service.predict_risk(analytics_service.df)
    analytics_service.df["dropout_probability"] = dropout_probs
    analytics_service.df["risk_level"] = risk_levels
    
    return {
        "success": True,
        "message": "Random Forest model successfully retrained on current dataset.",
        "metrics": metrics
    }
