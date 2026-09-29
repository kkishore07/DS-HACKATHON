from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Text, JSON
from datetime import datetime
from app.database import Base

class Learner(Base):
    __tablename__ = "learners"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    learner_id = Column(String(50), index=True)
    course_id = Column(String(50), index=True)
    login_frequency = Column(Float, default=0.0)
    video_completion = Column(Float, default=0.0)
    quiz_attempts = Column(Float, default=0.0)
    assignment_submissions = Column(Float, default=0.0)
    discussion_activity = Column(Float, default=0.0)
    completion_status = Column(String(20), index=True) # "Completed" or "Not Completed"
    
    # Metadata
    course_name = Column(String(100), nullable=True)
    course_category = Column(String(50), nullable=True)
    course_level = Column(String(50), nullable=True)
    course_format = Column(String(50), nullable=True)
    course_modules = Column(Integer, nullable=True)
    enrollment_date = Column(String(30), nullable=True)
    last_activity_date = Column(String(30), nullable=True)
    
    # Stages
    stage_1_engagement = Column(Float, nullable=True)
    stage_2_engagement = Column(Float, nullable=True)
    stage_3_engagement = Column(Float, nullable=True)
    stage_4_engagement = Column(Float, nullable=True)
    stage_5_engagement = Column(Float, nullable=True)
    
    # Engineered features
    engagement_score = Column(Float, default=0.0)
    engagement_level = Column(String(30), default="Moderate Engagement")
    early_engagement_index = Column(Float, default=0.0)
    
    # ML & Risk predictions
    dropout_probability = Column(Float, default=0.0)
    risk_level = Column(String(20), default="Low Risk") # Low, Moderate, High, Critical
    intervention_priority = Column(Float, default=0.0)
    priority_level = Column(String(30), default="Low Priority") # Low Priority, Medium Priority, High Priority, Urgent Intervention
    primary_gap = Column(String(100), default="None")
    recommended_intervention = Column(Text, default="")
    
    created_at = Column(DateTime, default=datetime.utcnow)

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_id = Column(String(50), unique=True, index=True)
    course_name = Column(String(100), nullable=True)
    category = Column(String(50), nullable=True)
    level = Column(String(50), nullable=True)
    format = Column(String(50), nullable=True)
    modules = Column(Integer, nullable=True)
    total_learners = Column(Integer, default=0)
    completed_learners = Column(Integer, default=0)
    completion_rate = Column(Float, default=0.0)
    avg_engagement_score = Column(Float, default=0.0)
    avg_video_completion = Column(Float, default=0.0)
    avg_quiz_attempts = Column(Float, default=0.0)
    avg_assignment_submissions = Column(Float, default=0.0)
    avg_discussion_activity = Column(Float, default=0.0)
    risk_classification = Column(String(30), default="Healthy") # Healthy, Watch, High Risk
    updated_at = Column(DateTime, default=datetime.utcnow)

class LearnerActivity(Base):
    __tablename__ = "learner_activity"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    learner_id = Column(String(50), index=True)
    course_id = Column(String(50), index=True)
    activity_type = Column(String(50))
    metric_value = Column(Float)
    recorded_at = Column(DateTime, default=datetime.utcnow)

class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    run_timestamp = Column(DateTime, default=datetime.utcnow)
    algorithm = Column(String(50), default="RandomForestClassifier")
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    roc_auc = Column(Float)
    non_completer_recall = Column(Float)
    completer_recall = Column(Float)
    macro_f1 = Column(Float)
    training_samples = Column(Integer)
    testing_samples = Column(Integer)
    confusion_matrix = Column(JSON)
    feature_importances = Column(JSON)

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    learner_id = Column(String(50), index=True)
    course_id = Column(String(50), index=True)
    dropout_probability = Column(Float)
    risk_level = Column(String(30))
    engagement_score = Column(Float)
    early_engagement_index = Column(Float)
    predicted_at = Column(DateTime, default=datetime.utcnow)

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    learner_id = Column(String(50), index=True)
    course_id = Column(String(50), index=True)
    category = Column(String(50)) # Re-engagement, Video Support, Quiz Support, Assignment Support, Community Engagement, Academic Outreach
    title = Column(String(200))
    action_details = Column(Text)
    priority_score = Column(Float)
    priority_level = Column(String(30)) # Urgent Intervention, High Priority, Medium Priority, Low Priority
    status = Column(String(30), default="Pending") # Pending, In Progress, Completed, Dismissed
    assigned_to = Column(String(100), default="Learner Success Team")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_filename = Column(String(255))
    rows_processed = Column(Integer)
    duplicate_rows = Column(Integer)
    missing_values = Column(Integer)
    invalid_values = Column(Integer)
    corrected_records = Column(Integer)
    valid_records = Column(Integer)
    completion_rate = Column(Float)
    run_timestamp = Column(DateTime, default=datetime.utcnow)
