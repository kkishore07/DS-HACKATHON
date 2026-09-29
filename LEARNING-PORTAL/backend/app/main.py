import os
import time
import pandas as pd
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.analytics_service import analytics_service
from app.routes import (
    overview,
    learners,
    courses,
    engagement,
    risk,
    interventions,
    model,
    upload
)

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load default dataset if available
    print(f"[{settings.APP_NAME}] Initializing backend application...")
    dataset_file = settings.dataset_file_path
    if os.path.exists(dataset_file):
        try:
            print(f"[{settings.APP_NAME}] Loading default dataset from {dataset_file}...")
            t0 = time.time()
            df = pd.read_csv(dataset_file)
            summary = analytics_service.load_and_initialize(df)
            print(f"[{settings.APP_NAME}] Dataset initialized in {time.time()-t0:.2f}s: {summary['valid_records']} valid records loaded.")
        except Exception as e:
            print(f"[{settings.APP_NAME}] Error loading default dataset: {e}")
    else:
        print(f"[{settings.APP_NAME}] Default dataset not found at {dataset_file}. Ready for CSV upload.")
    yield
    print(f"[{settings.APP_NAME}] Shutting down...")

app = FastAPI(
    title=settings.APP_NAME,
    description="Early-Warning Student Dropout & Course Completion Intelligence Platform",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(overview.router)
app.include_router(learners.router)
app.include_router(courses.router)
app.include_router(engagement.router)
app.include_router(risk.router)
app.include_router(interventions.router)
app.include_router(model.router)
app.include_router(upload.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "initialized": analytics_service.is_initialized,
        "total_records": len(analytics_service.df) if analytics_service.df is not None else 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
