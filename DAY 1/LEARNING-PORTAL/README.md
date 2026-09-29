# LearnPulse AI

### Early-Warning Student Dropout & Course Completion Intelligence Platform

> **"Detect disengagement early. Understand why learners drop out. Intervene before they leave."**

---

## 1. Project Overview

**LearnPulse AI** is an enterprise-grade EdTech intelligence and predictive machine learning platform designed to address the central challenge facing digital learning providers: **high enrollment volumes paired with steep course attrition and low completion rates**.

Rather than passively reporting historical dropouts after students have already vanished, LearnPulse AI continuously analyzes multi-channel learner behavior (logins, video watch progress, formative quiz participation, graded assignment submissions, and community discussion interactions). By detecting behavioral friction and disengagement at early stages, the system forecasts individual student dropout probability with an optimized **Random Forest Classifier** and triggers rule-based, transparent pedagogical interventions before learners leave the platform.

```
OBSERVE
   ↓
UNDERSTAND
   ↓
PREDICT
   ↓
INTERVENE
```

---

## 2. Problem Statement & Core Business Objective

### The Core Business Question
> *"Which learners are likely to stop completing their course, when do they disengage, what behaviors signal that disengagement, and what intervention can the learning platform take?"*

In high-scale digital education:
- **Attrition is expensive**: Acquiring a new learner costs 5x to 7x more than retaining an existing student.
- **Attrition is progressive**: Learners do not suddenly drop out; their disengagement is foreshadowed weeks in advance by subtle behavioral signals—infrequent logins, skipping video lessons, delayed quiz attempts, and zero forum interactions.
- **The early window matters most**: Analysis reveals that students with low engagement in their first 20–30% of the course window have a completion rate under 20%, whereas highly engaged early learners achieve over 90% completion.

---

