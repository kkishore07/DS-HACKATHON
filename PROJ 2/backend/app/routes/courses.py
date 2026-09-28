from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.analytics_service import analytics_service
from app.schemas import CourseItem, CourseDetailResponse

router = APIRouter(prefix="/api/courses", tags=["Courses"])

@router.get("", response_model=List[CourseItem])
def get_courses(
    sort_by: Optional[str] = Query("completion_rate", description="Sort field: completion_rate, engagement, video_completion, assignments, learners"),
    order: Optional[str] = Query("desc", description="Order: asc or desc")
):
    if not analytics_service.is_initialized:
        raise HTTPException(status_code=503, detail="Analytics engine not initialized.")
        
    courses = analytics_service.get_course_structure_analysis()
    
    # Sorting
    key_map = {
        "completion_rate": "completion_rate",
        "engagement": "avg_engagement",
        "video_completion": "avg_video_completion",
        "assignments": "avg_assignment_submissions",
        "learners": "learners",
        "quiz": "avg_quiz_attempts"
    }
    sort_key = key_map.get(sort_by, "completion_rate")
    reverse = (order.lower() == "desc")
    courses.sort(key=lambda x: x.get(sort_key, 0), reverse=reverse)
    
    return courses

@router.get("/{course_id}", response_model=CourseDetailResponse)
def get_course_detail(course_id: str):
    if not analytics_service.is_initialized:
        raise HTTPException(status_code=503, detail="Analytics engine not initialized.")
        
    detail = analytics_service.get_course_detail(course_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Course {course_id} not found.")
    return detail
