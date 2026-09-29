import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from app.schemas.schemas import FrictionDistribution

DEFAULT_WEIGHTS = {
    "response_delay": 0.30,
    "resolution_delay": 0.30,
    "priority_severity": 0.20,
    "satisfaction_penalty": 0.20
}

PRIORITY_MAP = {
    "Low": 0.1,
    "Medium": 0.4,
    "High": 0.7,
    "Urgent": 1.0
}

def compute_friction_scores(df: pd.DataFrame, weights: Dict[str, float] = None) -> Tuple[pd.DataFrame, FrictionDistribution]:
    if weights is None:
        weights = DEFAULT_WEIGHTS

    w_resp = weights.get("response_delay", 0.30)
    w_res = weights.get("resolution_delay", 0.30)
    w_prio = weights.get("priority_severity", 0.20)
    w_sat = weights.get("satisfaction_penalty", 0.20)

    # Robust normalization: use 99th percentile to prevent extreme single outliers from compressing all other scores
    resp_p99 = float(df["Response_Time"].quantile(0.99) or 1.0)
    res_p99 = float(df["Resolution_Time"].quantile(0.99) or 1.0)

    norm_resp = np.clip(df["Response_Time"] / max(resp_p99, 1.0), 0.0, 1.0)
    norm_res = np.clip(df["Resolution_Time"] / max(res_p99, 1.0), 0.0, 1.0)

    norm_prio = df["Priority"].map(PRIORITY_MAP).fillna(0.4)
    # Satisfaction penalty: score 1 -> 1.0 penalty, score 5 -> 0.0 penalty
    norm_sat = (5.0 - df["Satisfaction_Score"].clip(1.0, 5.0)) / 4.0

    friction = (
        w_resp * norm_resp +
        w_res * norm_res +
        w_prio * norm_prio +
        w_sat * norm_sat
    ).round(4)

    df["Friction_Score"] = friction

    def get_tier(score: float) -> str:
        if score <= 0.30:
            return "Low Friction"
        elif score <= 0.60:
            return "Moderate Friction"
        else:
            return "Critical Friction"

    df["Friction_Tier"] = df["Friction_Score"].apply(get_tier)

    total = len(df)
    low_cnt = int((df["Friction_Tier"] == "Low Friction").sum())
    mod_cnt = int((df["Friction_Tier"] == "Moderate Friction").sum())
    crit_cnt = int((df["Friction_Tier"] == "Critical Friction").sum())

    distribution = FrictionDistribution(
        low_friction_count=low_cnt,
        low_friction_pct=round((low_cnt / total) * 100, 2) if total > 0 else 0.0,
        moderate_friction_count=mod_cnt,
        moderate_friction_pct=round((mod_cnt / total) * 100, 2) if total > 0 else 0.0,
        critical_friction_count=crit_cnt,
        critical_friction_pct=round((crit_cnt / total) * 100, 2) if total > 0 else 0.0,
        avg_friction=round(float(df["Friction_Score"].mean()), 3),
        formula_weights=weights,
        tiers=[
            {"tier": "Low Friction", "range": "0.00 - 0.30", "count": low_cnt, "pct": round((low_cnt / total) * 100, 1), "color": "#10b981"},
            {"tier": "Moderate Friction", "range": "0.31 - 0.60", "count": mod_cnt, "pct": round((mod_cnt / total) * 100, 1), "color": "#f59e0b"},
            {"tier": "Critical Friction", "range": "0.61 - 1.00", "count": crit_cnt, "pct": round((crit_cnt / total) * 100, 1), "color": "#ef4444"}
        ]
    )

    return df, distribution
