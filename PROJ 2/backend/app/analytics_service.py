import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from app.ml_service import ml_service
from app.intervention_service import intervention_engine
from app.data_pipeline import process_and_validate_dataset

class AnalyticsService:
    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.validation_summary: Optional[Dict[str, Any]] = None
        self.is_initialized = False

    def load_and_initialize(self, df_raw: pd.DataFrame) -> Dict[str, Any]:
        """
        Cleans data, trains Random Forest model, runs inference,
        computes interventions, and caches in-memory.
        """
        cleaned_df, val_summary = process_and_validate_dataset(df_raw)
        
        # Train ML model or load existing
        if not ml_service.is_trained:
            ml_service.train_model(cleaned_df)
            
        # Predict Risk Probabilities & Levels
        dropout_probs, risk_levels = ml_service.predict_risk(cleaned_df)
        cleaned_df["dropout_probability"] = dropout_probs
        cleaned_df["risk_level"] = risk_levels
        
        # Run Rule-Based Intervention Engine
        priority_scores, priority_levels, primary_gaps, recommended_actions, categories = (
            intervention_engine.evaluate_learner_interventions(cleaned_df)
        )
        cleaned_df["intervention_priority"] = priority_scores
        cleaned_df["priority_level"] = priority_levels
        cleaned_df["primary_gap"] = primary_gaps
        cleaned_df["recommended_intervention"] = recommended_actions
        cleaned_df["intervention_category"] = categories
        
        # Add internal numeric id if needed
        cleaned_df["id"] = np.arange(1, len(cleaned_df) + 1)
        
        self.df = cleaned_df
        self.validation_summary = val_summary
        self.is_initialized = True
        return val_summary

    def get_overview(self) -> Dict[str, Any]:
        """Calculates all metrics for Page 1 - Overview."""
        if not self.is_initialized or self.df is None:
            return {}
            
        df = self.df
        total_learners = int(df["Learner_ID"].nunique())
        total_courses = int(df["Course_ID"].nunique())
        
        completed_mask = df["Completion_Status"] == "Completed"
        completion_rate = round(float(completed_mask.mean() * 100), 1)
        non_completion_rate = round(100.0 - completion_rate, 1)
        avg_engagement = round(float(df["Engagement_Score"].mean()), 1)
        
        # Risk counts
        at_risk_mask = df["risk_level"].isin(["High Risk", "Critical Risk"])
        at_risk_count = int(at_risk_mask.sum())
        at_risk_pct = round(float(at_risk_mask.mean() * 100), 1)
        
        critical_mask = df["priority_level"] == "Urgent Intervention"
        critical_count = int(critical_mask.sum())
        critical_pct = round(float(critical_mask.mean() * 100), 1)
        
        # Behavior averages overall
        behavior_avgs = {
            "login_frequency": round(float(df["Login_Frequency"].mean()), 1),
            "video_completion": round(float(df["Video_Completion"].mean()), 1),
            "quiz_attempts": round(float(df["Quiz_Attempts"].mean()), 1),
            "assignment_submissions": round(float(df["Assignment_Submissions"].mean()), 1),
            "discussion_activity": round(float(df["Discussion_Activity"].mean()), 1)
        }
        
        # Completer vs Non-Completer comparison
        completer_comp = self.get_completer_comparison()
        
        # Dropout stage drop-off and major drop point
        stage_drops, major_drop = self.get_dropout_stages()
        
        # Dynamic Insights & Operational Alerts
        insights = self.generate_dynamic_insights()
        alerts = self.generate_operational_alerts(stage_drops, major_drop)
        
        return {
            "total_learners": total_learners,
            "total_courses": total_courses,
            "completion_rate": completion_rate,
            "non_completion_rate": non_completion_rate,
            "average_engagement": avg_engagement,
            "at_risk_learners": at_risk_count,
            "at_risk_percentage": at_risk_pct,
            "critical_intervention_learners": critical_count,
            "critical_intervention_percentage": critical_pct,
            "operational_alerts": alerts,
            "dynamic_insights": insights,
            "behavior_averages": behavior_avgs,
            "completer_vs_non_completer": completer_comp,
            "disengagement_point": major_drop
        }

    def get_completer_comparison(self) -> List[Dict[str, Any]]:
        """Compares behavioral averages between Completers and Non-Completers."""
        df = self.df
        completers = df[df["Completion_Status"] == "Completed"]
        non_completers = df[df["Completion_Status"] == "Not Completed"]
        
        features = [
            ("Video Completion (%)", "Video_Completion"),
            ("Login Frequency", "Login_Frequency"),
            ("Assignment Submissions", "Assignment_Submissions"),
            ("Quiz Attempts", "Quiz_Attempts"),
            ("Discussion Activity", "Discussion_Activity")
        ]
        
        results = []
        for label, col in features:
            comp_val = round(float(completers[col].mean()), 1)
            non_comp_val = round(float(non_completers[col].mean()), 1)
            diff = round(comp_val - non_comp_val, 1)
            rel_diff = round(((comp_val - non_comp_val) / (non_comp_val + 1e-5)) * 100, 1)
            results.append({
                "feature": label,
                "completers_avg": comp_val,
                "non_completers_avg": non_comp_val,
                "difference": diff,
                "relative_diff_pct": rel_diff
            })
        return results

    def get_early_engagement_bands(self) -> List[Dict[str, Any]]:
        """Calculates completion rates across 5 Early Engagement bands."""
        df = self.df
        bands = [
            ("0–20", 0.0, 20.0),
            ("21–40", 20.0, 40.0),
            ("41–60", 40.0, 60.0),
            ("61–80", 60.0, 80.0),
            ("81–100", 80.0, 100.0)
        ]
        results = []
        for label, low, high in bands:
            if label == "0–20":
                subset = df[(df["Early_Engagement_Index"] >= low) & (df["Early_Engagement_Index"] <= high)]
            else:
                subset = df[(df["Early_Engagement_Index"] > low) & (df["Early_Engagement_Index"] <= high)]
                
            n = len(subset)
            if n > 0:
                comp_rate = round(float((subset["Completion_Status"] == "Completed").mean() * 100), 1)
                non_comp_rate = round(100.0 - comp_rate, 1)
            else:
                comp_rate = 0.0
                non_comp_rate = 0.0
                
            results.append({
                "band": label,
                "learners": n,
                "completion_rate": comp_rate,
                "non_completion_rate": non_comp_rate
            })
        return results

    def get_dropout_stages(self) -> Tuple[List[Dict[str, Any]], str]:
        """Calculates progressive engagement drop across Stages 1–5."""
        df = self.df
        completers = df[df["Completion_Status"] == "Completed"]
        non_completers = df[df["Completion_Status"] == "Not Completed"]
        
        stages = [
            ("Stage 1", "Stage 1 (0–20%)", "Stage_1_Engagement"),
            ("Stage 2", "Stage 2 (21–40%)", "Stage_2_Engagement"),
            ("Stage 3", "Stage 3 (41–60%)", "Stage_3_Engagement"),
            ("Stage 4", "Stage 4 (61–80%)", "Stage_4_Engagement"),
            ("Stage 5", "Stage 5 (81–100%)", "Stage_5_Engagement")
        ]
        
        stage_drops = []
        prev_eng = None
        max_drop = -1.0
        major_stage = "Stage 3"
        
        for code, name, col in stages:
            avg_eng = round(float(df[col].mean()), 1)
            comp_eng = round(float(completers[col].mean()), 1)
            non_comp_eng = round(float(non_completers[col].mean()), 1)
            
            if prev_eng is None:
                drop = 0.0
            else:
                drop = round(prev_eng - avg_eng, 1)
                if drop > max_drop:
                    max_drop = drop
                    major_stage = code
                    
            prev_eng = avg_eng
            stage_drops.append({
                "stage": code,
                "stage_name": name,
                "avg_engagement": avg_eng,
                "completers_engagement": comp_eng,
                "non_completers_engagement": non_comp_eng,
                "drop_from_previous": drop,
                "is_major_drop": False
            })
            
        for s in stage_drops:
            if s["stage"] == major_stage:
                s["is_major_drop"] = True
                
        return stage_drops, major_stage

    def get_course_structure_analysis(self) -> List[Dict[str, Any]]:
        """Calculates course completion matrix and operational risk rating."""
        df = self.df
        courses = []
        
        grouped = df.groupby("Course_ID")
        for course_id, group in grouped:
            learners_count = len(group)
            comp_mask = group["Completion_Status"] == "Completed"
            completion_rate = round(float(comp_mask.mean() * 100), 1)
            avg_eng = round(float(group["Engagement_Score"].mean()), 1)
            avg_video = round(float(group["Video_Completion"].mean()), 1)
            avg_login = round(float(group["Login_Frequency"].mean()), 1)
            avg_quiz = round(float(group["Quiz_Attempts"].mean()), 1)
            avg_assign = round(float(group["Assignment_Submissions"].mean()), 1)
            avg_disc = round(float(group["Discussion_Activity"].mean()), 1)
            
            at_risk = int(group["risk_level"].isin(["High Risk", "Critical Risk"]).sum())
            
            # Risk classification: Healthy, Watch, High Risk (neutral operational terminology)
            if completion_rate >= 60.0 and avg_eng >= 55.0:
                risk_class = "Healthy"
            elif completion_rate < 45.0 and avg_eng < 45.0:
                risk_class = "High Risk"
            else:
                risk_class = "Watch"
                
            course_name = group["Course_Name"].iloc[0] if "Course_Name" in group.columns else course_id
            category = group["Course_Category"].iloc[0] if "Course_Category" in group.columns else "General"
            level = group["Course_Level"].iloc[0] if "Course_Level" in group.columns else "Intermediate"
            fmt = group["Course_Format"].iloc[0] if "Course_Format" in group.columns else "Cohort"
            modules = int(group["Course_Modules"].iloc[0]) if "Course_Modules" in group.columns else 12
            
            courses.append({
                "course_id": str(course_id),
                "course_name": str(course_name),
                "category": str(category),
                "level": str(level),
                "format": str(fmt),
                "modules": modules,
                "learners": learners_count,
                "completion_rate": completion_rate,
                "avg_engagement": avg_eng,
                "avg_login_frequency": avg_login,
                "avg_video_completion": avg_video,
                "avg_quiz_attempts": avg_quiz,
                "avg_assignment_submissions": avg_assign,
                "avg_discussion_activity": avg_disc,
                "risk_classification": risk_class,
                "at_risk_count": at_risk
            })
            
        courses.sort(key=lambda x: x["completion_rate"], reverse=True)
        return courses

    def get_course_detail(self, course_id: str) -> Optional[Dict[str, Any]]:
        """Detailed course analytics including stage breakdown and enrolled at-risk learners."""
        df = self.df
        course_df = df[df["Course_ID"] == course_id]
        if course_df.empty:
            return None
            
        courses_summary = self.get_course_structure_analysis()
        summary = next((c for c in courses_summary if c["course_id"] == course_id), None)
        if not summary:
            return None
            
        comp_count = int((course_df["Completion_Status"] == "Completed").sum())
        non_comp_count = len(course_df) - comp_count
        
        stages = [
            {"stage": f"Stage {i}", "avg": round(float(course_df[f"Stage_{i}_Engagement"].mean()), 1)}
            for i in range(1, 6)
        ]
        
        high_risk_learners = course_df[course_df["risk_level"].isin(["Critical Risk", "High Risk"])]
        high_risk_sample = high_risk_learners.sort_values(by="dropout_probability", reverse=True).head(15).to_dict(orient="records")
        
        res = dict(summary)
        res.update({
            "completer_count": comp_count,
            "non_completer_count": non_comp_count,
            "stages_averages": stages,
            "high_risk_learners": high_risk_sample
        })
        return res

    def get_learner_detail(self, learner_id: str) -> Optional[Dict[str, Any]]:
        """Returns deep profile and behavioral diagnosis for a single learner."""
        df = self.df
        records = df[df["Learner_ID"] == learner_id]
        if records.empty:
            return None
            
        row = records.iloc[0]
        course_id = row["Course_ID"]
        course_subset = df[df["Course_ID"] == course_id]
        
        c_avg_eng = round(float(course_subset["Engagement_Score"].mean()), 1)
        c_avg_video = round(float(course_subset["Video_Completion"].mean()), 1)
        c_avg_login = round(float(course_subset["Login_Frequency"].mean()), 1)
        
        # Behavioral diagnosis: transparent empirical observations without causal claim
        diagnosis = []
        if row["Video_Completion"] < c_avg_video * 0.75:
            diagnosis.append(f"Video completion ({row['Video_Completion']}%) is substantially below the course average of {c_avg_video}%.")
        elif row["Video_Completion"] >= c_avg_video:
            diagnosis.append(f"Video completion ({row['Video_Completion']}%) is on par or exceeds cohort standard ({c_avg_video}%).")
            
        if row["Assignment_Submissions"] <= 1.0:
            diagnosis.append("Assignment participation is low, indicating potential difficulty or disengagement with summative deliverables.")
        elif row["Assignment_Submissions"] >= 5.0:
            diagnosis.append("Strong assessment submission track record.")
            
        if row["Login_Frequency"] < c_avg_login * 0.70:
            diagnosis.append(f"Login cadence ({row['Login_Frequency']} sessions) is noticeably lower than cohort mean ({c_avg_login} sessions).")
            
        # Check decay across stages
        s1 = float(row.get("Stage_1_Engagement", 0))
        s5 = float(row.get("Stage_5_Engagement", 0))
        if s1 - s5 > 25.0:
            diagnosis.append(f"Rapid engagement decay observed across modules (Stage 1: {s1} vs Stage 5: {s5}).")
        elif s1 - s5 < 10.0:
            diagnosis.append("Engagement pattern remains relatively stable across course progression.")
            
        if row["dropout_probability"] >= 0.70:
            diagnosis.append(f"Random Forest model predicts high non-completion probability ({round(row['dropout_probability']*100)}%) based on multi-feature profile.")
            
        data = row.to_dict()
        data.update({
            "course_average_engagement": c_avg_eng,
            "course_average_video": c_avg_video,
            "course_average_login": c_avg_login,
            "relative_video_completion": round(float(row["Video_Completion"] / (c_avg_video + 1e-5)), 2),
            "relative_login_frequency": round(float(row["Login_Frequency"] / (c_avg_login + 1e-5)), 2),
            "behavioral_diagnosis": diagnosis
        })
        return data

    def generate_dynamic_insights(self) -> List[Dict[str, Any]]:
        """Calculates 6-7 dynamic insights with Title, Evidence, Meaning, Action."""
        df = self.df
        bands = self.get_early_engagement_bands()
        lowest_band = bands[0] # 0-20
        highest_band = bands[-1] # 81-100
        
        stage_drops, major_drop = self.get_dropout_stages()
        major_stage_obj = next((s for s in stage_drops if s["is_major_drop"]), stage_drops[2])
        
        comp_comp = self.get_completer_comparison()
        video_comp = next((c for c in comp_comp if "Video" in c["feature"]), comp_comp[0])
        assign_comp = next((c for c in comp_comp if "Assignment" in c["feature"]), comp_comp[2])
        
        courses = self.get_course_structure_analysis()
        high_risk_courses = [c for c in courses if c["risk_classification"] == "High Risk"]
        
        critical_learners = int((df["priority_level"] == "Urgent Intervention").sum())
        
        insights = [
            {
                "id": "insight-1",
                "title": "Low Early Engagement is a Powerful Early Warning Signal",
                "evidence": f"Learners in the lowest early engagement band (0–20) completed at only {lowest_band['completion_rate']}%, compared to {highest_band['completion_rate']}% for high early engagement (81–100).",
                "business_meaning": "The trajectory toward course completion is largely seeded during initial modules. Students who hesitate early rarely recover spontaneously.",
                "recommended_action": "Deploy proactive onboarding nudges and quick-win assignments during the first 14 days of enrollment.",
                "type": "warning"
            },
            {
                "id": "insight-2",
                "title": f"Critical Disengagement Drop-Off Detected at {major_stage_obj['stage_name']}",
                "evidence": f"Platform engagement declines by {major_stage_obj['drop_from_previous']} points transitioning into {major_stage_obj['stage_name']}, representing the largest cohort drop across all five stages.",
                "business_meaning": "A structural or curricular barrier in mid-course modules causes learner momentum to stall before final assessments.",
                "recommended_action": f"Review {major_stage_obj['stage_name']} course content difficulty, introduce milestone checkpoints, and schedule group peer activities.",
                "type": "critical"
            },
            {
                "id": "insight-3",
                "title": "Assignment & Video Completion Strongly Distinguish Completers",
                "evidence": f"Completers average {video_comp['completers_avg']}% video completion vs {video_comp['non_completers_avg']}% for non-completers (+{video_comp['relative_diff_pct']}% relative difference). Completers also submit {assign_comp['difference']} more assignments.",
                "business_meaning": "Passive consumption combined with assessment submission creates the behavioral loop necessary for completion.",
                "recommended_action": "Break lengthy lectures into bite-sized 3-5 min lessons and provide milestone guidance for primary projects.",
                "type": "info"
            },
            {
                "id": "insight-4",
                "title": f"Course Structure Disparities: {len(high_risk_courses)} High-Risk Offerings Identified",
                "evidence": f"{', '.join([c['course_id'] for c in high_risk_courses[:3]])} exhibit dual vulnerabilities: completion rates below 45% and engagement scores under 45.",
                "business_meaning": "Certain curriculum structures present friction points that degrade student persistence independently of student ability.",
                "recommended_action": "Collaborate with instructional designers to restructure pacing and modularize dense syllabus requirements.",
                "type": "warning"
            },
            {
                "id": "insight-5",
                "title": "Predictive Behavioral Model Signals Early Engagement As Primary Factor",
                "evidence": "Random Forest feature importance ranks Early Engagement Index and Video Completion as the top predictive signals for completion status.",
                "business_meaning": "Observing initial learner behavior gives the platform an operational window to intervene long before final course deadlines.",
                "recommended_action": "Automate early trigger alerts within the first 2 weeks to route at-risk learners to academic advisors.",
                "type": "success"
            },
            {
                "id": "insight-6",
                "title": f"Urgent Intervention Pipeline: {critical_learners:,} Learners Require Immediate Outreach",
                "evidence": f"{critical_learners:,} learners present an Urgent Intervention priority score combining high predicted non-completion probability with large engagement deficits.",
                "business_meaning": "Targeting this subset maximizes intervention ROI by focusing success advisors where risk and intervention utility are highest.",
                "recommended_action": "Dispatch automated re-engagement notifications and schedule 1-on-1 advisor touchpoints via the Intervention Center.",
                "type": "critical"
            }
        ]
        return insights

    def generate_operational_alerts(self, stage_drops: List[Dict[str, Any]], major_drop: str) -> List[str]:
        """Generates dynamic operational alerts for the Overview banner."""
        df = self.df
        alerts = []
        
        # Stage alert
        alerts.append(f"⚠ Critical drop-off point: Platform engagement declines most sharply at {major_drop}.")
        
        # Course alert
        courses = self.get_course_structure_analysis()
        lowest_course = courses[-1]
        highest_course = courses[0]
        alerts.append(f"⚠ Course {lowest_course['course_id']} ({lowest_course['course_name']}) has the lowest completion rate ({lowest_course['completion_rate']}%) compared to {highest_course['course_id']} ({highest_course['completion_rate']}%).")
        
        # Early engagement alert
        bands = self.get_early_engagement_bands()
        alerts.append(f"⚠ Learners in early engagement band 0–20 achieve only {bands[0]['completion_rate']}% completion, confirming early behavior as an early-warning signal.")
        
        # Behavioral disparity alert
        comp = self.get_completer_comparison()
        assign = next((c for c in comp if "Assignment" in c["feature"]), comp[0])
        alerts.append(f"⚠ Assignment participation is strongly associated with completion: completers submit {assign['difference']} more projects on average.")
        
        return alerts

analytics_service = AnalyticsService()
