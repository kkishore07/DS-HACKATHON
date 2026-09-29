import pandas as pd
import numpy as np
from typing import List, Tuple
from app.schemas.schemas import TeamBenchmark

def analyze_teams(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[TeamBenchmark]]:
    # 1. Establish Complexity Baseline: Category + Priority median resolution time
    baseline = df.groupby(["Category", "Priority"])["Resolution_Time"].median().rename("Expected_Resolution_Time")
    
    # Merge baseline back into df
    df_merged = df.merge(baseline, on=["Category", "Priority"], how="left")
    # Fallback to overall median if NaN
    overall_median = float(df["Resolution_Time"].median() or 16.0)
    df_merged["Expected_Resolution_Time"] = df_merged["Expected_Resolution_Time"].fillna(overall_median)

    # Compute deviation and efficiency
    df_merged["Resolution_Deviation"] = df_merged["Resolution_Time"] - df_merged["Expected_Resolution_Time"]
    df_merged["Resolution_Efficiency"] = (
        df_merged["Expected_Resolution_Time"] / df_merged["Resolution_Time"].replace(0, 0.01)
    ).clip(0.0, 5.0)

    # 2. Team Aggregates
    team_stats = df_merged.groupby("Team").agg(
        ticket_count=("Ticket_ID", "count"),
        avg_response_time=("Response_Time", "mean"),
        median_response_time=("Response_Time", "median"),
        avg_resolution_time=("Resolution_Time", "mean"),
        median_resolution_time=("Resolution_Time", "median"),
        avg_expected_resolution=("Expected_Resolution_Time", "mean"),
        avg_resolution_deviation=("Resolution_Deviation", "mean"),
        resolution_efficiency=("Resolution_Efficiency", "mean"),
        avg_satisfaction=("Satisfaction_Score", "mean"),
        friction_score=("Friction_Score", "mean") if "Friction_Score" in df_merged.columns else ("Satisfaction_Score", lambda x: 0.3)
    ).reset_index()

    # Filter out empty or tiny unknown teams from stats calculation if needed, or retain all
    mean_dev = float(team_stats["avg_resolution_deviation"].mean())
    std_dev = float(team_stats["avg_resolution_deviation"].std() or 1.0)

    benchmarks: List[TeamBenchmark] = []
    for _, row in team_stats.iterrows():
        team_name = str(row["Team"])
        dev = float(row["avg_resolution_deviation"])
        z = (dev - mean_dev) / std_dev if std_dev > 0 else 0.0
        
        if z > 1.2:
            status = "Anomalous"
            explanation = f"Resolution time is +{dev:.1f} hrs above expected baseline for handled ticket complexity."
        elif z > 0.5:
            status = "Watch"
            explanation = f"Resolution time shows elevated deviation (+{dev:.1f} hrs) relative to baseline."
        else:
            status = "Normal"
            if dev < 0:
                explanation = f"Resolving {abs(dev):.1f} hrs faster than expected complexity baseline."
            else:
                explanation = f"Performance aligns with expected SLA baseline (+{dev:.1f} hrs)."

        benchmarks.append(TeamBenchmark(
            team=team_name,
            ticket_count=int(row["ticket_count"]),
            avg_response_time=round(float(row["avg_response_time"]), 2),
            median_response_time=round(float(row["median_response_time"]), 2),
            avg_resolution_time=round(float(row["avg_resolution_time"]), 2),
            median_resolution_time=round(float(row["median_resolution_time"]), 2),
            avg_expected_resolution=round(float(row["avg_expected_resolution"]), 2),
            avg_resolution_deviation=round(dev, 2),
            resolution_efficiency=round(float(row["resolution_efficiency"]), 2),
            avg_satisfaction=round(float(row["avg_satisfaction"]), 2),
            friction_score=round(float(row["friction_score"]), 3),
            z_score=round(z, 2),
            status=status,
            explanation=explanation
        ))

    # Sort anomalous / high deviation first
    benchmarks.sort(key=lambda x: x.avg_resolution_deviation, reverse=True)
    return df_merged, benchmarks
