import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, List
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
from app.schemas.schemas import ModelMetrics, ConfusionMatrixData, PredictResponse

MODEL_DIR = "backend/model_artifacts"
MODEL_PATH = os.path.join(MODEL_DIR, "naive_bayes_pipeline.joblib")
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.json")
FEATURE_METADATA_PATH = os.path.join(MODEL_DIR, "feature_metadata.json")

RISK_LABELS = ["High Risk", "Medium Risk", "Low Risk"]

LIMITATIONS_LIST = [
    "Conditional Independence Assumption: Naive Bayes assumes all features (words, categories, delays) are conditionally independent given the risk class, which may overlook word context and feature interactions.",
    "Extreme Class Imbalance: High Risk tickets represent ~0.3% to 3% of real-world support tickets, creating an inherent tradeoff between overall accuracy and minority class recall.",
    "Non-Negative Feature Constraint: Multinomial Naive Bayes requires strictly non-negative inputs, requiring min-max scaling or one-hot discretization of numerical response times.",
    "Vocabulary Generalization: TF-IDF features depend heavily on training terminology; novel or slang complaint phrases not in training vocabulary receive zero weight.",
    "Correlation vs Causation: Identified high-risk indicators (e.g., 'payment timeout') highlight operational correlation with dissatisfaction, not deterministic causality.",
    "Project-Defined Friction Score: The Support Friction Score is an operational heuristic engineered for prioritization, not a universal ISO/ITIL standard."
]

def map_satisfaction_to_risk(score: float) -> str:
    if score <= 2:
        return "High Risk"
    elif score == 3:
        return "Medium Risk"
    else:
        return "Low Risk"

def train_naive_bayes_model(df: pd.DataFrame) -> Tuple[Pipeline, ModelMetrics]:
    os.makedirs(MODEL_DIR, exist_ok=True)

    # 1. Target Definition
    df_model = df.copy()
    df_model["Satisfaction_Risk"] = df_model["Satisfaction_Score"].apply(map_satisfaction_to_risk)

    X = df_model[["Description", "Category", "Priority", "Team", "Response_Time"]]
    y = df_model["Satisfaction_Risk"]

    # 2. Stratified 80/20 Train/Test Split
    class_counts = y.value_counts()
    stratify_target = y if (class_counts.min() >= 2) else None
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=stratify_target
    )

    # 3. Pipeline: TF-IDF + OneHotEncoder + MinMaxScaler
    preprocessor = ColumnTransformer(
        transformers=[
            ("text", TfidfVectorizer(
                stop_words="english",
                ngram_range=(1, 2),
                max_features=3000,
                min_df=2
            ), "Description"),
            ("cat", OneHotEncoder(handle_unknown="ignore"), ["Category", "Priority", "Team"]),
            ("num", MinMaxScaler(), ["Response_Time"])
        ]
    )

    # Use uniform prior to ensure minority High Risk class is not suppressed by 85% Low Risk prior
    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", MultinomialNB(alpha=0.2, fit_prior=False))
    ])

    pipeline.fit(X_train, y_train)

    # 4. Evaluation
    y_pred = pipeline.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))
    macro_f1 = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
    weighted_f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

    # High-Risk specific metrics
    high_risk_rec = float(recall_score(y_test, y_pred, labels=["High Risk"], average=None, zero_division=0)[0]) if "High Risk" in y_test.values else 0.0
    high_risk_prec = float(precision_score(y_test, y_pred, labels=["High Risk"], average=None, zero_division=0)[0]) if "High Risk" in y_test.values else 0.0
    high_risk_f1 = float(f1_score(y_test, y_pred, labels=["High Risk"], average=None, zero_division=0)[0]) if "High Risk" in y_test.values else 0.0

    # Confusion Matrix
    cm_array = confusion_matrix(y_test, y_pred, labels=RISK_LABELS)
    cm_list = [[int(val) for val in row] for row in cm_array]

    # Detailed report dict
    report_dict = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

    # 5. Informative Features Extraction
    clf: MultinomialNB = pipeline.named_steps["classifier"]
    prep: ColumnTransformer = pipeline.named_steps["preprocessor"]

    # Feature names
    text_feat_names = list(prep.named_transformers_["text"].get_feature_names_out())
    cat_feat_names = list(prep.named_transformers_["cat"].get_feature_names_out())
    num_feat_names = ["Response_Time_Scaled"]
    all_feature_names = text_feat_names + cat_feat_names + num_feat_names

    informative_features: Dict[str, List[Dict[str, Any]]] = {}
    classes = list(clf.classes_)

    for idx, cls_name in enumerate(classes):
        log_prob = clf.feature_log_prob_[idx]
        top_indices = log_prob.argsort()[-15:][::-1]
        top_feats = []
        for fi in top_indices:
            feat_name = all_feature_names[fi] if fi < len(all_feature_names) else f"feature_{fi}"
            top_feats.append({
                "feature": feat_name.replace("text__", "").replace("cat__", "").replace("num__", ""),
                "log_probability": round(float(log_prob[fi]), 3)
            })
        informative_features[cls_name] = top_feats

    # 6. Save Pipeline & Metrics
    joblib.dump(pipeline, MODEL_PATH)

    metrics_obj = ModelMetrics(
        model_name="Multinomial Naive Bayes (TF-IDF + Categorical OneHot + Scaled Delay)",
        train_size=len(X_train),
        test_size=len(X_test),
        accuracy=round(acc, 4),
        macro_f1=round(macro_f1, 4),
        weighted_f1=round(weighted_f1, 4),
        high_risk_recall=round(high_risk_rec, 4),
        high_risk_precision=round(high_risk_prec, 4),
        high_risk_f1=round(high_risk_f1, 4),
        class_distribution={str(k): int(v) for k, v in class_counts.items()},
        classification_report=report_dict,
        confusion_matrix=ConfusionMatrixData(
            labels=RISK_LABELS,
            matrix=cm_list
        ),
        informative_features=informative_features,
        limitations=LIMITATIONS_LIST
    )

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics_obj.model_dump(), f, indent=2)

    with open(FEATURE_METADATA_PATH, "w") as f:
        json.dump({
            "classes": classes,
            "feature_count": len(all_feature_names)
        }, f, indent=2)

    return pipeline, metrics_obj

