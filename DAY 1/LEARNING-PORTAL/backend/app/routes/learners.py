import math
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.analytics_service import analytics_service
from app.schemas import PaginatedLearnersResponse, LearnerDetail

router = APIRouter(prefix="/api/learners", tags=["Learners"])

@router.get("", response_model=PaginatedLearnersResponse)
def get_learners(
    course_id: Optional[str] = Query(None, description="Filter by Course ID"),
    completion_status: Optional[str] = Query(None, description="Filter by Completion Status (Completed / Not Completed)"),
    risk_level: Optional[str] = Query(None, description="Filter by Risk Level (Low Risk, Moderate Risk, High Risk, Critical Risk)"),
    engagement_level: Optional[str] = Query(None, description="Filter by Engagement Level"),
    search: Optional[str] = Query(None, description="Search by Learner ID or Course ID"),
    sort_by: Optional[str] = Query("highest_risk", description="Sorting criteria: highest_risk, lowest_engagement, lowest_video, lowest_assignments, id_asc"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=200, description="Items per page")
):
    if not analytics_service.is_initialized or analytics_service.df is None:
        raise HTTPException(status_code=503, detail="Analytics engine not initialized.")
        
    df = analytics_service.df
    filtered = df.copy()

    # Apply filters
    if course_id and course_id != "all":
        filtered = filtered[filtered["Course_ID"].str.lower() == course_id.lower()]
        
    if completion_status and completion_status != "all":
        filtered = filtered[filtered["Completion_Status"].str.lower() == completion_status.lower()]
        
    if risk_level and risk_level != "all":
        filtered = filtered[filtered["risk_level"].str.lower() == risk_level.lower()]
        
    if engagement_level and engagement_level != "all":
        filtered = filtered[filtered["Engagement_Level"].str.lower() == engagement_level.lower()]
        
    if search and search.strip():
        term = search.strip().lower()
        filtered = filtered[
            filtered["Learner_ID"].str.lower().str.contains(term, na=False) |
            filtered["Course_ID"].str.lower().str.contains(term, na=False) |
            filtered["Course_Name"].str.lower().str.contains(term, na=False)
        ]

    # Apply sorting
    if sort_by == "highest_risk":
        filtered = filtered.sort_values(by="dropout_probability", ascending=False)
    elif sort_by == "lowest_engagement":
        filtered = filtered.sort_values(by="Engagement_Score", ascending=True)
    elif sort_by == "lowest_video":
        filtered = filtered.sort_values(by="Video_Completion", ascending=True)
    elif sort_by == "lowest_assignments":
        filtered = filtered.sort_values(by="Assignment_Submissions", ascending=True)
    elif sort_by == "highest_priority":
        filtered = filtered.sort_values(by="intervention_priority", ascending=False)
    elif sort_by == "id_asc":
        filtered = filtered.sort_values(by="Learner_ID", ascending=True)
    else:
        filtered = filtered.sort_values(by="dropout_probability", ascending=False)

    total_records = len(filtered)
    total_pages = max(1, math.ceil(total_records / limit))
    
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    page_records = filtered.iloc[start_idx:end_idx]

    items = []
    for _, row in page_records.iterrows():
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
        "items": items,
        "total": total_records,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@router.get("/{learner_id}", response_model=LearnerDetail)
def get_learner_detail(learner_id: str):
    if not analytics_service.is_initialized:
        raise HTTPException(status_code=503, detail="Analytics engine not initialized.")
    data = analytics_service.get_learner_detail(learner_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Learner {learner_id} not found.")
        
    return {
        "id": int(data["id"]),
        "learner_id": str(data["Learner_ID"]),
        "course_id": str(data["Course_ID"]),
        "course_name": str(data.get("Course_Name", data["Course_ID"])),
        "course_category": str(data.get("Course_Category", "General")),
        "course_level": str(data.get("Course_Level", "Intermediate")),
        "course_format": str(data.get("Course_Format", "Cohort")),
        "enrollment_date": str(data.get("Enrollment_Date", "")),
        "last_activity_date": str(data.get("Last_Activity_Date", "")),
        "login_frequency": float(data["Login_Frequency"]),
        "video_completion": float(data["Video_Completion"]),
        "quiz_attempts": float(data["Quiz_Attempts"]),
        "assignment_submissions": float(data["Assignment_Submissions"]),
        "discussion_activity": float(data["Discussion_Activity"]),
        "completion_status": str(data["Completion_Status"]),
        "stage_1_engagement": float(data.get("Stage_1_Engagement", 0)),
        "stage_2_engagement": float(data.get("Stage_2_Engagement", 0)),
        "stage_3_engagement": float(data.get("Stage_3_Engagement", 0)),
        "stage_4_engagement": float(data.get("Stage_4_Engagement", 0)),
        "stage_5_engagement": float(data.get("Stage_5_Engagement", 0)),
        "engagement_score": float(data["Engagement_Score"]),
        "engagement_level": str(data["Engagement_Level"]),
        "early_engagement_index": float(data["Early_Engagement_Index"]),
        "dropout_probability": float(data["dropout_probability"]),
        "risk_level": str(data["risk_level"]),
        "intervention_priority": float(data["intervention_priority"]),
        "priority_level": str(data["priority_level"]),
        "primary_gap": str(data["primary_gap"]),
        "recommended_intervention": str(data["recommended_intervention"]),
        "course_average_engagement": float(data["course_average_engagement"]),
        "course_average_video": float(data["course_average_video"]),
        "course_average_login": float(data["course_average_login"]),
        "relative_video_completion": float(data["relative_video_completion"]),
        "relative_login_frequency": float(data["relative_login_frequency"]),
        "behavioral_diagnosis": data["behavioral_diagnosis"]
    }