## 3. Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   LEARNER ACTIVITY                     │
│  (Logins, Video Progress, Quizzes, Projects, Forums)   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                DATA VALIDATION & QUALITY               │
│ (Duplicate Detection, Range Clipping, Missing Handling)│
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
│             LEARNER RISK SCORING TIERS                 │
│  (Critical 81-100%, High 61-80%, Mod 31-60%, Low 0-30%)│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│          RULE-BASED INTERVENTION ORCHESTRATION         │
│  (Priority = Risk × Engagement Gap, Support Queues)    │
└────────────────────────────────────────────────────────┘
```

---

## 4. Key Features & Dashboard Modules

### 1. Executive Intelligence Overview (`/`)
- **Key KPIs**: Real-time metrics for Total Learners (25,000), Total Courses (20), Completion Rate (59.2%), Average Engagement (53.4), At-Risk Learners (41.1%), and Urgent Interventions (26.9%).
- **Operational Alerts**: Automated signals flagging high-friction courses, critical lifecycle drop-off stages, and early warning flags.
- **Dynamic Strategic Insights**: 6 evidence-based findings providing Title, Empirical Evidence, Business Impact, and Recommended Action calculated on the fly.
- **Primary Visualizations Previews**: Instant visual access to all four core analytical charts.

### 2. Learner Intelligence (`/learners`)
- **Multi-Filter Search**: Filter by course cohort, completion status, dropout risk level, or engagement band.
- **Global & Local Search**: Direct query by Learner ID (e.g., `LNR-000001`) or course code.
- **Paginated Table**: Responsive 25 / 50 / 100 row pagination handling 25,000+ records with sub-10ms response times.
- **Individual Learner Profile**: Deep inspection modal showcasing behavior cards, cohort benchmarks, relative scores, and **Empirical Behavioral Diagnosis** (transparent observations without causal claims).

### 3. Course Structure Intelligence (`/courses`)
- **Course KPIs**: Top performing syllabus, lowest completion friction point, highest cohort engagement, and largest enrollment.
- **Course Completion Matrix**: Sortable table comparing completion rates, video adherence, and assignment submissions across formats (Cohort vs Self-Paced) and levels (Beginner, Intermediate, Advanced).
- **Course Structure Risk Rating**: Neutral operational classification into **Healthy**, **Watch**, and **High Risk**.
- **Course Detail Modal**: Syllabus-level deep dive detailing stage drop-offs and enrolled high-risk students.

### 4. Engagement Analysis (`/engagement`)
- **Composite Engagement Scoring**: Formula: `0.25 × Login + 0.25 × Video + 0.20 × Quiz + 0.20 × Assignment + 0.10 × Discussion`.
- **Early Engagement Section**: Quintile band comparison (0–20, 21–40, 41–60, 61–80, 81–100) proving that early momentum predicts completion.
- **Engagement Decay Tracking**: Classifies student pacing into `Stable (<15 pts)`, `Moderate Decline (15-35 pts)`, and `Rapid Decline (>35 pts)`.

### 5. Dropout Risk Intelligence (`/risk`)
- **Risk Tiers**: Critical Risk (81–100%), High Risk (61–80%), Moderate Risk (31–60%), Low Risk (0–30%).
- **Probability Distribution**: Continuous histogram of predicted non-completion probabilities.
- **High-Priority Learners**: Filtered cohort ranked by intervention urgency.

### 6. Learner Intervention Center (`/interventions`)
- **6 Targeted Support Categories**:
  1. *Re-engagement*: Personalized login reminders and study pacing plans.
  2. *Video Support*: Bite-sized 3–5 min micro-lessons and unfinished lesson bookmarks.
  3. *Quiz Support*: Low-stakes diagnostic practice quizzes with immediate solution hints.
  4. *Assignment Support*: Step-by-step project guides and proactive deadline extensions.
  5. *Community Engagement*: Forum discussion prompts and peer study circles.
  6. *Academic Outreach*: 1-on-1 success advisor triage calls for critical-risk learners.
- **Intervention Priority Metric**: `Priority Score = Dropout Risk × Engagement Gap` (0–100).
- **Interactive Action Queue**: Advisors can dispatch nudges and mark intervention workflows directly from the UI.

### 7. Random Forest Model Performance (`/model`)
- **Model Architecture**: `RandomForestClassifier(n_estimators=300, min_samples_split=5, min_samples_leaf=2, class_weight='balanced', random_state=42)`.
- **Evaluation Suite**: Accuracy, Precision, Recall, F1-Score, ROC-AUC, Completed Recall, and **Non-Completer Recall** (the platform's most vital business metric).
- **Interactive Confusion Matrix**: Heatmap with sample counts and percentages for TP, TN, FP, FN.
- **Feature Importance**: Ranked bar chart with percentage contributions and analytical disclaimer.
- **Model Explainability**: "What Drives Completion?" highlighting top 3 behavioral signals.
- **Retraining Engine**: One-click model retrain endpoint with live execution feedback.

---

## 5. The Four Primary Visualizations

| Visual | Title | Chart Type | Analytical Purpose |
|---|---|---|---|
| **Visual 1** | **Completer vs Non-Completer Behavior** | Grouped Bar Chart | Identifies behavioral divergence across Logins, Video, Quizzes, Assignments, and Discussions. |
| **Visual 2** | **Engagement Drop-Off Curve** | Multi-Area / Line Chart | Maps cohort engagement across Stages 1–5 and highlights the Major Disengagement Point (Stage 3). |
| **Visual 3** | **Course Completion vs Engagement** | Scatter / Bubble Plot | Compares courses with X=Engagement, Y=Completion, and Bubble=Enrollment size, colored by Health. |
| **Visual 4** | **Random Forest Feature Importance** | Horizontal Bar Chart | Quantifies the relative predictive utility of each behavioral feature in the machine learning model. |

---

## 6. Machine Learning Pipeline & Strict Validation

### Zero Data Leakage Guarantee
`Completion_Status` is strictly isolated as the supervised prediction target ($y \in \{0, 1\}$). No future outcome metadata is included in the feature set $X$.

### Handled Data Anomalies
When ingesting the 25,000-record dataset:
1. **Duplicates**: 15 duplicate `Learner_ID + Course_ID` records were detected and retained safely with explicit quality reporting.
2. **Missing Values**: 30 missing discussion counts, 40 missing course names/categories, and 20 missing activity dates were imputed using medians and default taxonomies.
3. **Invalid Values**: 168 negative login counts were clipped to $\ge 0$; 10 video completion percentages $>100\%$ were normalized to $[0, 100]$.
4. **Label Normalization**: All variations (`Completed`, `Complete`, `Yes`, `1`, `True`) and (`Not Completed`, `Incomplete`, `No`, `0`, `False`) are normalized into binary standards.

### Model Evaluation Benchmarks (Test Set: 5,003 Samples)
- **ROC-AUC**: `0.869`
- **Non-Completer Recall**: `75.1%` (Primary Business Metric)
- **Completed Recall**: `83.0%`
- **Overall Accuracy**: `80.0%`
- **Macro F1**: `0.79`

---

## 7. Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Custom Dark Theme Glassmorphism
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Backend
- **Framework**: Python 3.13 + FastAPI
- **Data Engineering**: Pandas, NumPy, SciPy
- **Machine Learning**: Scikit-learn (RandomForestClassifier)
- **Model Persistence**: Joblib
- **Database & ORM**: SQLite + SQLAlchemy 2.0
- **Validation**: Pydantic v2 + Pydantic Settings

---

## 8. Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*The backend will automatically detect and load `learnpulse_ai_edtech_dropout_25000.csv`, train the initial Random Forest model, and expose endpoints at `http://127.0.0.1:8000`.*

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start development server
npm run dev
```
*Open your browser and navigate to `http://127.0.0.1:5173/`.*

