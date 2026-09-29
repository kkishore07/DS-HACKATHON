from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional, Dict, Any
from app.analytics_service import analytics_service
from app.schemas import InterventionCenterResponse

router = APIRouter(prefix="/api/interventions", tags=["Interventions"])

# In-memory status tracking for interactive demo actions
intervention_status_overrides: Dict[int, str] = {}

@router.get("", response_model=InterventionCenterResponse)
def get_intervention_center(
    category: Optional[str] = Query(None, description="Filter by intervention category"),
    priority: Optional[str] = Query(None, description="Filter by priority level"),
    limit: int = Query(50, ge=1, le=200)
):
    if not analytics_service.is_initialized or analytics_service.df is None:
        raise HTTPException(status_code=503, detail="Analytics engine not initialized.")
        
    df = analytics_service.df
    
    # Priority counts across whole dataset
    urgent_count = int((df["priority_level"] == "Urgent Intervention").sum())
    high_count = int((df["priority_level"] == "High Priority").sum())
    medium_count = int((df["priority_level"] == "Medium Priority").sum())
    low_count = int((df["priority_level"] == "Low Priority").sum())
    
    # Category counts
    cat_counts_raw = df["intervention_category"].value_counts().to_dict()
    all_categories = [
        "Re-engagement", "Video Support", "Quiz Support",
        "Assignment Support", "Community Engagement", "Academic Outreach"
    ]
    category_counts = {c: int(cat_counts_raw.get(c, 0)) for c in all_categories}
    
    # Prioritized Queue
    queue_df = df[df["priority_level"].isin(["Urgent Intervention", "High Priority"])].copy()
    if queue_df.empty:
        queue_df = df.copy()
        
    if category and category != "all":
        queue_df = queue_df[queue_df["intervention_category"].str.lower() == category.lower()]
        
    if priority and priority != "all":
        queue_df = queue_df[queue_df["priority_level"].str.lower() == priority.lower()]
        
    queue_df = queue_df.sort_values(by="intervention_priority", ascending=False).head(limit)
    
    items = []
    for _, row in queue_df.iterrows():
        row_id = int(row["id"])
        status = intervention_status_overrides.get(row_id, "Pending")
        items.append({
            "id": row_id,
            "learner_id": str(row["Learner_ID"]),
            "course_id": str(row["Course_ID"]),
            "course_name": str(row.get("Course_Name", row["Course_ID"])),
            "dropout_probability": float(row["dropout_probability"]),
            "risk_level": str(row["risk_level"]),
            "priority_score": float(row["intervention_priority"]),
            "priority_level": str(row["priority_level"]),
            "category": str(row["intervention_category"]),
            "gap_summary": str(row["primary_gap"]),
            "recommended_action": str(row["recommended_intervention"]),
            "status": status,
            "engagement_score": float(row["Engagement_Score"]),
            "early_engagement_index": float(row["Early_Engagement_Index"])
        })
        
    return {
        "total_interventions": len(df),
        "urgent_count": urgent_count,
        "high_count": high_count,
        "medium_count": medium_count,
        "low_count": low_count,
        "categories": category_counts,
        "queue": items
    }

@router.post("/{learner_id}/action")
def take_intervention_action(
    learner_id: str,
    payload: Dict[str, Any] = Body(...)
):
    """Allows instructors/advisors to dispatch interventions (e.g. 'Email Sent', 'Advisor Scheduled', 'Dismissed')."""
    action_type = payload.get("action", "Initiated")
    # Find matching learner
    if not analytics_service.is_initialized or analytics_service.df is None:
        raise HTTPException(status_code=503, detail="Analytics engine not initialized.")
        
    df = analytics_service.df
    matches = df[df["Learner_ID"] == learner_id]
    if matches.empty:
        raise HTTPException(status_code=404, detail="Learner not found.")
        
    row_id = int(matches.iloc[0]["id"])
    intervention_status_overrides[row_id] = action_type
    
    return {
        "success": True,
        "learner_id": learner_id,
        "status": action_type,
        "message": f"Successfully updated intervention workflow for learner {learner_id}: {action_type}."
    }
