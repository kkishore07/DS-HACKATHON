import pandas as pd
from app.schemas.schemas import OverviewKPIs

def compute_overview_kpis(df: pd.DataFrame) -> OverviewKPIs:
    total_tickets = len(df)
    if total_tickets == 0:
        return OverviewKPIs(
            total_tickets=0,
            avg_response_time=0.0,
            median_response_time=0.0,
            avg_resolution_time=0.0,
            median_resolution_time=0.0,
            avg_satisfaction=0.0,
            satisfaction_distribution={},
            high_risk_tickets=0,
            high_risk_percentage=0.0,
            critical_friction_tickets=0,
            critical_friction_percentage=0.0,
            priority_distribution={},
            category_distribution={},
            team_distribution={},
            sla_breached_count=0,
            sla_breached_percentage=0.0
        )

    avg_resp = round(float(df["Response_Time"].mean()), 2)
    med_resp = round(float(df["Response_Time"].median()), 2)
    avg_res = round(float(df["Resolution_Time"].mean()), 2)
    med_res = round(float(df["Resolution_Time"].median()), 2)
    avg_sat = round(float(df["Satisfaction_Score"].mean()), 2)

    # Satisfaction distribution
    sat_counts = df["Satisfaction_Score"].value_counts().sort_index().to_dict()
    sat_dist = {int(k): int(v) for k, v in sat_counts.items()}

    # High risk tickets: defined as Satisfaction_Score <= 2
    high_risk_cnt = int((df["Satisfaction_Score"] <= 2).sum())
    high_risk_pct = round((high_risk_cnt / total_tickets) * 100, 2)

    # Critical friction
    crit_fric_cnt = int((df["Friction_Tier"] == "Critical Friction").sum()) if "Friction_Tier" in df.columns else 0
    crit_fric_pct = round((crit_fric_cnt / total_tickets) * 100, 2)

    # Priority distribution
    prio_dist = {str(k): int(v) for k, v in df["Priority"].value_counts().items()}

    # Category distribution
    cat_dist = {str(k): int(v) for k, v in df["Category"].value_counts().items()}

    # Team distribution
    team_dist = {str(k): int(v) for k, v in df["Team"].value_counts().items()}

    # SLA breached
    sla_cnt = 0
    sla_pct = 0.0
    if "SLA_Breached" in df.columns:
        sla_cnt = int(df["SLA_Breached"].sum())
        sla_pct = round((sla_cnt / total_tickets) * 100, 2)

    return OverviewKPIs(
        total_tickets=total_tickets,
        avg_response_time=avg_resp,
        median_response_time=med_resp,
        avg_resolution_time=avg_res,
        median_resolution_time=med_res,
        avg_satisfaction=avg_sat,
        satisfaction_distribution=sat_dist,
        high_risk_tickets=high_risk_cnt,
        high_risk_percentage=high_risk_pct,
        critical_friction_tickets=crit_fric_cnt,
        critical_friction_percentage=crit_fric_pct,
        priority_distribution=prio_dist,
        category_distribution=cat_dist,
        team_distribution=team_dist,
        sla_breached_count=sla_cnt,
        sla_breached_percentage=sla_pct
    )
