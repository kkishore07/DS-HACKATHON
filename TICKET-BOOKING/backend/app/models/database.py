import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./supportpulse.db")

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TicketRecord(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(String(50), unique=True, index=True)
    category = Column(String(100), index=True)
    description = Column(Text)
    priority = Column(String(50), index=True)
    response_time = Column(Float)
    resolution_time = Column(Float)
    team = Column(String(100), index=True)
    satisfaction_score = Column(Float)
    created_at = Column(String(50), nullable=True)
    channel = Column(String(50), nullable=True)
    sla_target_hours = Column(Float, nullable=True)
    sla_breached = Column(Boolean, nullable=True)
    reopened = Column(Boolean, nullable=True)
    
    # Computed fields
    friction_score = Column(Float, nullable=True)
    friction_tier = Column(String(50), nullable=True)
    expected_resolution_time = Column(Float, nullable=True)
    resolution_deviation = Column(Float, nullable=True)
    resolution_efficiency = Column(Float, nullable=True)
    satisfaction_risk = Column(String(50), nullable=True)
    nlp_cluster = Column(Integer, nullable=True)
    nlp_theme = Column(String(150), nullable=True)

class ThemeRecord(Base):
    __tablename__ = "themes"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, unique=True)
    theme_name = Column(String(200))
    top_keywords = Column(Text)  # JSON or comma-separated
    ticket_count = Column(Integer)
    avg_satisfaction = Column(Float)
    dissatisfaction_rate = Column(Float)
    avg_response_time = Column(Float)
    avg_resolution_time = Column(Float)
    avg_friction_score = Column(Float)

class ModelMetricRecord(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100))
    trained_at = Column(DateTime, default=datetime.utcnow)
    train_size = Column(Integer)
    test_size = Column(Integer)
    accuracy = Column(Float)
    macro_f1 = Column(Float)
    weighted_f1 = Column(Float)
    high_risk_recall = Column(Float)
    high_risk_precision = Column(Float)
    high_risk_f1 = Column(Float)
    confusion_matrix_json = Column(Text)
    informative_features_json = Column(Text)

class PredictionLog(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    description = Column(Text)
    category = Column(String(100))
    priority = Column(String(50))
    team = Column(String(100))
    response_time = Column(Float)
    predicted_risk = Column(String(50))
    risk_probability = Column(Float)
    primary_indicators = Column(Text)
    recommended_action = Column(Text)

class AnalysisRunRecord(Base):
    __tablename__ = "analysis_runs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    total_rows = Column(Integer)
    duplicates_removed = Column(Integer)
    missing_handled = Column(Integer)
    invalid_records = Column(Integer)
    response_outliers = Column(Integer)
    resolution_outliers = Column(Integer)
    status = Column(String(50))

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
