# CivicFlow 3-Minute Hackathon Demo Script (Member 6)

## Overview
CivicFlow is an AI-driven Civic Incident Intelligence Platform that solves the 3 biggest problems in municipal grievance redressal:
1. **Misrouting & Delayed Categorization** (Automated by Calibrated NLP).
2. **Arbitrary Priority Assignment** (Resolved by 100-point Explainable Rule Engine).
3. **Duplicate Spam & Clustered Reports** (Unified by Geospatial & TF-IDF Clustering).

---

## 3-Minute Pitch Flow

### 1. [0:00 - 0:30] Citizen Submission & Live Intelligence Pipeline
- **Action**: Go to Citizen View. Submit:
  > *"Sewage has been overflowing near St Mary School for three days, students cannot enter."*
- **Explain**:
  - Live processing pipeline runs in sub-100ms.
  - Automatically classified under **Sewage** (`confidence: 94%`).
  - Extracted Locality: `St Mary School`, Reported Duration: `3 days`.
  - **Priority Score: 85/100 (HIGH)** with transparent explainability:
    1. *Critical hazard or high-severity public infrastructure failure*
    2. *Reported duration exceeds 48 hours*
    3. *High footfall/sensitive public zone impacted (school)*

### 2. [0:30 - 1:15] Officer Dashboard & Intelligent Routing
- **Action**: Open Officer Dashboard (`/dashboard`).
- **Explain**:
  - Show departmental queues (`Sewage`, `Roads`, `Water`, etc.).
  - Observe how high-priority complaints bubble to the top.
  - Show the **Manual Review** queue:
    - Point out ambiguous/low-confidence complaints (`confidence < 0.60`).
    - Demonstrate one-click **Reassign** to the correct department with an audit reason.

### 3. [1:15 - 1:50] Geospatial & Duplicate Detection in Action
- **Action**: Submit a second citizen report:
  > *"Deep crater on road outside Krishna Nagar market, two wheelers skidding constantly."*
- **Explain**:
  - The system checks both **TF-IDF textual similarity** and **Haversine GPS proximity**.
  - Automatically links into cluster **`CL-001`** without deleting the citizen's submission!
  - Officers can see `3 citizens have reported this exact issue`, avoiding 3 separate field dispatch teams.

### 4. [1:50 - 2:30] Mapbox Geospatial Intelligence
- **Action**: Switch to Map view.
- **Explain**:
  - Markers color-coded by Priority (Red = High, Orange = Medium, Green = Low).
  - Clicking any marker displays full complaint history, cluster ID, and status.
  - Filter by Department or Status in real time.

### 5. [2:30 - 3:00] ML Metrics & Production Architecture
- **Action**: Show model evaluation summary (`ml/metrics.json`).
- **Conclude**:
  > *"CivicFlow turns unstructured citizen complaints into structured, operational intelligence that saves municipal teams hundreds of hours."*
