# CivicFlow — Civic Incident Intelligence Platform

CivicFlow is an AI-powered civic issue intelligence and routing platform built for smart cities and municipal administration. It automatically classifies grievances, extracts vital operational entities (locality and duration), computes transparent 100-point explainable priority scores, clusters duplicates across text and geospatial dimensions, and provides real-time officer queues and analytics dashboards.

---

## 🏗 System Architecture

```text
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
# Run End-to-End Pipeline Tests
python C:\Users\user\.gemini\antigravity-ide\brain\4cdbdfea-3e94-4887-a047-1bae319b5c66\scratch\test_pipeline.py
```
