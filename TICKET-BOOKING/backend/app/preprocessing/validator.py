import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List
from app.schemas.schemas import ValidationSummary, ColumnMissingInfo, OutlierSummary

REQUIRED_COLUMNS = [
    "Ticket_ID", "Category", "Description", "Priority", 
    "Response_Time", "Resolution_Time", "Team", "Satisfaction_Score"
]

def compute_iqr_outliers(series: pd.Series, name: str) -> OutlierSummary:
    clean_series = series.dropna()
    clean_series = clean_series[clean_series >= 0]
    if len(clean_series) == 0:
        return OutlierSummary(
            metric=name, q1=0.0, q3=0.0, iqr=0.0, lower_bound=0.0,
            upper_bound=0.0, outlier_count=0, outlier_percentage=0.0
        )
    q1 = float(np.percentile(clean_series, 25))
    q3 = float(np.percentile(clean_series, 75))
    iqr = q3 - q1
    lower_bound = max(0.0, q1 - 1.5 * iqr)
    upper_bound = q3 + 1.5 * iqr
    outliers = clean_series[(clean_series < lower_bound) | (clean_series > upper_bound)]
    outlier_count = int(len(outliers))
    outlier_percentage = round((outlier_count / len(clean_series)) * 100, 2)
    return OutlierSummary(
        metric=name,
        q1=round(q1, 2),
        q3=round(q3, 2),
        iqr=round(iqr, 2),
        lower_bound=round(lower_bound, 2),
        upper_bound=round(upper_bound, 2),
        outlier_count=outlier_count,
        outlier_percentage=outlier_percentage
    )

def validate_and_clean_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, ValidationSummary]:
    total_raw_rows = len(df)
    missing_breakdown: List[ColumnMissingInfo] = []

    # Check required columns
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Uploaded dataset is missing required columns: {missing_cols}")

    # 1. Missing Value Detection
    total_missing_cells = 0
    for col in df.columns:
        m_count = int(df[col].isnull().sum())
        total_missing_cells += m_count
        m_pct = round((m_count / total_raw_rows) * 100, 2) if total_raw_rows > 0 else 0.0
        
        # Strategy description
        if col in ["Description", "Category", "Priority", "Team", "Channel"]:
            strategy = "Impute with 'Unknown'"
        elif col in ["Response_Time", "Resolution_Time"]:
            strategy = "Median imputation"
        elif col == "Satisfaction_Score":
            strategy = "Target column - discard invalid rows"
        else:
            strategy = "Mode/Default imputation"
            
        missing_breakdown.append(ColumnMissingInfo(
            column=col,
            missing_count=m_count,
            missing_percentage=m_pct,
            imputation_strategy=strategy
        ))

    # 2. Duplicate Detection
    dup_rows = int(df.duplicated().sum())
    dup_ids = int(df["Ticket_ID"].duplicated().sum())
    # Drop duplicate ticket IDs keeping first
    df_clean = df.drop_duplicates(subset=["Ticket_ID"]).copy()
    duplicates_removed = total_raw_rows - len(df_clean)

    # 3. Data Type Validation & Coercion
    df_clean["Ticket_ID"] = df_clean["Ticket_ID"].astype(str)
    df_clean["Category"] = df_clean["Category"].fillna("Unknown").astype(str).str.strip()
    df_clean["Description"] = df_clean["Description"].fillna("Unknown").astype(str).str.strip()
    df_clean["Priority"] = df_clean["Priority"].fillna("Medium").astype(str).str.strip()
    df_clean["Team"] = df_clean["Team"].fillna("Unknown").astype(str).str.strip()

    if "Channel" in df_clean.columns:
        df_clean["Channel"] = df_clean["Channel"].fillna("Unknown").astype(str)
    if "SLA_Breached" in df_clean.columns:
        df_clean["SLA_Breached"] = df_clean["SLA_Breached"].fillna(False).astype(bool)
    if "Reopened" in df_clean.columns:
        df_clean["Reopened"] = df_clean["Reopened"].fillna(False).astype(bool)

    # Numeric conversions safely
    df_clean["Response_Time"] = pd.to_numeric(df_clean["Response_Time"], errors="coerce")
    df_clean["Resolution_Time"] = pd.to_numeric(df_clean["Resolution_Time"], errors="coerce")
    df_clean["Satisfaction_Score"] = pd.to_numeric(df_clean["Satisfaction_Score"], errors="coerce")

    # Handle numeric missing via median
    resp_median = float(df_clean["Response_Time"][df_clean["Response_Time"] >= 0].median() or 4.0)
    res_median = float(df_clean["Resolution_Time"][df_clean["Resolution_Time"] >= 0].median() or 16.0)
    df_clean["Response_Time"] = df_clean["Response_Time"].fillna(resp_median)
    df_clean["Resolution_Time"] = df_clean["Resolution_Time"].fillna(res_median)

    # 4. Remove invalid records (negative times or invalid satisfaction outside 1-5)
    valid_mask = (
        (df_clean["Response_Time"] >= 0) & 
        (df_clean["Resolution_Time"] >= 0) & 
        (df_clean["Satisfaction_Score"].notnull()) & 
        (df_clean["Satisfaction_Score"] >= 1) & 
        (df_clean["Satisfaction_Score"] <= 5)
    )
    invalid_records_removed = int((~valid_mask).sum())
    df_clean = df_clean[valid_mask].copy()

    # Outlier detection via IQR
    outlier_analysis = [
        compute_iqr_outliers(df_clean["Response_Time"], "Response_Time (hours)"),
        compute_iqr_outliers(df_clean["Resolution_Time"], "Resolution_Time (hours)")
    ]

    # Flag outliers rather than dropping
    resp_out = outlier_analysis[0]
    res_out = outlier_analysis[1]
    df_clean["Is_Response_Outlier"] = (df_clean["Response_Time"] > resp_out.upper_bound)
    df_clean["Is_Resolution_Outlier"] = (df_clean["Resolution_Time"] > res_out.upper_bound)

    clean_rows = len(df_clean)

    summary = ValidationSummary(
        total_raw_rows=total_raw_rows,
        clean_rows=clean_rows,
        duplicates_removed=duplicates_removed,
        missing_values_handled=total_missing_cells,
        invalid_records_removed=invalid_records_removed,
        missing_breakdown=missing_breakdown,
        outlier_analysis=outlier_analysis,
        status="success"
    )

    return df_clean, summary
