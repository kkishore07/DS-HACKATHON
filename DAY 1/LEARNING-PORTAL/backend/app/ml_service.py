import os
import json
import time
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, List, Optional
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)
from app.config import settings

FEATURE_COLUMNS = [
    "Login_Frequency",
    "Video_Completion",
    "Quiz_Attempts",
    "Assignment_Submissions",
    "Discussion_Activity",
    "Engagement_Score",
    "Early_Engagement_Index",
    "Relative_Video_Completion",
    "Relative_Login_Frequency",
    "Quiz_Activity_Rate",
    "Assignment_Participation_Rate",
    "Discussion_Participation"
]

FEATURE_DESCRIPTIONS = {
    "Early_Engagement_Index": "Early activity composite indicator (predicts trajectory before disengagement)",
    "Engagement_Score": "Overall composite measure of multi-modal activity across course lifecycle",
    "Video_Completion": "Percentage of lecture and instructional video content completed",
    "Login_Frequency": "Total platform login occurrences during active course window",
    "Assignment_Submissions": "Formal assessment and project submissions completed",
    "Relative_Video_Completion": "Learner video progress compared against course-wide cohort average",
    "Quiz_Attempts": "Formative and summative quiz participation frequency",
    "Relative_Login_Frequency": "Login activity rate relative to specific course cohort average",
    "Discussion_Activity": "Community forum posts, responses, and peer discussion interactions",
    "Assignment_Participation_Rate": "Normalized submission rate relative to maximum course tasks",
    "Quiz_Activity_Rate": "Normalized quiz attempt frequency against cohort benchmark",
    "Discussion_Participation": "Relative forum participation index within course community"
}

