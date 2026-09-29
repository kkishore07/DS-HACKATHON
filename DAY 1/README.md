# DS-HACKATHON: Dual-Domain Predictive Intelligence Platforms

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.13-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python Version" />
  <img src="https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Scikit--Learn-1.5+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-Learn" />
  <img src="https://img.shields.io/badge/Vite-5.4+-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Benchmarks-50%2C000%20Records-blueviolet?style=for-the-badge" alt="Benchmark Records" />
</p>

---

## 📌 Executive Overview

The **DS-HACKATHON** monorepo hosts two production-grade, end-to-end data science and machine learning applications engineered to solve acute operational friction and learner attrition challenges across two high-impact domains:

1. **[SupportPulse AI](./TICKET-BOOKING)** (`TICKET-BOOKING`): An intelligent IT service desk analytics and customer frustration forecasting platform combining multi-channel ticket metadata, custom **Support Friction Scoring (SFS)**, unsupervised **TF-IDF + K-Means NLP theme clustering**, and a **Multinomial Naive Bayes** risk classification pipeline.
2. **[LearnPulse AI](./LEARNING-PORTAL)** (`LEARNING-PORTAL`): An enterprise-grade EdTech retention intelligence platform that analyzes multi-channel learner behavior, models longitudinal disengagement across a 5-stage progression, predicts student dropout risk via a tuned **Random Forest Classifier** (80.0% Accuracy, 75.1% Non-Completer Recall, 0.869 ROC-AUC), and triggers targeted pedagogical interventions through an interactive full-stack dashboard.

Together, these platforms demonstrate production ML pipelines, zero-leakage data engineering, RESTful microservices with FastAPI, interactive React + TypeScript user interfaces, and automated decision-support systems benchmarked on **50,000 real-world simulated operational records**.

---

## ⚖️ Comparative Systems Matrix

| Feature / Dimension | SupportPulse AI (`TICKET-BOOKING`) | LearnPulse AI (`LEARNING-PORTAL`) |
|---|---|---|
| **Domain** | IT Service Desk & Support Operations | Higher Education & EdTech Retention |
| **Core Objective** | Detect customer frustration & operational bottlenecks before SLA breach | Forecast student dropout risk early & trigger pedagogical interventions |
| **Benchmark Dataset** | 25,000 IT support tickets (`data/raw/`) | 25,000 multi-channel learner journeys (`data/`) |
| **Supervised ML Model** | **Multinomial Naive Bayes** (TF-IDF + Categorical OneHot + MinMax) | **Random Forest Classifier** (300 estimators, balanced weights) |
| **Evaluation Metrics** | Macro F1, Minority High-Risk Recall, Confusion Matrix | ROC-AUC (0.869), Non-Completer Recall (75.1%), Accuracy (80.0%) |
| **Diagnostic / Unsupervised** | Unsupervised TF-IDF + K-Means clustering for latent failure modes | Longitudinal 5-Stage Drop-Off Progression & Early Engagement Index (EEI) |
| **Domain KPI / Metric** | **Support Friction Score (SFS)** (0–100 scale) | **Composite Engagement Score** (0–100 weighted index) |
| **Actionable Output** | Queue rebalancing, SLA breach alerts, automated resolution routing | 6-tier intervention queue (mentors, study circles, micro-lessons) |
| **Backend Stack** | Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy, Scikit-Learn | Python 3.13, FastAPI, Pydantic v2, SQLAlchemy, Scikit-Learn |
| **Frontend Stack** | React 18, TypeScript, TailwindCSS, Vite, Lucide | React 18, TypeScript, TailwindCSS, Vite, Recharts, Lucide |
| **Containerization** | Docker & Docker Compose orchestration | Dockerfile & container-ready architecture |
| **Documentation** | [SupportPulse AI README](./TICKET-BOOKING/README.md) | [LearnPulse AI README](./LEARNING-PORTAL/README.md) |

---

## 🌟 Project 1: SupportPulse AI (`TICKET-BOOKING`)

> **"Identify support friction before escalation. Uncover root causes with NLP. Predict customer dissatisfaction risks in real-time."**

SupportPulse AI tackles IT support bottlenecks by combining structured telemetry (resolution times, priority escalations, reopened tickets, team workloads) with unstructured customer descriptions.

```
┌─────────────────────────┐     ┌───────────────────────────────┐     ┌──────────────────────────────┐
│  Multi-Channel Tickets  │ ──► │  Support Friction Score (SFS) │ ──► │  Drop-Point & Team Bottleneck│
│ (25k Inbound Records)   │     │  Response, Reopen, SLA Penalty│     │  Efficiency & Queue Analytics│
└────────────┬────────────┘     └───────────────────────────────┘     └──────────────┬───────────────┘
             │                                                                       │
             ▼                                                                       ▼
┌─────────────────────────┐     ┌───────────────────────────────┐     ┌──────────────────────────────┐
│ Unsupervised NLP Mining │ ──► │  Multinomial Naive Bayes ML   │ ──► │  Real-Time Risk API          │
│ TF-IDF + K-Means Topics │     │  Text + Metadata Classifier   │     │  Automated Resolution Routing│
└─────────────────────────┘     └───────────────────────────────┘     └──────────────────────────────┘
```

