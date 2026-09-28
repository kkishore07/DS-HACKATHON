# Data Science Hackathon Repository

Welcome to the **DS-HACKATHON** project repository. This monorepo hosts two production-ready, data-driven machine learning and intelligent analytics platforms solving real-world domain challenges in customer operations and digital education:

| Project | Domain | Machine Learning / Analytics Approach | Directory |
|---|---|---|---|
| **SupportPulse AI** | IT Support & Service Desk Operations | Multinomial Naive Bayes + TF-IDF NLP Clustering + Friction Scoring | [`TICKET-BOOKING/`](./TICKET-BOOKING) |
| **LearnPulse AI** | EdTech & Higher Education Retention | Stratified Random Forest Classifier + Behavioral Dropout Forecasting + Automated Intervention Engine | [`PROJ 2/`](./PROJ%202) |

---

## 🌟 Project 1: SupportPulse AI (`TICKET-BOOKING`)

**SupportPulse AI** is an intelligent IT support analytics and customer frustration detection platform designed to identify operational bottlenecks, calculate ticket friction scores, and predict customer dissatisfaction risks before escalation.

### Highlights:
- **Support Friction Scoring (SFS)**: Evaluates response delays, resolution efficiency, priority escalations, and reopen factors to quantify friction.
- **Unsupervised NLP Topic Discovery**: Uses TF-IDF and K-Means clustering to uncover latent operational themes and failure modes across 25,000+ support records.
- **Multinomial Naive Bayes Risk Classifier**: End-to-end scikit-learn pipeline predicting customer satisfaction risk (`High Risk`, `Medium Risk`, `Low Risk`) from text descriptions and operational metadata.
- **Operational Intelligence Dashboard**: Team performance metrics, SLA breach analytics, and automated workflow recommendations.

📖 [Read the complete SupportPulse AI Documentation](./TICKET-BOOKING/README.md)

---

## 🎓 Project 2: LearnPulse AI (`PROJ 2`)

**LearnPulse AI** is an enterprise-grade retention intelligence platform that continuously analyzes multi-channel learner behavior (logins, video progress, quizzes, assignments, discussions) to predict student dropout risk and trigger personalized pedagogical interventions.

### Highlights:
- **Predictive Dropout Modeling**: Optimized Random Forest Classifier trained on 25,000 learner journeys achieving high accuracy, ROC-AUC, and macro F1 score.
- **Behavioral Early Warning System**: Detects disengagement early in the course lifecycle through feature engineering (Early Engagement Index, cohort-relative activity rates).
- **Pedagogical Intervention Engine**: Rule-based, transparent recommendation engine prescribing tailored interventions (Academic Mentors, Peer Study Groups, Paced Schedules).
- **Interactive Full-Stack Web Application**: FastAPI backend paired with a modern React 18 + TypeScript + Vite + TailwindCSS dashboard with real-time risk simulation.

📖 [Read the complete LearnPulse AI Documentation](./PROJ%202/README.md)

---

## 🚀 Repository Structure

```
DS-HACKATHON/
├── .gitignore                    # Global git ignore configuration
├── README.md                     # Root repository overview and guide
│
├── TICKET-BOOKING/               # Project 1: SupportPulse AI
│   ├── backend/                  # FastAPI backend, ML pipelines, and NLP engine
│   ├── data/                     # Raw support ticket dataset (25k tickets)
│   ├── notebooks/                # Exploratory Data Analysis & experiments
│   ├── tests/                    # Integration and unit tests
│   ├── docker-compose.yml        # Container orchestration
│   └── README.md                 # SupportPulse AI project documentation
│
└── PROJ 2/                       # Project 2: LearnPulse AI
    ├── backend/                  # FastAPI backend & Random Forest model service
    ├── frontend/                 # React 18 + Vite + TypeScript dashboard UI
    ├── learnpulse_ai_edtech_dropout_25000.csv # Learner benchmark dataset
    └── README.md                 # LearnPulse AI project documentation
```

---

## 🛠️ Getting Started

Each project is self-contained with its own dependencies and configuration:

### Running SupportPulse AI:
```bash
cd TICKET-BOOKING/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Running LearnPulse AI:
```bash
# Backend:
cd "PROJ 2/backend"
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend:
cd "../frontend"
npm install
npm run dev
```

---

## 👥 Authors & Team
- **GitHub**: [@kkishore07](https://github.com/kkishore07)
- **Repository**: [DS-HACKATHON](https://github.com/kkishore07/DS-HACKATHON)
