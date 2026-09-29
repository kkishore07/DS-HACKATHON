from fastapi import APIRouter, HTTPException
from app.analytics_service import analytics_service
from app.schemas import OverviewResponse

router = APIRouter(prefix="/api/overview", tags=["Overview"])

@router.get("", response_model=OverviewResponse)
def get_overview_data():
    if not analytics_service.is_initialized:
        raise HTTPException(status_code=503, detail="Analytics engine not initialized. Please upload data or wait for initial load.")
    data = analytics_service.get_overview()
    return data
