# SupportPulse AI

### Intelligent IT Support Analytics, Customer Frustration Detection & Resolution Optimization Platform

> **"Identify support friction before escalation. Uncover root causes with NLP. Predict dissatisfaction risks in real-time."**

---

## 1. Project Overview

**SupportPulse AI** is an enterprise-grade IT support analytics and predictive intelligence platform designed to eliminate support bottlenecks, identify operational friction points, and forecast customer dissatisfaction risks before tickets escalate.

By integrating multi-channel support metadata, structured resolution metrics, and unstructured ticket descriptions, SupportPulse AI provides service desk leaders, engineering managers, and customer experience directors with end-to-end operational visibility and actionable optimization strategies.

```
INGEST & VALIDATE
       ↓
FRICTION ANALYSIS & BOTTLENECK DETECTION
       ↓
UNSUPERVISED NLP THEME DISCOVERY
       ↓
SUPERVISED NAIVE BAYES RISK PREDICTION
       ↓
AUTOMATED RESOLUTION OPTIMIZATION
```

---

## 2. Key Architecture & Features

### 🔍 1. Support Friction Scoring (SFS)
A composite operational metric quantifying support process friction for every ticket:
- **Response Time & Resolution Deviation**: Quantifies delays relative to team and category benchmarks.
- **Priority Scaling & SLA Breach Penalties**: Elevates urgency for critical issues and contractual breaches.
- **Reopen Factor**: Heavily weights recurring issues and unresolved customer inquiries.

### 🧠 2. Unsupervised NLP Theme Clustering
- **TF-IDF Feature Extraction**: Extracts semantic n-grams and domain vocabulary from raw customer ticket descriptions.
- **K-Means Clustering**: Uncovers underlying systemic failure modes (e.g., authentication timeout, payment gateway errors, database locking).
- **Cluster Dissatisfaction Profiling**: Calculates dissatisfaction rate and average friction score per discovered operational theme.

### 🎯 3. Supervised Risk Classification (Multinomial Naive Bayes)
- **Pipeline Architecture**:
  - `TF-IDF Vectorizer` for unstructured ticket description text
  - `OneHotEncoder` for ticket metadata (`Category`, `Priority`, `Team`)
  - `MinMaxScaler` for numerical `Response_Time`
  - `MultinomialNB` classifier predicting satisfaction risk: **High Risk**, **Medium Risk**, **Low Risk**
- **Evaluation & Metrics**: Stratified 80/20 train-test evaluation tracking accuracy, macro F1, and minority high-risk recall.

### 📊 360° Operational Analytics Suite
- **Team Workload & Efficiency Benchmarks**: Resolution efficiency, breach rates, and friction tiers across support teams.
- **Drop-Point & Bottleneck Analytics**: Pinpoints the exact operational handoffs and queues causing ticket delays.
- **Real-Time Interactive Prediction Engine**: Real-time ticket risk assessment with primary indicator extraction and recommended resolution workflows.

---

## 3. Tech Stack

- **Backend**: FastAPI, Python 3.10+, Pydantic v2, Uvicorn
- **Machine Learning & NLP**: Scikit-Learn, NumPy, Pandas, Joblib
- **Database**: SQLite / SQLAlchemy ORM
- **Containerization**: Docker, Docker Compose
- **Testing**: Pytest, HTTPX

---

## 4. Project Directory Structure

```
TICKET-BOOKING/
├── backend/
│   ├── app/
│   │   ├── analytics/          # Friction, categories, drop points, insights, teams
│   │   ├── api/                # FastAPI routers and REST endpoints
│   │   ├── ml/                 # Naive Bayes model pipeline and training logic
│   │   ├── models/             # SQLAlchemy database models & session management
│   │   ├── nlp/                # NLP engine, TF-IDF vectorization, theme clustering
│   │   ├── preprocessing/      # Data cleaning, outlier handling, feature engineering
│   │   ├── schemas/            # Pydantic request and response schemas
│   │   ├── services/           # Orchestration and pipeline execution services
│   │   ├── utils/              # Utility helpers
│   │   └── main.py             # FastAPI entrypoint and lifespan management
│   ├── model_artifacts/        # Serialized pipelines and evaluation metrics
│   ├── Dockerfile              # Container definition for backend service
│   └── requirements.txt        # Python dependency manifest
├── frontend/                   # React 18 + TypeScript + Vite UI client
│   ├── src/                    # UI components, layout, and styles
│   ├── package.json            # Node dependency manifest
│   ├── tsconfig.json           # TypeScript configuration
│   └── Dockerfile              # Container definition for frontend service
├── data/
│   ├── raw/                    # Raw dataset repository
│   └── processed/              # Processed feature matrices
├── notebooks/
│   └── exploratory_analysis.ipynb # Comprehensive EDA and model experiments
├── tests/
│   └── test_api.py             # Integration and API test suite
├── docker-compose.yml          # Containerized orchestration specification
├── .env.example                # Sample environment configuration
└── supportpulse_ai_support_tickets_25000.csv # Full benchmark dataset (25,000 records)
```

---

## 5. Quick Start Guide

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm
- Docker & Docker Compose (optional)

### Option A: Local Development

#### 1. Backend Setup
```bash
# Navigate to backend directory
cd TICKET-BOOKING/backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI server
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger UI: `http://localhost:8000/docs`
- Interactive ReDoc: `http://localhost:8000/redoc`

#### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd TICKET-BOOKING/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- Frontend UI: `http://localhost:5173`

### Option B: Docker Compose

Launch both backend and frontend containers with a single command:
```bash
cd TICKET-BOOKING
docker-compose up --build
```
- Backend API: `http://localhost:8000`
- Frontend UI: `http://localhost:5173`

---

## 6. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/overview` | Platform overview KPIs, ticket volumes, and SLA metrics |
| `GET` | `/api/friction` | Support Friction Score (SFS) distribution and tier breakdown |
| `GET` | `/api/drop-point` | Bottlenecks, queue delay points, and handoff inefficiencies |
| `GET` | `/api/teams` | Team performance, resolution efficiency, and breach rates |
| `GET` | `/api/nlp-themes` | Unsupervised NLP cluster analysis and high-frustration topics |
| `GET` | `/api/insights` | Strategic operational insights and prioritized action items |
| `POST` | `/api/predict` | Real-time dissatisfaction risk prediction for inbound tickets |
| `GET` | `/api/model-metrics` | Model performance, confusion matrix, and feature importances |

---

## 7. Model Performance & Limitations

### Transparent Model Limitations
- **Conditional Independence Assumption**: Multinomial Naive Bayes assumes word tokens and metadata features are conditionally independent given the risk class.
- **Extreme Class Imbalance**: High-risk dissatisfaction tickets constitute a minor share of total volume (~1-3%), requiring balanced thresholds and stratified sampling.
- **Correlation vs. Causation**: Extracted friction keywords indicate operational correlation with dissatisfaction rather than deterministic causality.
