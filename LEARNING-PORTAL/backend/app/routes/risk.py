from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.analytics_service import analytics_service
from app.schemas import RiskPageResponse

router = APIRouter(prefix="/api/dropout-risk", tags=["Dropout Risk"])

@router.get("", response_model=RiskPageResponse)
def get_dropout_risk_data(
    course_id: Optional[str] = Query(None, description="Optional Course filter"),
    limit_learners: int = Query(25, ge=5, le=100)
):
    if not analytics_service.is_initialized or analytics_service.df is None:
        raise HTTPException(status_code=503, detail="Analytics engine not initialized.")
        
    df = analytics_service.df
    if course_id and course_id != "all":
        df = df[df["Course_ID"].str.lower() == course_id.lower()]
        
    total = len(df)
    if total == 0:
        return {
            "critical_count": 0, "critical_pct": 0.0,
            "high_count": 0, "high_pct": 0.0,
            "moderate_count": 0, "moderate_pct": 0.0,
            "low_count": 0, "low_pct": 0.0,
            "high_priority_learners": [],
            "risk_distribution": []
        }
        
    crit_count = int((df["risk_level"] == "Critical Risk").sum())
    high_count = int((df["risk_level"] == "High Risk").sum())
    mod_count = int((df["risk_level"] == "Moderate Risk").sum())
    low_count = int((df["risk_level"] == "Low Risk").sum())
    
    crit_pct = round(crit_count / total * 100, 1)
    high_pct = round(high_count / total * 100, 1)
    mod_pct = round(mod_count / total * 100, 1)
    low_pct = round(low_count / total * 100, 1)
    
    # Distribution buckets (0-20, 21-40, 41-60, 61-80, 81-100)
    dist_buckets = [
        {"range": "0–20%", "min": 0.0, "max": 0.20},
        {"range": "21–40%", "min": 0.20, "max": 0.40},
        {"range": "41–60%", "min": 0.40, "max": 0.60},
        {"range": "61–80%", "min": 0.60, "max": 0.80},
        {"range": "81–100%", "min": 0.80, "max": 1.00}
    ]
    risk_distribution = []
    for b in dist_buckets:
        cnt = int(((df["dropout_probability"] >= b["min"]) & (df["dropout_probability"] <= b["max"])).sum())
        risk_distribution.append({
            "range": b["range"],
            "count": cnt,
            "percentage": round(cnt / total * 100, 1)
        })
        
    # High Priority Learners sorted by priority score
    high_priority_df = df.sort_values(by="intervention_priority", ascending=False).head(limit_learners)
    items = []
    for _, row in high_priority_df.iterrows():
        items.append({
            "id": int(row["id"]),
            "learner_id": str(row["Learner_ID"]),
            "course_id": str(row["Course_ID"]),
            "course_name": str(row.get("Course_Name", row["Course_ID"])),
            "login_frequency": float(row["Login_Frequency"]),
            "video_completion": float(row["Video_Completion"]),
            "quiz_attempts": float(row["Quiz_Attempts"]),
            "assignment_submissions": float(row["Assignment_Submissions"]),
            "discussion_activity": float(row["Discussion_Activity"]),
            "completion_status": str(row["Completion_Status"]),
            "engagement_score": float(row["Engagement_Score"]),
            "engagement_level": str(row["Engagement_Level"]),
            "early_engagement_index": float(row["Early_Engagement_Index"]),
            "dropout_probability": float(row["dropout_probability"]),
            "risk_level": str(row["risk_level"]),
            "intervention_priority": float(row["intervention_priority"]),
            "priority_level": str(row["priority_level"]),
            "primary_gap": str(row["primary_gap"]),
            "recommended_intervention": str(row["recommended_intervention"])
        })
        
    return {
        "critical_count": crit_count,
        "critical_pct": crit_pct,
        "high_count": high_count,
        "high_pct": high_pct,
        "moderate_count": mod_count,
        "moderate_pct": mod_pct,
        "low_count": low_count,
        "low_pct": low_pct,
        "high_priority_learners": items,
        "risk_distribution": risk_distribution
    }
