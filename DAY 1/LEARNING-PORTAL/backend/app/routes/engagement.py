from fastapi import APIRouter, HTTPException
from app.analytics_service import analytics_service
from app.schemas import EngagementPageResponse

router = APIRouter(prefix="/api/engagement", tags=["Engagement"])

@router.get("", response_model=EngagementPageResponse)
def get_engagement_page_data():
    if not analytics_service.is_initialized or analytics_service.df is None:
        raise HTTPException(status_code=503, detail="Analytics engine not initialized.")
        
    df = analytics_service.df
    avg_eng = round(float(df["Engagement_Score"].mean()), 1)
    
    # Levels distribution
    level_counts_raw = df["Engagement_Level"].value_counts().to_dict()
    total = len(df)
    
    levels = ["Low Engagement", "Moderate Engagement", "High Engagement", "Very High Engagement"]
    level_counts = {l: int(level_counts_raw.get(l, 0)) for l in levels}
    level_percentages = {l: round(float(level_counts[l] / total * 100), 1) for l in levels}
    
    completer_comp = analytics_service.get_completer_comparison()
    early_bands = analytics_service.get_early_engagement_bands()
    stage_drops, major_stage = analytics_service.get_dropout_stages()
    
    # Decay classification: Initial (Stage 1) - Later (Stage 5)
    decay_diff = df["Stage_1_Engagement"] - df["Stage_5_Engagement"]
    decay_dist = {
        "Stable (< 15 pts decline)": int((decay_diff < 15).sum()),
        "Moderate Decline (15-35 pts)": int(((decay_diff >= 15) & (decay_diff <= 35)).sum()),
        "Rapid Decline (> 35 pts)": int((decay_diff > 35).sum())
    }
    
    return {
        "average_engagement": avg_eng,
        "level_counts": level_counts,
        "level_percentages": level_percentages,
        "completer_vs_non_completer": completer_comp,
        "early_engagement_bands": early_bands,
        "drop_off_stages": stage_drops,
        "major_disengagement_stage": major_stage,
        "decay_distribution": decay_dist
    }
