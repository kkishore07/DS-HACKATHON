import os
import pandas as pd
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router, DEFAULT_DATASET_PATHS
from app.services.pipeline_service import run_full_pipeline, state
from app.models.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database & Auto-load default dataset if present
    print("[SupportPulse AI] Initializing database...")
    init_db()
    
    print("[SupportPulse AI] Checking for default dataset...")
    for path in DEFAULT_DATASET_PATHS:
        if os.path.exists(path):
            try:
                print(f"[SupportPulse AI] Auto-loading dataset from {path}...")
                df = pd.read_csv(path)
                run_full_pipeline(df)
                print(f"[SupportPulse AI] Pipeline successfully initialized with {len(df):,} records!")
                break
            except Exception as e:
                print(f"[SupportPulse AI] Warning: Could not auto-load {path}: {e}")
    yield
    print("[SupportPulse AI] Shutting down...")

app = FastAPI(
    title="SupportPulse AI API",
    description="Intelligent IT Support Analytics, Customer Frustration Detection & Resolution Optimization Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for Frontend (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "app": "SupportPulse AI",
        "tagline": "From Support Tickets to Actionable Intelligence",
        "status": "online",
        "dataset_loaded": state.is_initialized,
        "total_tickets": state.overview_kpis.total_tickets if state.overview_kpis else 0,
        "documentation": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "pipeline_initialized": state.is_initialized,
        "model_loaded": state.ml_pipeline is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