class MLService:
    def __init__(self):
        self.model: Optional[RandomForestClassifier] = None
        self.metrics: Optional[Dict[str, Any]] = None
        self.feature_metadata: Optional[Dict[str, Any]] = None
        self.is_trained = False
        os.makedirs(settings.ARTIFACTS_DIR, exist_ok=True)
        self.load_model()

    def train_model(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Trains RandomForestClassifier with balanced class weights on 80/20 stratified split.
        Saves artifacts and computes full evaluation suite.
        """
        t0 = time.time()
        
        # Prepare Features & Target
        # Target: 1 for Completed, 0 for Not Completed
        y = (df["Completion_Status"] == "Completed").astype(int)
        
        # Check required features exist
        for col in FEATURE_COLUMNS:
            if col not in df.columns:
                df[col] = 0.0

        X = df[FEATURE_COLUMNS].copy().fillna(0.0)
        
        # Stratified 80/20 split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Configure model
        clf = RandomForestClassifier(
            n_estimators=300,
            max_depth=None,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1
        )
        clf.fit(X_train, y_train)
        training_time = round(time.time() - t0, 3)
        
        # Predict on Test set
        y_pred = clf.predict(X_test)
        # Class 1 is Completed, Class 0 is Not Completed
        # predict_proba returns [P(Not Completed), P(Completed)]
        y_prob_completed = clf.predict_proba(X_test)[:, 1]
        
        # Metrics
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        roc = float(roc_auc_score(y_test, y_prob_completed))
        
        # Class 0 metrics (Not Completed - Critical Business Metric)
        # In sklearn, pos_label=0 computes recall for Non-Completers
        non_comp_recall = float(recall_score(y_test, y_pred, pos_label=0, zero_division=0))
        comp_recall = rec
        macro_f1 = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
        
        # Confusion Matrix
        # matrix format: [[TN, FP], [FN, TP]] where 0=Not Completed, 1=Completed
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()
        total_test = len(y_test)
        cm_percentages = [
            [round(float(tn) / total_test * 100, 2), round(float(fp) / total_test * 100, 2)],
            [round(float(fn) / total_test * 100, 2), round(float(tp) / total_test * 100, 2)]
        ]
        
        # Feature Importances
        importances = clf.feature_importances_
        feature_importance_list = []
        for feat, imp in zip(FEATURE_COLUMNS, importances):
            feature_importance_list.append({
                "feature": feat,
                "importance": round(float(imp), 4),
                "importance_pct": round(float(imp) * 100, 2),
                "description": FEATURE_DESCRIPTIONS.get(feat, "Learner engagement behavioral indicator")
            })
        feature_importance_list.sort(key=lambda x: x["importance"], reverse=True)
        
        metrics_data = {
            "algorithm": "RandomForestClassifier",
            "target": "Completion_Status (Binary)",
            "training_samples": int(len(X_train)),
            "testing_samples": int(len(X_test)),
            "features_used": FEATURE_COLUMNS,
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc, 4),
            "non_completer_recall": round(non_comp_recall, 4),
            "completer_recall": round(comp_recall, 4),
            "macro_f1": round(macro_f1, 4),
            "confusion_matrix": {
                "matrix": cm.tolist(),
                "labels": ["Not Completed", "Completed"],
                "percentages": cm_percentages,
                "true_positive": int(tp),
                "true_negative": int(tn),
                "false_positive": int(fp),
                "false_negative": int(fn)
            },
            "feature_importances": feature_importance_list,
            "last_trained": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            "training_time_seconds": training_time
        }
        
        feature_meta = {
            "feature_columns": FEATURE_COLUMNS,
            "feature_count": len(FEATURE_COLUMNS),
            "class_names": ["Not Completed", "Completed"],
            "feature_descriptions": FEATURE_DESCRIPTIONS
        }
        
        # Save model and artifacts
        self.model = clf
        self.metrics = metrics_data
        self.feature_metadata = feature_meta
        self.is_trained = True
        
        os.makedirs(os.path.dirname(settings.model_file_path), exist_ok=True)
        joblib.dump(clf, settings.model_file_path, compress=3)
        with open(settings.metrics_file_path, "w") as f:
            json.dump(metrics_data, f, indent=2)
        with open(settings.feature_meta_file_path, "w") as f:
            json.dump(feature_meta, f, indent=2)
            
        return metrics_data

    def load_model(self):
        """Loads serialized model and metrics if available."""
        if os.path.exists(settings.model_file_path) and os.path.exists(settings.metrics_file_path):
            try:
                self.model = joblib.load(settings.model_file_path)
                with open(settings.metrics_file_path, "r") as f:
                    self.metrics = json.load(f)
                with open(settings.feature_meta_file_path, "r") as f:
                    self.feature_metadata = json.load(f)
                self.is_trained = True
            except Exception as e:
                print(f"Warning: Could not load saved model artifacts: {e}")
                self.is_trained = False

    def predict_risk(self, df: pd.DataFrame) -> Tuple[np.ndarray, List[str]]:
        """
        Computes Dropout Risk (probability of non-completion) using Random Forest.
        Returns:
            dropout_probabilities: array of floats (0.0 to 1.0)
            risk_levels: list of risk categories ('Low Risk', 'Moderate Risk', 'High Risk', 'Critical Risk')
        """
        if not self.is_trained or self.model is None:
            # Fallback heuristic if model not trained yet
            dropout_probs = np.clip(1.0 - (df["Engagement_Score"].values / 100.0), 0.05, 0.95)
        else:
            X = df[FEATURE_COLUMNS].copy().fillna(0.0)
            # predict_proba returns [P(Not Completed), P(Completed)]
            probs = self.model.predict_proba(X)
            dropout_probs = probs[:, 0] # probability of Class 0 (Not Completed)
            
        risk_levels = []
        for p in dropout_probs:
            if p <= settings.RISK_LOW_MAX:
                risk_levels.append("Low Risk")
            elif p <= settings.RISK_MODERATE_MAX:
                risk_levels.append("Moderate Risk")
            elif p <= settings.RISK_HIGH_MAX:
                risk_levels.append("High Risk")
            else:
                risk_levels.append("Critical Risk")
                
        return np.round(dropout_probs, 4), risk_levels

ml_service = MLService()
