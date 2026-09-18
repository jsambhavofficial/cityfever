# CivicFlow Backend & Integration API (Member 2)

Central FastAPI backend for the Civic Incident Intelligence Platform. Connects the ML classification engine, rule-based priority engine, duplicate detection clustering, SQLite database, and frontend dashboards.

---

## Architecture Overview

```text
POST /api/complaints
        ↓
clean text (ml/preprocess.py)
        ↓
ML prediction (ml/predict.py) → Department & Issue Type + Confidence
        ↓
Entity extraction (backend/services/entities.py) → Locality & Duration
        ↓
Priority scoring (backend/services/priority.py) → 100-Point Score + Reasons
        ↓
Duplicate detection (backend/services/duplicates.py) → TF-IDF & Haversine Clustering
        ↓
Confidence Evaluation (<0.60 → status = "Manual Review")
        ↓
Save to SQLite Database
        ↓
Return Canonical Complaint Object
```

---

## Canonical Complaint Schema

```json
{
  "id": "C1024",
  "complaint_text": "There is a large pothole near Krishna Nagar market for 3 days.",
  "department": "Roads",
  "issue_type": "Pothole",
  "department_confidence": 0.94,
  "issue_confidence": 0.91,
  "priority_score": 82,
  "priority_level": "High",
  "priority_reasons": [
    "Safety-related infrastructure issue",
    "Reported duration exceeds 48 hours",
    "Public location detected"
  ],
  "locality": "Krishna Nagar",
  "duration_text": "3 days",
  "latitude": 27.492,
  "longitude": 77.673,
  "duplicate_cluster_id": null,
  "matched_complaint_ids": [],
  "status": "Pending",
  "assigned_to": null,
  "created_at": "2026-09-18T09:00:00"
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/complaints` | Submit a new citizen complaint (executes ML, entities, priority & dupes) |
| `GET` | `/api/complaints` | List complaints with filters (`department`, `priority_level`, `status`, `search`) |
| `GET` | `/api/complaints/{id}` | Get single complaint details |
| `PATCH` | `/api/complaints/{id}` | Update status (`Pending`, `In Progress`, `Resolved`, `Rejected`, etc.) |
| `POST` | `/api/complaints/{id}/reassign` | Reassign complaint department & officer |
| `GET` | `/api/complaints/{id}/similar` | Get similar/duplicate complaints in the same cluster |
| `GET` | `/api/queues/{department}` | Get department-specific officer incoming queue |
| `GET` | `/api/dashboard/stats` | High-level KPI counts, department breakdown & top localities |

---

## Running the Server

```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Start server
uvicorn backend.main:app --reload --port 8000
```

Interactive Swagger Docs available at: `http://localhost:8000/docs`
