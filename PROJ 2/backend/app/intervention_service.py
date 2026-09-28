import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any

class InterventionEngine:
    def __init__(self):
        pass

    def evaluate_learner_interventions(
        self,
        df: pd.DataFrame
    ) -> Tuple[np.ndarray, List[str], List[str], List[str], List[str]]:
        """
        Rule-based intervention engine.
        Calculates:
        1. Primary behavioral gap
        2. Tailored intervention action
        3. Intervention category
        4. Intervention priority score (0-100) = Dropout Risk * Engagement Gap
        5. Priority level ('Urgent Intervention', 'High Priority', 'Medium Priority', 'Low Priority')
        """
        n = len(df)
        primary_gaps = []
        recommended_actions = []
        categories = []
        priority_scores = np.zeros(n)
        priority_levels = []

        # Completer baseline benchmarks for reference
        completers = df[df["Completion_Status"] == "Completed"]
        comp_video = completers["Video_Completion"].mean() if not completers.empty else 85.0
        comp_login = completers["Login_Frequency"].mean() if not completers.empty else 16.0
        comp_quiz = completers["Quiz_Attempts"].mean() if not completers.empty else 6.0
        comp_assign = completers["Assignment_Submissions"].mean() if not completers.empty else 5.0
        comp_disc = completers["Discussion_Activity"].mean() if not completers.empty else 7.0

        for i, row in df.iterrows():
            dropout_risk = float(row.get("dropout_probability", 0.5))
            eng_score = float(row.get("Engagement_Score", 50.0))
            
            # Engagement gap from 100
            eng_gap = max(0.0, 100.0 - eng_score) / 100.0
            
            # Behavioral deficits (normalized relative deficit compared to completers)
            video_def = max(0.0, (comp_video - row["Video_Completion"]) / (comp_video + 1e-5))
            login_def = max(0.0, (comp_login - row["Login_Frequency"]) / (comp_login + 1e-5))
            assign_def = max(0.0, (comp_assign - row["Assignment_Submissions"]) / (comp_assign + 1e-5))
            quiz_def = max(0.0, (comp_quiz - row["Quiz_Attempts"]) / (comp_quiz + 1e-5))
            disc_def = max(0.0, (comp_disc - row["Discussion_Activity"]) / (comp_disc + 1e-5))

            deficits = [
                ("Video Completion", video_def, "Video Support", "Recommend bite-sized video lessons (3-5 min) and send resume-playback bookmarks."),
                ("Assignment Submissions", assign_def, "Assignment Support", "Provide step-by-step project walkthrough guide and offer proactive deadline guidance."),
                ("Login Frequency", login_def, "Re-engagement", "Send personalized re-engagement notification and micro-study schedule suggestions."),
                ("Quiz Attempts", quiz_def, "Quiz Support", "Recommend a low-stakes diagnostic practice quiz with immediate solution hints."),
                ("Discussion Activity", disc_def, "Community Engagement", "Prompt learner with an open forum discussion challenge and peer study-group invite.")
            ]
            
            # Sort by largest deficit
            deficits.sort(key=lambda x: x[1], reverse=True)
            top_gap, top_val, top_cat, top_action = deficits[0]
            
            # Override for extreme overall dropout probability
            if dropout_risk >= 0.80:
                cat = "Academic Outreach"
                action = f"Initiate 1-on-1 Academic Advisor Outreach Call. Main vulnerability: {top_gap}."
                gap = f"Critical Risk ({round(dropout_risk*100)}%) - Severe {top_gap} Deficit"
            else:
                cat = top_cat
                action = top_action
                gap = f"Low {top_gap}"

            # Calculate Priority Score = Dropout Risk * Engagement Gap * 100
            # Higher risk + wider gap = urgent intervention
            raw_priority = (0.65 * dropout_risk + 0.35 * eng_gap) * 100.0
            # Boost if both risk and gap are severe
            if dropout_risk > 0.70 and eng_gap > 0.50:
                raw_priority = min(100.0, raw_priority * 1.15)
                
            priority_score = round(float(np.clip(raw_priority, 0.0, 100.0)), 1)
            
            # Priority Level
            if priority_score >= 80.0:
                p_level = "Urgent Intervention"
            elif priority_score >= 60.0:
                p_level = "High Priority"
            elif priority_score >= 35.0:
                p_level = "Medium Priority"
            else:
                p_level = "Low Priority"

            primary_gaps.append(gap)
            recommended_actions.append(action)
            categories.append(cat)
            priority_scores[i] = priority_score
            priority_levels.append(p_level)

        return priority_scores, priority_levels, primary_gaps, recommended_actions, categories

intervention_engine = InterventionEngine()
