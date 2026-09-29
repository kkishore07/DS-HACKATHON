import io
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.analytics_service import analytics_service
from app.schemas import ValidationSummary

router = APIRouter(prefix="/api/upload", tags=["Upload"])

@router.post("", response_model=ValidationSummary)
async def upload_csv_file(file: UploadFile = File(...)):
    """
    Receives CSV file, validates columns and content, cleans,
    engineers features, updates ML model and analytics cache.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV files are supported.")
        
    try:
        content = await file.read()
        # Limit 50MB
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum allowed size is 50MB.")
            
        df_raw = pd.read_csv(io.BytesIO(content))
        
        # Check that at least Learner_ID or activity columns exist
        summary = analytics_service.load_and_initialize(df_raw)
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to process CSV file: {str(e)}")
