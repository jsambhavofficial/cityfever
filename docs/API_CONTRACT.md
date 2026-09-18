# CivicFlow Canonical API Contract & Specifications

This document defines the single source of truth for all API communication between backend, ML engine, frontend dashboards, and Mapbox geospatial visualizations.

---

## 1. Canonical Complaint Object

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
  "created_at": "2026-09-18T09:00:00",
  "updated_at": "2026-09-18T09:00:00"
}
```

---

## 2. Canonical Values

### Departments
- `Roads`
- `Water`
- `Sanitation`
- `Electrical`
- `Sewage`
- `Traffic`
- `Parks`
- `Other`

### Priority Levels
- `Low` (Score: 0 – 30)
- `Medium` (Score: 31 – 60)
- `High` (Score: 61 – 100)

### Statuses
- `Pending` (Initial routed status)
- `Manual Review` (Confidence < 0.60 trigger)
- `In Progress` (Assigned / under work)
- `Resolved` (Closed)
- `Rejected` (Invalid or out of jurisdiction)

---

## 3. Endpoints Reference

### `POST /api/complaints`
- **Purpose**: Citizen submits complaint text (with optional locality and coordinates).
- **Request Body**:
```json
{
  "complaint_text": "Sewage has been overflowing near school for three days.",
  "locality": "Krishna Nagar",
  "latitude": 27.492,
  "longitude": 77.673
}
```
- **Response**: `201 Created` with full Canonical Complaint Object.

### `GET /api/complaints`
- **Query Params**:
  - `department` (e.g. `Roads`)
  - `priority_level` (`High`, `Medium`, `Low`)
  - `status` (`Pending`, `Manual Review`, `In Progress`, `Resolved`)
  - `duplicate_cluster_id` (e.g. `CL-001`)
  - `search` (text query)
  - `limit` (default: 100)
  - `offset` (default: 0)

### `GET /api/complaints/{id}`
- **Response**: Single Complaint Object.

### `PATCH /api/complaints/{id}`
- **Request Body**:
```json
{
  "status": "In Progress",
  "assigned_to": "Officer Verma"
}
```

### `POST /api/complaints/{id}/reassign`
- **Request Body**:
```json
{
  "department": "Sanitation",
  "reason": "Actually dead animal waste, not electrical",
  "assigned_to": "Officer Sharma"
}
```

### `GET /api/complaints/{id}/similar`
- **Response**:
```json
{
  "duplicate_cluster_id": "CL-001",
  "complaint_count": 3,
  "primary_issue": "Pothole",
  "department": "Roads",
  "locality": "Krishna Nagar",
  "complaints": [ ...list of complaint objects... ]
}
```

### `GET /api/queues/{department}`
- **Response**: List of complaints assigned to the requested department, sorted high-priority first.

### `GET /api/dashboard/stats`
- **Response**:
```json
{
  "total_complaints": 15,
  "high_priority_count": 5,
  "medium_priority_count": 7,
  "low_priority_count": 3,
  "manual_review_count": 1,
  "pending_count": 9,
  "in_progress_count": 4,
  "resolved_count": 2,
  "duplicate_clusters_count": 1,
  "department_breakdown": {
    "Roads": 4,
    "Sewage": 3,
    "Water": 2,
    "Sanitation": 2,
    "Electrical": 2,
    "Traffic": 1,
    "Parks": 1
  },
  "priority_breakdown": {
    "High": 5,
    "Medium": 7,
    "Low": 3
  },
  "top_localities": {
    "Krishna Nagar": 4,
    "Civil Lines": 2,
    "Sector 62": 2
  }
}
```