### Key Technical Capabilities:
- **Support Friction Scoring (SFS)**: Proprietary 0–100 composite index quantifying support journey pain points using response deviations, reopen penalties, priority weights, and SLA breach multipliers.
- **Unsupervised NLP Theme Discovery**: Extracts domain vocabulary and clusters raw ticket texts into actionable operational failure themes (e.g., authentication timeouts, payment gateway latency, database connection pooling).
- **Multinomial Naive Bayes Classifier**: Integrated `ColumnTransformer` pipeline preprocessing text (TF-IDF), categorical attributes (`Category`, `Priority`, `Team`), and normalized numerical metrics to classify tickets into **Low**, **Medium**, or **High** dissatisfaction risk.
- **Drop-Point & Bottleneck Analytics**: Pinpoints exact stages in the ticket lifecycle where resolution queues experience severe delays or repeated handoffs.
- **Interactive RESTful Engine**: Real-time `/api/predict` endpoint evaluating inbound tickets instantly with primary risk indicators and recommended resolution actions.

👉 **Full Details**: Read the dedicated [SupportPulse AI Documentation](./TICKET-BOOKING/README.md).

---

## 🎓 Project 2: LearnPulse AI (`LEARNING-PORTAL`)

> **"Detect disengagement early. Understand why learners drop out. Intervene before they leave."**

LearnPulse AI solves the critical EdTech retention challenge (where course dropout rates frequently exceed 40%) by identifying early disengagement patterns across logins, video watch percentages, formative quiz scores, assignment completion, and discussion participation.

```
┌────────────────────────────────────────────────────────┐
│                   LEARNER ACTIVITY                     │
│  (Logins, Video Progress, Quizzes, Projects, Forums)   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             BEHAVIORAL FEATURE ENGINEERING             │
│  (Composite Engagement, Early Index, Relative Cohort)  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│         LONGITUDINAL DISENGAGEMENT ANALYSIS            │
│  (5-Stage Drop-Off Progression & Decay Classification) │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│          RANDOM FOREST PREDICTIVE ML ENGINE            │
│ (Stratified 80/20, Balanced Weights, Probability Est.) │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│          RULE-BASED INTERVENTION ORCHESTRATION         │
│  (Priority = Risk × Engagement Gap, Support Queues)    │
└────────────────────────────────────────────────────────┘
```

### Key Technical Capabilities:
- **Early Engagement Index (EEI)**: Proven empirical signal demonstrating that learner activity within the first 20–30% of the syllabus forecasts over 80% of eventual outcomes.
- **Longitudinal 5-Stage Drop-Off Analysis**: Tracks cohort engagement decay across Course Onboarding, Core Foundation, Mid-Term Application (the primary friction point at Stage 3), Advanced Projects, and Final Capstone.
- **Random Forest ML Engine**: Evaluated on 5,003 test samples with strict zero-leakage isolation:
  - **ROC-AUC**: `0.869`
  - **Non-Completer Recall**: `75.1%` (high-sensitivity minority class capture)
  - **Completed Recall**: `83.0%`
  - **Overall Accuracy**: `80.0%`
- **6-Category Intervention Center**: Automatically routes at-risk students into targeted support tracks (Academic Mentors, Peer Study Circles, Micro-Lessons, Diagnostic Practice Quizzes, Deadline Extensions, Advisor Outreach).
- **Interactive Full-Stack Web Application**: FastAPI backend paired with a modern React 18 + TypeScript + Vite + TailwindCSS dashboard featuring real-time risk simulation, sorting, filtering, and model retraining.

👉 **Full Details**: Read the dedicated [LearnPulse AI Documentation](./LEARNING-PORTAL/README.md).

---

## 📊 Unified Benchmark Datasets (50,000 Records)

Both platforms operate on structured, 25,000-instance benchmark datasets capturing diverse operational distributions, realistic anomalies, and non-linear patterns:

| Dataset | Records | Features | Target Variable | Data Hygiene & Anomaly Handling |
|---|---|---|---|---|
| **Support Tickets Benchmark** | 25,000 | 12 features (text + metadata) | `Satisfaction_Risk` (Low / Medium / High) | Outlier clipping on response hours, text normalization, missing team handling |
| **EdTech Learner Benchmark** | 25,000 | 14 behavioral & cohort metrics | `Completion_Status` (0 / 1 binary target) | Deduplication (15 duplicate pairs), negative login clipping (168 clipped), range normalization |