def load_or_train_model(df: pd.DataFrame) -> Tuple[Pipeline, ModelMetrics]:
    if os.path.exists(MODEL_PATH) and os.path.exists(METRICS_PATH):
        try:
            pipeline = joblib.load(MODEL_PATH)
            with open(METRICS_PATH, "r") as f:
                metrics_data = json.load(f)
            return pipeline, ModelMetrics(**metrics_data)
        except Exception:
            pass
    return train_naive_bayes_model(df)

def predict_ticket_risk(
    pipeline: Pipeline,
    description: str,
    category: str,
    priority: str,
    team: str,
    response_time: float
) -> PredictResponse:
    input_df = pd.DataFrame([{
        "Description": description,
        "Category": category,
        "Priority": priority,
        "Team": team,
        "Response_Time": float(response_time)
    }])

    clf: MultinomialNB = pipeline.named_steps["classifier"]
    classes = list(clf.classes_)
    
    # Predict probabilities
    probs = pipeline.predict_proba(input_df)[0]
    prob_dict = {classes[i]: round(float(probs[i]), 4) for i in range(len(classes))}

    # Predict class (or risk-sensitive thresholding: if High Risk prob > 0.30 in uniform prior)
    high_idx = classes.index("High Risk") if "High Risk" in classes else -1
    if high_idx != -1 and probs[high_idx] >= 0.35:
        predicted_risk = "High Risk"
        confidence = prob_dict["High Risk"]
    else:
        best_idx = int(np.argmax(probs))
        predicted_risk = classes[best_idx]
        confidence = round(float(probs[best_idx]), 4)

    # Detect primary indicators from text & metadata
    indicators = []
    text_lower = description.lower()
    high_risk_keywords = [
        "failed", "stopped", "timeout", "payment", "error", "unable", "not working",
        "blocking", "critical", "outage", "lost", "refund", "crash", "syncing"
    ]
    matched_words = [kw for kw in high_risk_keywords if kw in text_lower]
    if matched_words:
        indicators.append(f"High-friction vocabulary detected: {', '.join(matched_words)}")

    if response_time > 4.5:
        indicators.append(f"First-response delay ({response_time:.1f}h) exceeds the 4.5h satisfaction drop point")
    if priority in ["Urgent", "High"]:
        indicators.append(f"Elevated priority severity ({priority})")
    if category in ["Payment", "Integration", "Bug"]:
        indicators.append(f"High-friction category ({category})")
    if not indicators:
        indicators.append("Routine operational inquiry with standard response profile")

    # Generate transparent rule-based operational recommendation
    if predicted_risk == "High Risk":
        if response_time > 4.5:
            action = "IMMEDIATE ESCALATION: Fast-track to Tier-2 senior specialist and dispatch executive CS update. First-response time is past customer drop threshold."
        elif category in ["Payment", "Subscription"]:
            action = "PRIORITY BILLING ROUTING: Direct to Senior Billing lead for payment reconciliation and proactive account credit check."
        else:
            action = "SLA FAST-TRACK: Escalate ticket to on-call duty engineer and initiate proactive customer reassurance call."
    elif predicted_risk == "Medium Risk":
        action = "MONITOR & RESOLVE: Ensure resolution adheres to median complexity SLA. Send status update if ticket enters next business day."
    else:
        action = "STANDARD QUEUE: Proceed with normal Tier-1 workflow and standard documentation guidelines."

    return PredictResponse(
        predicted_risk=predicted_risk,
        confidence=confidence,
        probabilities=prob_dict,
        primary_indicators=indicators,
        recommended_action=action,
        ticket_summary={
            "category": category,
            "priority": priority,
            "team": team,
            "response_time": response_time,
            "description_snippet": description[:120] + "..." if len(description) > 120 else description
        }
    )
