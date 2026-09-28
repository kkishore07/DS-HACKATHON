import sys
import os
import pytest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from fastapi.testclient import TestClient
from app.main import app
from app.services.pipeline_service import state

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "SupportPulse AI"

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_analytics_overview():
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["total_tickets"] > 0
    assert "avg_response_time" in data
    assert "avg_satisfaction" in data

def test_analytics_categories():
    response = client.get("/api/analytics/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_analytics_teams():
    response = client.get("/api/analytics/teams")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any("team" in item for item in data)

def test_satisfaction_drop_point():
    response = client.get("/api/analytics/satisfaction")
    assert response.status_code == 200
    data = response.json()
    assert "drop_point_hours" in data
    assert "buckets" in data

def test_friction_distribution():
    response = client.get("/api/analytics/friction")
    assert response.status_code == 200
    data = response.json()
    assert "low_friction_count" in data
    assert "formula_weights" in data

def test_nlp_themes():
    response = client.get("/api/nlp/themes")
    assert response.status_code == 200
    data = response.json()
    assert len(data["themes"]) > 0

def test_model_metrics():
    response = client.get("/api/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "accuracy" in data
    assert "confusion_matrix" in data

def test_prediction():
    payload = {
        "description": "Critical API gateway timeout blocking checkout workflow",
        "category": "API",
        "priority": "Urgent",
        "team": "Platform Engineering",
        "response_time": 8.5
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_risk"] in ["High Risk", "Medium Risk", "Low Risk"]
    assert "recommended_action" in data
    assert len(data["primary_indicators"]) > 0

def test_recommendations():
    response = client.get("/api/recommendations")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4

def test_tickets_pagination():
    response = client.get("/api/tickets?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["tickets"]) == 10
    assert data["total"] > 0
