import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any
from app.config import settings

def normalize_completion_status(val: Any) -> str:
    """Normalize completion status values according to specification."""
    if pd.isna(val):
        return "Not Completed"
    s = str(val).strip().lower()
    if s in ["completed", "complete", "yes", "1", "true", "y", "pass"]:
        return "Completed"
    elif s in ["not completed", "incomplete", "no", "0", "false", "n", "fail"]:
        return "Not Completed"
    return "Not Completed"

def process_and_validate_dataset(
    df: pd.DataFrame,
    weight_login: float = settings.WEIGHT_LOGIN,
    weight_video: float = settings.WEIGHT_VIDEO,
    weight_quiz: float = settings.WEIGHT_QUIZ,
    weight_assignment: float = settings.WEIGHT_ASSIGNMENT,
    weight_discussion: float = settings.WEIGHT_DISCUSSION,
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Validates, cleans, and engineers features for the learner dataset.
    Returns:
        cleaned_df: fully preprocessed and feature-engineered DataFrame
        validation_summary: dictionary of data quality metrics
    """
    total_rows = len(df)
    
    # 1. Clean column names
    df.columns = [c.strip() for c in df.columns]
    
    # Required columns check
    required_cols = [
        "Learner_ID", "Course_ID", "Login_Frequency",
        "Video_Completion", "Quiz_Attempts", "Assignment_Submissions",
        "Discussion_Activity", "Completion_Status"
    ]
    for col in required_cols:
        if col not in df.columns:
            # Fallback for slight variations
            matches = [c for c in df.columns if col.lower() in c.lower()]
            if matches:
                df.rename(columns={matches[0]: col}, inplace=True)
            else:
                if col in ["Discussion_Activity", "Quiz_Attempts", "Assignment_Submissions"]:
                    df[col] = 0.0
                elif col == "Login_Frequency":
                    df[col] = 1.0
                elif col == "Video_Completion":
                    df[col] = 50.0
                elif col == "Completion_Status":
                    df[col] = "Not Completed"
                else:
                    df[col] = f"UNKNOWN_{col}"

    # Track missing values
    missing_count = int(df[required_cols].isnull().sum().sum())
    
    # 2. Duplicate detection on Learner_ID + Course_ID
    duplicate_mask = df.duplicated(subset=["Learner_ID", "Course_ID"], keep="first")
    duplicate_count = int(duplicate_mask.sum())
    
    # Retain first occurrence, drop remaining duplicates
    df_cleaned = df[~duplicate_mask].copy().reset_index(drop=True)
    duplicates_retained = len(df_cleaned)
    
    # 3. Completion Status normalization
    df_cleaned["Completion_Status"] = df_cleaned["Completion_Status"].apply(normalize_completion_status)
    
    # 4. Numerical validation and correction
    invalid_values_count = 0
    corrected_records_count = 0
    
    # Login Frequency: must be >= 0
    invalid_logins = (df_cleaned["Login_Frequency"] < 0) | (df_cleaned["Login_Frequency"].isna())
    invalid_values_count += int(invalid_logins.sum())
    df_cleaned["Login_Frequency"] = pd.to_numeric(df_cleaned["Login_Frequency"], errors="coerce").fillna(0.0)
    df_cleaned["Login_Frequency"] = df_cleaned["Login_Frequency"].clip(lower=0.0)
    
    # Video Completion: normalize 0-1 to 0-100, clip to [0, 100]
    df_cleaned["Video_Completion"] = pd.to_numeric(df_cleaned["Video_Completion"], errors="coerce").fillna(0.0)
    # Check if format is 0-1
    if df_cleaned["Video_Completion"].max() <= 1.0 and df_cleaned["Video_Completion"].max() > 0:
        df_cleaned["Video_Completion"] = df_cleaned["Video_Completion"] * 100.0
        corrected_records_count += len(df_cleaned)
    invalid_video = (df_cleaned["Video_Completion"] < 0) | (df_cleaned["Video_Completion"] > 100)
    invalid_values_count += int(invalid_video.sum())
    df_cleaned["Video_Completion"] = df_cleaned["Video_Completion"].clip(0.0, 100.0)
    
    # Quiz attempts >= 0
    df_cleaned["Quiz_Attempts"] = pd.to_numeric(df_cleaned["Quiz_Attempts"], errors="coerce").fillna(0.0)
    invalid_quizzes = df_cleaned["Quiz_Attempts"] < 0
    invalid_values_count += int(invalid_quizzes.sum())
    df_cleaned["Quiz_Attempts"] = df_cleaned["Quiz_Attempts"].clip(lower=0.0)
    
    # Assignment submissions >= 0
    df_cleaned["Assignment_Submissions"] = pd.to_numeric(df_cleaned["Assignment_Submissions"], errors="coerce").fillna(0.0)
    invalid_assignments = df_cleaned["Assignment_Submissions"] < 0
    invalid_values_count += int(invalid_assignments.sum())
    df_cleaned["Assignment_Submissions"] = df_cleaned["Assignment_Submissions"].clip(lower=0.0)
    
    # Discussion activity >= 0
    df_cleaned["Discussion_Activity"] = pd.to_numeric(df_cleaned["Discussion_Activity"], errors="coerce")
    discussion_median = df_cleaned["Discussion_Activity"].median() if not df_cleaned["Discussion_Activity"].dropna().empty else 2.0
    df_cleaned["Discussion_Activity"] = df_cleaned["Discussion_Activity"].fillna(discussion_median)
    invalid_discussion = df_cleaned["Discussion_Activity"] < 0
    invalid_values_count += int(invalid_discussion.sum())
    df_cleaned["Discussion_Activity"] = df_cleaned["Discussion_Activity"].clip(lower=0.0)
    
    corrected_records_count += invalid_values_count
    
    # 5. Optional metadata columns handling
    if "Course_Name" not in df_cleaned.columns or df_cleaned["Course_Name"].isnull().all():
        df_cleaned["Course_Name"] = df_cleaned["Course_ID"].astype(str)
    else:
        df_cleaned["Course_Name"] = df_cleaned["Course_Name"].fillna(df_cleaned["Course_ID"])
        
    for opt_col in ["Course_Category", "Course_Level", "Course_Format"]:
        if opt_col not in df_cleaned.columns:
            df_cleaned[opt_col] = "General"
        else:
            df_cleaned[opt_col] = df_cleaned[opt_col].fillna("General")
            
    if "Course_Modules" not in df_cleaned.columns:
        df_cleaned["Course_Modules"] = 10
    else:
        df_cleaned["Course_Modules"] = pd.to_numeric(df_cleaned["Course_Modules"], errors="coerce").fillna(10).astype(int)
        
    if "Enrollment_Date" not in df_cleaned.columns:
        df_cleaned["Enrollment_Date"] = "2025-09-01"
    else:
        df_cleaned["Enrollment_Date"] = df_cleaned["Enrollment_Date"].fillna("2025-09-01")
        
    if "Last_Activity_Date" not in df_cleaned.columns:
        df_cleaned["Last_Activity_Date"] = "2026-01-15"
    else:
        df_cleaned["Last_Activity_Date"] = df_cleaned["Last_Activity_Date"].fillna("2026-01-15")

    # 6. Behavioral Score Normalization (0-100)
    # Calculate 99th percentile max for safe normalization without outlier distortion
    max_login = max(float(df_cleaned["Login_Frequency"].quantile(0.99)), 1.0)
    max_quiz = max(float(df_cleaned["Quiz_Attempts"].quantile(0.99)), 1.0)
    max_assign = max(float(df_cleaned["Assignment_Submissions"].quantile(0.99)), 1.0)
    max_disc = max(float(df_cleaned["Discussion_Activity"].quantile(0.99)), 1.0)
    
    norm_login = (df_cleaned["Login_Frequency"] / max_login).clip(0.0, 1.0) * 100.0
    norm_video = df_cleaned["Video_Completion"].clip(0.0, 100.0)
    norm_quiz = (df_cleaned["Quiz_Attempts"] / max_quiz).clip(0.0, 1.0) * 100.0
    norm_assign = (df_cleaned["Assignment_Submissions"] / max_assign).clip(0.0, 1.0) * 100.0
    norm_disc = (df_cleaned["Discussion_Activity"] / max_disc).clip(0.0, 1.0) * 100.0
    
    df_cleaned["norm_login"] = norm_login
    df_cleaned["norm_video"] = norm_video
    df_cleaned["norm_quiz"] = norm_quiz
    df_cleaned["norm_assign"] = norm_assign
    df_cleaned["norm_disc"] = norm_disc

    # 7. Engagement Score Calculation
    # Engagement Score = 0.25*Login + 0.25*Video + 0.20*Quiz + 0.20*Assignment + 0.10*Discussion
    calc_engagement = (
        weight_login * norm_login +
        weight_video * norm_video +
        weight_quiz * norm_quiz +
        weight_assignment * norm_assign +
        weight_discussion * norm_disc
    ).clip(0.0, 100.0).round(2)
    
    if "Engagement_Score" not in df_cleaned.columns or df_cleaned["Engagement_Score"].isnull().any():
        df_cleaned["Engagement_Score"] = calc_engagement
    else:
        # Use provided or fallback if null
        df_cleaned["Engagement_Score"] = pd.to_numeric(df_cleaned["Engagement_Score"], errors="coerce").fillna(calc_engagement)
        df_cleaned["Engagement_Score"] = df_cleaned["Engagement_Score"].clip(0.0, 100.0).round(2)
        
    # Engagement Level classification
    # 0–30: Low Engagement, 31–60: Moderate, 61–80: High, 81–100: Very High
    def get_engagement_level(score: float) -> str:
        if score <= 30.0:
            return "Low Engagement"
        elif score <= 60.0:
            return "Moderate Engagement"
        elif score <= 80.0:
            return "High Engagement"
        else:
            return "Very High Engagement"
            
    df_cleaned["Engagement_Level"] = df_cleaned["Engagement_Score"].apply(get_engagement_level)

    # 8. Early Engagement Index
    # If not present or missing, calculate:
    # 30% Login + 25% Early Video + 20% Early Quiz + 15% Early Assignment + 10% Early Discussion
    calc_early = (
        0.30 * norm_login +
        0.25 * norm_video * 0.9 +
        0.20 * norm_quiz +
        0.15 * norm_assign +
        0.10 * norm_disc
    ).clip(0.0, 100.0).round(2)
    
    if "Early_Engagement_Index" not in df_cleaned.columns or df_cleaned["Early_Engagement_Index"].isnull().any():
        df_cleaned["Early_Engagement_Index"] = calc_early
    else:
        df_cleaned["Early_Engagement_Index"] = pd.to_numeric(df_cleaned["Early_Engagement_Index"], errors="coerce").fillna(calc_early)
        df_cleaned["Early_Engagement_Index"] = df_cleaned["Early_Engagement_Index"].clip(0.0, 100.0).round(2)

    # 9. Stage Engagements (1 to 5)
    stage_cols = [f"Stage_{i}_Engagement" for i in range(1, 6)]
    has_stages = all(col in df_cleaned.columns for col in stage_cols)
    if not has_stages:
        # Derive realistic progressive proxy if missing
        # Stage 1 starts around Early Engagement, Stage 5 matches relative final engagement
        decay_factor = np.where(df_cleaned["Completion_Status"] == "Completed", 0.85, 0.45)
        df_cleaned["Stage_1_Engagement"] = (df_cleaned["Early_Engagement_Index"] * 1.05).clip(0.0, 100.0).round(2)
        df_cleaned["Stage_2_Engagement"] = (df_cleaned["Early_Engagement_Index"] * 0.95).clip(0.0, 100.0).round(2)
        df_cleaned["Stage_3_Engagement"] = (df_cleaned["Early_Engagement_Index"] * (0.8 + 0.1 * decay_factor)).clip(0.0, 100.0).round(2)
        df_cleaned["Stage_4_Engagement"] = (df_cleaned["Engagement_Score"] * (0.7 + 0.3 * decay_factor)).clip(0.0, 100.0).round(2)
        df_cleaned["Stage_5_Engagement"] = (df_cleaned["Engagement_Score"] * decay_factor).clip(0.0, 100.0).round(2)
    else:
        for c in stage_cols:
            df_cleaned[c] = pd.to_numeric(df_cleaned[c], errors="coerce").fillna(df_cleaned["Engagement_Score"]).clip(0.0, 100.0).round(2)

    # 10. Course-relative metrics (Learner behavior relative to course average)
    course_means = df_cleaned.groupby("Course_ID")[["Video_Completion", "Login_Frequency", "Engagement_Score"]].transform("mean")
    df_cleaned["Course_Avg_Video"] = course_means["Video_Completion"].round(2)
    df_cleaned["Course_Avg_Login"] = course_means["Login_Frequency"].round(2)
    df_cleaned["Course_Avg_Engagement"] = course_means["Engagement_Score"].round(2)
    
    df_cleaned["Relative_Video_Completion"] = (df_cleaned["Video_Completion"] / (df_cleaned["Course_Avg_Video"] + 1e-5)).round(2)
    df_cleaned["Relative_Login_Frequency"] = (df_cleaned["Login_Frequency"] / (df_cleaned["Course_Avg_Login"] + 1e-5)).round(2)
    df_cleaned["Relative_Engagement"] = (df_cleaned["Engagement_Score"] / (df_cleaned["Course_Avg_Engagement"] + 1e-5)).round(2)

    # 11. Rates
    df_cleaned["Quiz_Activity_Rate"] = (df_cleaned["Quiz_Attempts"] / max_quiz).clip(0.0, 1.0).round(3)
    df_cleaned["Assignment_Participation_Rate"] = (df_cleaned["Assignment_Submissions"] / max_assign).clip(0.0, 1.0).round(3)
    df_cleaned["Discussion_Participation"] = (df_cleaned["Discussion_Activity"] / max_disc).clip(0.0, 1.0).round(3)

    # Validation summary
    valid_records = len(df_cleaned)
    validation_summary = {
        "rows_processed": total_rows,
        "duplicate_rows": duplicate_count,
        "missing_values": missing_count,
        "invalid_values": invalid_values_count,
        "corrected_records": corrected_records_count,
        "valid_records": valid_records,
        "duplicates_retained": duplicates_retained,
        "message": f"Successfully processed {valid_records} valid learner records. Detected and handled {duplicate_count} duplicate rows, {missing_count} missing values, and {invalid_values_count} invalid numerical values."
    }

    return df_cleaned, validation_summary