---

## 🗂️ Monorepo Directory Structure

```
DS-HACKATHON/
│
├── README.md                                  # Monorepo Master Documentation (This file)
├── .gitignore                                 # Unified Git ignore rules (node_modules, pycache, .db, .env)
│
├── TICKET-BOOKING/                            # PROJECT 1: SupportPulse AI
│   ├── backend/                               # FastAPI backend service
│   │   ├── app/
│   │   │   ├── analytics/                     # Friction scoring, team metrics, drop-point analysis
│   │   │   ├── api/                           # REST routers and endpoints
│   │   │   ├── ml/                            # Naive Bayes training & scikit-learn pipeline
│   │   │   ├── models/                        # SQLAlchemy database models
│   │   │   ├── nlp/                           # TF-IDF vectorization & K-Means clustering
│   │   │   ├── preprocessing/                 # Feature cleaning & scaling
│   │   │   ├── schemas/                       # Pydantic v2 schemas
│   │   │   ├── services/                      # Pipeline orchestration & cache
│   │   │   └── main.py                        # FastAPI entrypoint & lifespan
│   │   ├── model_artifacts/                   # Serialized ML pipeline joblibs
│   │   ├── Dockerfile                         # Backend container definition
│   │   └── requirements.txt                   # Backend dependencies
│   ├── frontend/                              # React 18 + TypeScript + Vite UI
│   │   ├── src/                               # Application source code
│   │   ├── package.json                       # Frontend dependencies
│   │   └── tsconfig.json                      # TypeScript configuration
│   ├── data/                                  # Data directory
│   │   ├── raw/                               # Raw ticket records
│   │   └── processed/                         # Processed feature matrices
│   ├── notebooks/                             # Exploratory Data Analysis & notebooks
│   │   └── exploratory_analysis.ipynb
│   ├── tests/                                 # API and pipeline integration tests
│   │   └── test_api.py
│   ├── docker-compose.yml                     # Multi-container orchestration (Backend + Frontend)
│   ├── supportpulse_ai_support_tickets_25000.csv # Benchmark dataset (25,000 tickets)
│   └── README.md                              # SupportPulse AI deep-dive documentation
│
└── LEARNING-PORTAL/                           # PROJECT 2: LearnPulse AI
    ├── backend/                               # FastAPI backend service
    │   ├── app/
    │   │   ├── api/                           # Endpoints (learners, courses, risk, interventions)
    │   │   ├── ml/                            # Random Forest training & inference pipeline
    │   │   ├── models/                        # SQLAlchemy models & DB configuration
    │   │   ├── schemas/                       # Pydantic v2 validation models
    │   │   ├── services/                      # Feature engineering & analytical engines
    │   │   └── main.py                        # FastAPI entrypoint & CSV auto-loader
    │   ├── model_artifacts/                   # Trained Random Forest model joblib
    │   └── requirements.txt                   # Backend dependencies
    ├── frontend/                              # React 18 + TypeScript + Tailwind + Recharts UI
    │   ├── src/
    │   │   ├── components/                    # UI cards, modals, tables, navbar
    │   │   ├── pages/                         # Dashboard views (Overview, Learners, Courses, Model)
    │   │   ├── services/                      # Axios API client
    │   │   └── types/                         # TypeScript interface definitions
    │   ├── package.json                       # Frontend dependencies
    │   ├── vite.config.ts                     # Vite configuration & API reverse proxy
    │   └── tsconfig.json                      # TypeScript configuration
    ├── learnpulse_ai_edtech_dropout_25000.csv # Benchmark dataset (25,000 learner journeys)
    └── README.md                              # LearnPulse AI deep-dive documentation
```

---

## ⚡ Quick Start & Execution Guide

### Prerequisites
- **Python**: `3.10` or higher (`3.11` / `3.12` / `3.13` supported)
- **Node.js**: `v18.0.0` or higher & `npm`
- **Docker & Docker Compose** *(optional, for containerized run)*

---

### 🚀 Running Project 1: SupportPulse AI (`TICKET-BOOKING`)

#### Option A: Local Development
```bash
# 1. Start Backend API Server
cd TICKET-BOOKING/backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Docs (Swagger): `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/health`

```bash
# 2. Start Frontend UI Client (Open a second terminal)
cd TICKET-BOOKING/frontend
npm install
npm run dev
```
- Web Application: `http://127.0.0.1:5173`

#### Option B: Docker Compose
```bash
cd TICKET-BOOKING
docker-compose up --build
```
- Backend: `http://localhost:8000` | Frontend: `http://localhost:5173`

---

### 🚀 Running Project 2: LearnPulse AI (`LEARNING-PORTAL`)

