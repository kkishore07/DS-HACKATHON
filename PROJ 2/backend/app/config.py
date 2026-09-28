import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    APP_NAME: str = "LearnPulse AI"
    APP_VERSION: str = "1.0.0"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'learnpulse.db'}"
    
    # Dataset & ML Model Artifacts
    DATASET_PATH: str = "learnpulse_ai_edtech_dropout_25000.csv"
    
    @property
    def dataset_file_path(self) -> str:
        candidates = [
            BASE_DIR.parent / "learnpulse_ai_edtech_dropout_25000.csv",
            Path("learnpulse_ai_edtech_dropout_25000.csv"),
            BASE_DIR / self.DATASET_PATH,
            Path(self.DATASET_PATH),
            Path.cwd() / "learnpulse_ai_edtech_dropout_25000.csv"
        ]
        for c in candidates:
            if c.exists() and c.is_file():
                return str(c.resolve())
        return str((BASE_DIR.parent / "learnpulse_ai_edtech_dropout_25000.csv").resolve())

    ARTIFACTS_DIR: str = str(BASE_DIR / "model_artifacts")
    
    @property
    def model_file_path(self) -> str:
        p = Path(self.MODEL_PATH)
        if not p.is_absolute():
            return str((BASE_DIR / p).resolve())
        return str(p.resolve())

    @property
    def metrics_file_path(self) -> str:
        p = Path(self.METRICS_PATH)
        if not p.is_absolute():
            return str((BASE_DIR / p).resolve())
        return str(p.resolve())

    @property
    def feature_meta_file_path(self) -> str:
        p = Path(self.FEATURE_META_PATH)
        if not p.is_absolute():
            return str((BASE_DIR / p).resolve())
        return str(p.resolve())

    MODEL_PATH: str = "model_artifacts/random_forest_model.joblib"
    METRICS_PATH: str = "model_artifacts/metrics.json"
    FEATURE_META_PATH: str = "model_artifacts/feature_metadata.json"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,*"
    
    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    
    # Engagement Score Weights
    WEIGHT_LOGIN: float = 0.25
    WEIGHT_VIDEO: float = 0.25
    WEIGHT_QUIZ: float = 0.20
    WEIGHT_ASSIGNMENT: float = 0.20
    WEIGHT_DISCUSSION: float = 0.10
    
    # Risk Thresholds
    RISK_LOW_MAX: float = 0.30
    RISK_MODERATE_MAX: float = 0.60
    RISK_HIGH_MAX: float = 0.80

    class Config:
        env_file = str(BASE_DIR / ".env")
        extra = "allow"

settings = Settings()
