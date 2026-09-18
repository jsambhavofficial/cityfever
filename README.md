# CityFever — Civic Incident Intelligence Platform

CivicFlow is an AI-powered civic issue intelligence and routing platform built for smart cities and municipal administration. It automatically classifies grievances, extracts vital operational entities (locality and duration), computes transparent 100-point explainable priority scores, clusters duplicates across text and geospatial dimensions, and provides real-time officer queues and analytics dashboards.

---

## 🏗 System Architecture

```text
<<<<<<< HEAD
Citizen Submission (Text + GPS)
        │
        ▼
FastAPI Central Integration Gateway (/api/complaints)
        ├── Text Normalizer (ml/preprocess.py)
        ├── Calibrated NLP Classifier (ml/predict.py)
        ├── Entity Extractor (backend/services/entities.py)
        ├── Explainable Priority Engine (backend/services/priority.py)
        └── Geospatial Duplicate Clusterer (backend/services/duplicates.py)
        │
        ▼
SQLite Database (civicflow.db)
        ├── Officer Queues (/api/queues/{department})
        ├── Real-Time Dashboard KPI Stats (/api/dashboard/stats)
        └── Mapbox Geospatial Intelligence (Frontend / MapView)
=======
cityfever/
├── README.md                          ← Overall project readme
├── .gitignore                         ← Standard gitignore for Python, Node & DB
├── .env.example                       ← Shared environment variable template
│
├── backend/                           ← Member 2: FastAPI integration service
│   ├── main.py                        ← Application entrypoint & middleware
│   ├── database.py                    ← SQLAlchemy database connection
│   ├── models.py                      ← Canonical complaint schema ORM
│   ├── schemas.py                     ← Pydantic validation models
│   ├── requirements.txt               ← Backend dependencies
│   ├── README.md                      ← Backend setup guide
│   ├── civicflow.db                   ← SQLite database
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── complaints.py              ← Submission & triage pipeline
│   │   ├── queues.py                  ← Prioritized department queues
│   │   └── dashboard.py               ← Aggregated KPI statistics & clusters
│   └── services/
│       ├── __init__.py
│       ├── classifier.py              ← Member 1: ML prediction & rule fallback
│       ├── priority.py                ← Member 4: 100-pt explainable priority engine
│       ├── entities.py                ← Member 4: Regex locality & duration parser
│       ├── duplicates.py              ← Member 5: TF-IDF & Haversine de-duplication
│       └── clusters.py                ← Member 3: Spatial clustering & hotspot detection
│
├── ml/                                ← ML pipelines & member stubs
│   ├── train.py
│   ├── predict.py
│   ├── preprocess.py
│   ├── evaluate.py
│   ├── metrics.json
│   ├── member1_classifier/            ← Member 1 instructions & integration
│   ├── member3_clusters/              ← Member 3 instructions & integration
│   ├── member4_priority_entities/      ← Member 4 instructions & integration
│   ├── member5_duplicates/            ← Member 5 instructions & integration
│   ├── models/
│   │   ├── department_model.joblib
│   │   └── issue_model.joblib
│   └── vectorizers/
│       ├── department_vectorizer.joblib
│       └── issue_vectorizer.joblib
│
├── data/
│   └── generated/                     ← Synthetic & operational datasets
│       ├── generate_dataset.py
│       ├── civicflow_complaints.csv
│       ├── civicflow_train.csv
│       ├── civicflow_test.csv
│       └── dataset_summary.json
│
├── frontend/                          ← Member 6: React / Vite Citizen & Officer portal
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/
│       │   └── client.js              ← REST client for backend /api/*
│       ├── components/
│       │   ├── Map.jsx                ← Geospatial incident map with priority markers
│       │   ├── ComplaintCard.jsx      ← Detailed complaint card with reason pills
│       │   ├── QueueView.jsx          ← Department queue list sorted by priority
│       │   └── StatCards.jsx          ← Summary KPI metrics cards
│       └── pages/
│           ├── CitizenSubmit.jsx      ← Citizen submission portal
│           └── OfficerDashboard.jsx   ← Operations command center (Triage, Map, Queues)
│
└── docs/
    ├── API_CONTRACT.md                ← Canonical schema & endpoint specification
    ├── SCHEMAS.md                     ← Data models & payload definitions
    ├── INTEGRATION_GUIDE.md           ← Step-by-step service swap instructions
    ├── member_instructions/           ← Team instructions (Members 1 to 6)
    │   ├── 01_ml_classification.md
    │   ├── 02_backend_api.md
    │   ├── 03_frontend_citizen_dashboard.md
    │   ├── 04_priority_entities.md
    │   ├── 05_mapbox_analytics.md
    │   └── 06_integration_testing_pitch.md
    ├── pitch/                         ← Demo scripts & presentation slides
    └── member4_handoff.md             ← Priority & entity handoff notes

>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d
```

---

## 🚀 Quick Start

### 1. Backend Setup & Run

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run the FastAPI server (auto-initializes & seeds demo database)
python run_backend.py
```
- **API Base URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

## 📊 Canonical API Contract

See [API_CONTRACT.md](file:///c:/Users/user/Desktop/kkfdsakf/docs/API_CONTRACT.md) for full specifications and request/response payloads.

```json
{
  "id": "C1001",
  "complaint_text": "Sewage has been overflowing near St Mary School for three days, students cannot enter.",
  "department": "Sewage",
  "issue_type": "Sewage Overflow",
  "department_confidence": 0.94,
  "issue_confidence": 0.92,
  "priority_score": 85,
  "priority_level": "High",
  "priority_reasons": [
    "Critical hazard or high-severity public infrastructure failure",
    "Reported duration exceeds 48 hours: 'three days'",
    "High footfall/sensitive public zone impacted: school"
  ],
  "locality": "St Mary School",
  "duration_text": "three days",
  "latitude": 27.4925,
  "longitude": 77.6738,
  "duplicate_cluster_id": null,
  "matched_complaint_ids": [],
  "status": "Pending",
  "created_at": "2026-09-18T09:00:00"
}
```

---

## 🧪 Testing & Verification

```bash
<<<<<<< HEAD
# Run End-to-End Pipeline Tests
python C:\Users\user\.gemini\antigravity-ide\brain\4cdbdfea-3e94-4887-a047-1bae319b5c66\scratch\test_pipeline.py
=======
python -m unittest tests/test_member4.py
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d
```
