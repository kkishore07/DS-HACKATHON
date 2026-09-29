import re
import os
import joblib
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import MiniBatchKMeans
from app.schemas.schemas import IssueTheme, NLPOverview

TECHNICAL_TOKENS = {
    "api", "ssl", "http", "500", "404", "oauth", "login", "payment", 
    "timeout", "webhook", "auth", "mfa", "sync", "error", "failed", 
    "downgrade", "invoice", "checkout", "latency", "token", "payload"
}

def clean_support_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    # Normalize technical terms if needed
    text = re.sub(r'500\s*(internal\s*server\s*error)?', ' http500 ', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def name_theme_from_keywords(keywords: List[str]) -> str:
    kw_set = set([k.lower() for k in keywords])
    if any(k in kw_set for k in ["payment", "invoice", "refund", "billing", "charge", "subscription", "downgrade"]):
        return "Billing, Invoicing & Payment Processing Failures"
    elif any(k in kw_set for k in ["webhook", "sync", "stopped syncing", "integration", "syncing", "payload"]):
        return "Third-Party Integrations & Data Sync Outages"
    elif any(k in kw_set for k in ["login", "password", "reset", "account", "authentication", "auth", "mfa"]):
        return "Authentication, Access & Password Reset Latency"
    elif any(k in kw_set for k in ["api", "timeout", "latency", "endpoint", "requests"]):
        return "API Gateway Timeouts & Endpoint Degradation"
    elif any(k in kw_set for k in ["slow", "dashboard", "performance", "loading"]):
        return "Application Performance & Dashboard Latency"
    elif any(k in kw_set for k in ["workflow", "blocking", "critical", "business impact"]):
        return "Workflow Blocking Issues & Service Disruptions"
    else:
        capitalized = " & ".join([w.title() for w in keywords[:2]])
        return f"{capitalized} Anomalies"

def extract_nlp_themes(
    df: pd.DataFrame, 
    n_clusters: int = 6, 
    model_save_dir: str = "backend/model_artifacts"
) -> Tuple[pd.DataFrame, NLPOverview]:
    cleaned_texts = df["Description"].apply(clean_support_text)

    # 1. TF-IDF
    tfidf = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        min_df=3,
        max_features=3000
    )
    X_tfidf = tfidf.fit_transform(cleaned_texts)

    # 2. Extract Top Unigrams & Bigrams across all tickets
    sum_words = X_tfidf.sum(axis=0)
    words_freq = [(word, float(sum_words[0, idx])) for word, idx in tfidf.vocabulary_.items()]
    words_freq.sort(key=lambda x: x[1], reverse=True)

    top_unigrams = []
    top_bigrams = []
    for word, score in words_freq:
        if " " in word and len(top_bigrams) < 15:
            top_bigrams.append({"phrase": word, "score": round(score, 1)})
        elif " " not in word and len(top_unigrams) < 15:
            top_unigrams.append({"term": word, "score": round(score, 1)})

    # 3. Clustering
    kmeans = MiniBatchKMeans(n_clusters=n_clusters, random_state=42, batch_size=2048)
    clusters = kmeans.fit_predict(X_tfidf)
    df["nlp_cluster"] = clusters

    # 4. Extract cluster themes & impact metrics
    feature_names = np.array(tfidf.get_feature_names_out())
    total_tickets = len(df)
    theme_objects: List[IssueTheme] = []
    cluster_names_map = {}

    for i in range(n_clusters):
        center = kmeans.cluster_centers_[i]
        top_indices = center.argsort()[-8:][::-1]
        top_keywords = [str(feature_names[idx]) for idx in top_indices]

        cluster_subset = df[df["nlp_cluster"] == i]
        count = len(cluster_subset)
        if count == 0:
            continue

        pct = round((count / total_tickets) * 100, 2)
        avg_sat = round(float(cluster_subset["Satisfaction_Score"].mean()), 2)
        dissat_cnt = int((cluster_subset["Satisfaction_Score"] <= 2).sum())
        dissat_rate = round((dissat_cnt / count) * 100, 2)
        avg_resp = round(float(cluster_subset["Response_Time"].mean()), 2)
        avg_res = round(float(cluster_subset["Resolution_Time"].mean()), 2)
        avg_fric = round(float(cluster_subset["Friction_Score"].mean()), 3) if "Friction_Score" in cluster_subset.columns else 0.3

        prio_counts = cluster_subset["Priority"].value_counts().to_dict()

        theme_name = name_theme_from_keywords(top_keywords)
        cluster_names_map[i] = theme_name

        theme_objects.append(IssueTheme(
            cluster_id=i,
            theme_name=theme_name,
            top_keywords=top_keywords,
            ticket_count=count,
            ticket_percentage=pct,
            avg_satisfaction=avg_sat,
            dissatisfaction_rate=dissat_rate,
            avg_response_time=avg_resp,
            avg_resolution_time=avg_res,
            avg_friction_score=avg_fric,
            priority_concentration={str(k): int(v) for k, v in prio_counts.items()}
        ))

    # Map theme name back to dataframe
    df["nlp_theme"] = df["nlp_cluster"].map(cluster_names_map)

    # Save artifacts
    os.makedirs(model_save_dir, exist_ok=True)
    theme_artifact = {
        "tfidf": tfidf,
        "kmeans": kmeans,
        "cluster_names": cluster_names_map,
        "feature_names": feature_names
    }
    joblib.dump(theme_artifact, os.path.join(model_save_dir, "theme_model.joblib"))

    # Sort themes by friction / dissatisfaction descending
    theme_objects.sort(key=lambda t: t.avg_friction_score, reverse=True)

    overview = NLPOverview(
        themes=theme_objects,
        top_unigrams=top_unigrams,
        top_bigrams=top_bigrams
    )

    return df, overview