#### Option A: Local Development
```bash
# 1. Start Backend API Server
cd LEARNING-PORTAL/backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Docs (Swagger): `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/api/health`

```bash
# 2. Start Frontend UI Client (Open a second terminal)
cd LEARNING-PORTAL/frontend
npm install
npm run dev
```
- Web Application: `http://127.0.0.1:5173` *(Proxies `/api` requests to backend on port 8000)*

---

### 💡 Running Both Applications Concurrently

To run both SupportPulse AI and LearnPulse AI simultaneously on the same machine without port conflicts:

| Application | Service | Command | Host & Port |
|---|---|---|---|
| **SupportPulse AI** | Backend | `uvicorn app.main:app --port 8000` | `http://127.0.0.1:8000` |
| **SupportPulse AI** | Frontend | `npm run dev -- --port 5173` | `http://127.0.0.1:5173` |
| **LearnPulse AI** | Backend | `uvicorn app.main:app --port 8001` | `http://127.0.0.1:8001` |
| **LearnPulse AI** | Frontend | `npm run dev -- --port 5174` | `http://127.0.0.1:5174` |

*(Note: If running LearnPulse on port 8001, adjust the target port in `LEARNING-PORTAL/frontend/vite.config.ts` from 8000 to 8001).*

---

## 📡 API Endpoints Reference Cheat Sheet

### SupportPulse AI (`TICKET-BOOKING` - Port 8000)
| HTTP Method | Endpoint | Functional Purpose |
|---|---|---|
| `GET` | `/health` | Service and dataset readiness check |
| `GET` | `/api/overview` | Platform KPIs, ticket volumes, and SLA metrics |
| `GET` | `/api/friction` | Support Friction Score (SFS) distribution & tier metrics |
| `GET` | `/api/drop-point` | Queue delays, stage bottlenecks, and handoff latencies |
| `GET` | `/api/teams` | Team workload benchmarks, resolution efficiency, and breach rates |
| `GET` | `/api/nlp-themes` | Unsupervised NLP cluster analysis and high-frustration topics |
| `GET` | `/api/insights` | Strategic operational insights and prioritized action items |
| `POST` | `/api/predict` | Real-time dissatisfaction risk prediction for inbound tickets |
| `GET` | `/api/model-metrics` | Model performance, confusion matrix, and feature importances |

### LearnPulse AI (`LEARNING-PORTAL` - Port 8000)
| HTTP Method | Endpoint | Functional Purpose |
|---|---|---|
| `GET` | `/api/health` | Service health status and dataset initialization state |
| `GET` | `/api/overview` | Platform-wide KPIs, alerts, dynamic insights, and visual summaries |
| `GET` | `/api/learners` | Paginated learners table with search, sorting, and multi-filters |
| `GET` | `/api/learners/{learner_id}` | Detailed learner profile with empirical behavioral diagnosis |
| `GET` | `/api/courses` | Course matrix comparison with structure risk ratings |
| `GET` | `/api/courses/{course_id}` | Course detail analytics with enrolled at-risk learners |
| `GET` | `/api/engagement` | Engagement distribution, early index bands, and stage decay |
| `GET` | `/api/dropout-risk` | Risk category breakdown and high-priority learners |
| `GET` | `/api/interventions` | Categorized intervention counts and prioritized action queue |
| `POST` | `/api/interventions/{learner_id}/action` | Dispatches or updates intervention workflow status |
| `GET` | `/api/model/metrics` | Random Forest metrics (ROC-AUC, Non-completer recall, CM) |
| `GET` | `/api/model/features` | Sorted feature importance list with descriptions |
| `POST` | `/api/model/train` | Retrains Random Forest model on the active dataset |
| `POST` | `/api/upload` | Uploads a custom CSV, runs data validation, and updates cache |

---

## 🛡️ Engineering Rigor & Data Integrity

- **Zero Data Leakage**: Target labels (`Satisfaction_Risk` in SupportPulse and `Completion_Status` in LearnPulse) are strictly excluded from input feature pipelines.
- **Robust Outlier & Anomaly Handling**: Automatic clipping of anomalous counters (negative logins, video percentages $>100\%$, extreme resolution hours).
- **Type Safety**: End-to-end type validation utilizing Python Pydantic v2 on backends and strict TypeScript interfaces across React frontends.
- **Transparent Predictions**: Model inference outputs accompanied by transparent feature contributions rather than ungrounded causal claims.

---

## 👥 Authors & Team

- **Author / Lead Developer**: [@kkishore07](https://github.com/kkishore07)
- **Repository**: [DS-HACKATHON](https://github.com/kkishore07/DS-HACKATHON)
- **Competition**: Data Science Hackathon Submission

---

<p align="center">
  <b>DS-HACKATHON &copy; 2026. Built with precision for intelligent operational analytics and student retention.</b>
</p>