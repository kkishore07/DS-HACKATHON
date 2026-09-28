import pandas as pd
from typing import List
from app.schemas.schemas import CategoryFrictionPoint

def analyze_categories(df: pd.DataFrame) -> List[CategoryFrictionPoint]:
    total_tickets = len(df)
    if total_tickets == 0:
        return []

    cat_stats = df.groupby("Category").agg(
        ticket_count=("Ticket_ID", "count"),
        avg_response_time=("Response_Time", "mean"),
        avg_resolution_time=("Resolution_Time", "mean"),
        avg_satisfaction=("Satisfaction_Score", "mean"),
        friction_score=("Friction_Score", "mean") if "Friction_Score" in df.columns else ("Satisfaction_Score", lambda x: 0.3)
    ).reset_index()

    cat_points: List[CategoryFrictionPoint] = []
    for _, row in cat_stats.iterrows():
        count = int(row["ticket_count"])
        pct = round((count / total_tickets) * 100, 2)
        f_score = round(float(row["friction_score"]), 3)
        sat = round(float(row["avg_satisfaction"]), 2)
        
        # Risk assessment: based on low satisfaction & high friction
        if f_score >= 0.35 or sat < 4.0:
            risk = "High"
        elif f_score >= 0.28 or sat < 4.15:
            risk = "Medium"
        else:
            risk = "Low"

        cat_points.append(CategoryFrictionPoint(
            category=str(row["Category"]),
            ticket_count=count,
            percentage=pct,
            avg_response_time=round(float(row["avg_response_time"]), 2),
            avg_resolution_time=round(float(row["avg_resolution_time"]), 2),
            avg_satisfaction=sat,
            friction_score=f_score,
            risk_level=risk
        ))

    # Sort by ticket volume descending
    cat_points.sort(key=lambda x: x.ticket_count, reverse=True)
    return cat_points
