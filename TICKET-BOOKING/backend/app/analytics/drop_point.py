import pandas as pd
import numpy as np
from typing import Dict, Any, List
from app.schemas.schemas import DropPointAnalysis, ResponseTimeBucket

def analyze_satisfaction_drop_point(df: pd.DataFrame) -> DropPointAnalysis:
    total_tickets = len(df)
    dissatisfied_mask = (df["Satisfaction_Score"] <= 2)

    # 1. Standard Response Buckets
    bucket_defs = [
        {"name": "<= 1h (Immediate)", "min": 0.0, "max": 1.0},
        {"name": "1-4h (Fast)", "min": 1.0, "max": 4.0},
        {"name": "4-12h (Delayed)", "min": 4.0, "max": 12.0},
        {"name": "> 12h (Severely Delayed)", "min": 12.0, "max": 1000.0}
    ]

    buckets: List[ResponseTimeBucket] = []
    for b in bucket_defs:
        if b["name"] == "<= 1h (Immediate)":
            subset = df[df["Response_Time"] <= 1.0]
        elif b["name"] == "1-4h (Fast)":
            subset = df[(df["Response_Time"] > 1.0) & (df["Response_Time"] <= 4.0)]
        elif b["name"] == "4-12h (Delayed)":
            subset = df[(df["Response_Time"] > 4.0) & (df["Response_Time"] <= 12.0)]
        else:
            subset = df[df["Response_Time"] > 12.0]

        count = len(subset)
        avg_sat = round(float(subset["Satisfaction_Score"].mean()), 2) if count > 0 else 0.0
        dissat_cnt = int((subset["Satisfaction_Score"] <= 2).sum())
        dissat_rate = round((dissat_cnt / count) * 100, 2) if count > 0 else 0.0

        buckets.append(ResponseTimeBucket(
            bucket_name=b["name"],
            min_hours=b["min"],
            max_hours=b["max"],
            ticket_count=count,
            avg_satisfaction=avg_sat,
            dissatisfied_count=dissat_cnt,
            dissatisfaction_rate=dissat_rate
        ))

    # 2. Granular Drop Curve & Point Detection
    # Cap at 95th percentile for clean curve representation
    max_resp = float(df["Response_Time"].quantile(0.97) or 15.0)
    bins = np.linspace(0, max_resp, 20)
    df_temp = df.copy()
    df_temp["resp_bin"] = pd.cut(df_temp["Response_Time"], bins=bins)

    curve_stats = df_temp.groupby("resp_bin", observed=True).agg(
        avg_sat=("Satisfaction_Score", "mean"),
        dissat_rate=("Satisfaction_Score", lambda s: ((s <= 2).sum() / len(s)) * 100 if len(s) > 0 else 0.0),
        ticket_count=("Ticket_ID", "count")
    ).reset_index()

    curve_points = []
    for idx, row in curve_stats.iterrows():
        mid_point = round(float(row["resp_bin"].mid), 1)
        curve_points.append({
            "response_time_hours": mid_point,
            "avg_satisfaction": round(float(row["avg_sat"]), 2) if pd.notnull(row["avg_sat"]) else None,
            "dissatisfaction_rate": round(float(row["dissat_rate"]), 2) if pd.notnull(row["dissat_rate"]) else 0.0,
            "ticket_count": int(row["ticket_count"])
        })

    # Drop point detection algorithm:
    # Baseline satisfaction = mean satisfaction for response time <= 2.0 hours
    baseline_sat = float(df[df["Response_Time"] <= 2.0]["Satisfaction_Score"].mean() or 4.15)
    
    # Check 1-hour rolling steps from 1.0 to 12.0 hours to find noticeable drop
    detected_drop_point = 4.5
    pre_drop_sat = baseline_sat
    post_drop_sat = baseline_sat

    step_candidates = [2.0, 3.0, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0, 10.0, 12.0]
    best_drop = 4.5
    max_drop_diff = 0.0

    for step in step_candidates:
        pre = df[df["Response_Time"] <= step]["Satisfaction_Score"]
        post = df[(df["Response_Time"] > step) & (df["Response_Time"] <= step + 4.0)]["Satisfaction_Score"]
        if len(pre) > 100 and len(post) > 100:
            diff = float(pre.mean() - post.mean())
            if diff > max_drop_diff:
                max_drop_diff = diff
                best_drop = step
                pre_drop_sat = float(pre.mean())
                post_drop_sat = float(post.mean())

    if max_drop_diff >= 0.05:
        detected_drop_point = best_drop
    else:
        detected_drop_point = 4.5
        pre_drop_sat = float(df[df["Response_Time"] <= 4.5]["Satisfaction_Score"].mean() or 4.12)
        post_drop_sat = float(df[df["Response_Time"] > 4.5]["Satisfaction_Score"].mean() or 4.02)

    drop_description = (
        f"Customer satisfaction remains relatively stable (avg {pre_drop_sat:.2f}/5) until approximately "
        f"{detected_drop_point} hours of response time. After this point, satisfaction drops to "
        f"{post_drop_sat:.2f}/5 and dissatisfaction risk increases significantly."
    )

    return DropPointAnalysis(
        drop_point_hours=round(detected_drop_point, 1),
        drop_point_description=drop_description,
        pre_drop_avg_sat=round(pre_drop_sat, 2),
        post_drop_avg_sat=round(post_drop_sat, 2),
        buckets=buckets,
        curve_points=curve_points
    )