---

## 9. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and dataset initialization state. |
| `GET` | `/api/overview` | Platform-wide KPIs, alerts, dynamic insights, and visual summaries. |
| `GET` | `/api/learners` | Paginated learners table with search, sorting, and filters. |
| `GET` | `/api/learners/{learner_id}` | Detailed learner profile with behavioral diagnosis. |
| `GET` | `/api/courses` | Course matrix comparison with structure risk ratings. |
| `GET` | `/api/courses/{course_id}` | Course detail analytics with enrolled at-risk learners. |
| `GET` | `/api/engagement` | Engagement distribution, early index bands, and stage decay. |
| `GET` | `/api/dropout-risk` | Risk category breakdown and high-priority learners. |
| `GET` | `/api/interventions` | Categorized intervention counts and prioritized action queue. |
| `POST` | `/api/interventions/{learner_id}/action` | Dispatches or updates intervention workflow status. |
| `GET` | `/api/model/metrics` | Random Forest metrics (ROC-AUC, Non-completer recall, CM). |
| `GET` | `/api/model/features` | Sorted feature importance list with descriptions. |
| `POST` | `/api/model/train` | Retrains Random Forest model on the active dataset. |
| `POST` | `/api/upload` | Uploads a custom CSV, runs data validation, and updates cache. |

---

## 10. Future Enhancements

1. **Sequence Modeling**: Implement Temporal Transformers or LSTM sequence networks for weekly engagement trajectory prediction.
2. **Automated Interventions**: Direct webhooks into Canvas LMS, Blackboard, and Coursera to trigger automated nudges.
3. **Causal Inference**: Incorporate DoWhy / Double Machine Learning to isolate true causal drivers from correlated behaviors.
4. **Adaptive Curriculum**: Dynamic pacing adjustments recommending remedial practice modules when friction is detected at Stage 3.
5. **A/B Testing Engine**: Measure learner retention uplift across different intervention types (email vs advisor call).

---

## 11. Core Philosophy

> **"Don't wait for students to drop out. Detect disengagement early and intervene."**
