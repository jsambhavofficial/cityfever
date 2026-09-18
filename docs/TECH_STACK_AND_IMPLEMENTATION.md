# CityFever — Tech Stack & Implementation Guide
> **Complete Breakdown of Technologies, Libraries, Algorithms, and How They Are Used**

---

## 📑 Table of Contents
1. [Executive Tech Stack Matrix](#1-executive-tech-stack-matrix)
2. [Backend & Server Technologies](#2-backend--server-technologies)
3. [Machine Learning & NLP Stack](#3-machine-learning--nlp-stack)
4. [Custom Operational Algorithms & Math](#4-custom-operational-algorithms--math)
5. [Frontend & Visualization Stack](#5-frontend--visualization-stack)
6. [Data Storage & Serialization](#6-data-storage--serialization)
7. [Testing, Dev Tools & Architecture Patterns](#7-testing-dev-tools--architecture-patterns)

---

## 1. Executive Tech Stack Matrix

| Layer | Technology | Primary Role in CityFever | File Location / Usage |
|---|---|---|---|
| **Backend Framework** | `FastAPI (0.141)` | Central async REST API gateway, routing, OpenAPI docs | `backend/main.py`, `backend/routes/` |
| **ASGI Web Server** | `Uvicorn (0.52)` | High-performance asynchronous web server | `run_backend.py`, `backend/main.py` |
| **ORM / Data Access** | `SQLAlchemy (2.0)` | Database mapping, connection pooling, queries | `backend/database.py`, `backend/models.py` |
| **Data Validation** | `Pydantic (2.13)` | Schema validation, request sanitization, response formatting | `backend/schemas.py` |
| **Relational Database**| `SQLite 3` | Persistent relational store for complaints & clusters | `backend/civicflow.db` |
| **NLP & ML Framework**| `Scikit-Learn (1.8)`| Text vectorization (TF-IDF) & Logistic Classification | `ml/train.py`, `ml/predict.py` |
| **Model Serialization**| `Joblib (1.5)` | Disk serialization of trained models & vectorizers | `ml/models/`, `ml/vectorizers/` |
| **Data Processing** | `Pandas (2.3) & NumPy` | Dataset generation, train/test split, matrix math | `data/generated/`, `ml/predict.py` |
| **Frontend Framework** | `React 18 + TypeScript` | Interactive citizen & officer dashboards | `src/pages/`, `src/components/` |
| **Frontend Build Tool**| `Vite` | Fast HMR development server & production bundler | `vite.config.ts`, `package.json` |
| **Styling & Design** | `Tailwind CSS` | Sleek dark-mode aesthetic, glassmorphism, responsive grid | `src/index.css`, `tailwind.config.js` |
| **Geospatial Mapping** | `Mapbox GL / WebGL` | Interactive GPS incident markers, clusters & heatmaps | `src/components/CityMap.tsx` |
| **Icons & Visuals** | `Lucide React` | Modern lightweight SVG iconography | `src/components/`, `src/pages/` |

---

## 2. Backend & Server Technologies

### 1. FastAPI (Python)
- **Why it is used:**
  - Provides native **async ASGI performance**, making real-time pipeline execution sub-100ms.
  - Automatically generates interactive **Swagger / OpenAPI documentation** at `/docs`.
  - Built-in dependency injection system (`Depends(get_db)`) for clean database session management.
- **How it is used in CivicFlow:**
  - `backend/main.py`: Configures CORS middleware (permitting `http://localhost:5173`), mounts routers, and manages the startup `lifespan` context (auto-migrating tables and auto-seeding demo data).
  - `backend/routes/complaints.py`: Houses the central `POST /api/complaints` intake pipeline which executes ML prediction, entity extraction, priority scoring, duplicate detection, and database storage in a single transaction.
  - `backend/routes/queues.py`: Serves department-specific queues for municipal officers (`/api/queues/{dept}`).
  - `backend/routes/dashboard.py`: Computes live aggregate statistics and KPIs (`/api/dashboard/stats`).

---

### 2. Uvicorn
- **Why it is used:** Lightning-fast ASGI server implementation for Python based on `uvloop` and `httptools`.
- **How it is used in CivicFlow:**
  - Started via `run_backend.py` on `0.0.0.0:8000` with hot-reloading (`reload=True`) for instant updates.

---

### 3. SQLAlchemy (ORM)
- **Why it is used:** Clean abstraction layer between Python code and relational SQL tables, making the database completely portable (easily switchable from SQLite to PostgreSQL/MySQL/MongoDB).
- **How it is used in CivicFlow:**
  - `backend/database.py`: Establishes the engine with `connect_args={"check_same_thread": False}`, defines `SessionLocal`, and provides the `get_db()` yield generator.
  - `backend/models.py`: Defines the canonical `Complaint` ORM model mapping text, confidence floats, priority integer scores, GPS floats, duplicate cluster IDs, and JSON array columns (`priority_reasons`, `matched_complaint_ids`).

---

### 4. Pydantic v2
- **Why it is used:** Strict runtime data validation, automatic type coercion, and JSON schema enforcement.
- **How it is used in CivicFlow:**
  - `backend/schemas.py`:
    - `ComplaintCreate`: Validates citizen input (minimum length checks, optional GPS coordinates, optional locality hint).
    - `ComplaintResponse`: Enforces the canonical schema contract agreed across all 6 members.
    - `ComplaintReassign` & `ComplaintUpdate`: Validates officer audit actions.
    - `DashboardStats`: Formats real-time operational telemetry.

---

## 3. Machine Learning & NLP Stack

```mermaid
graph LR
    A["Raw Complaint Text"] --> B["ml/preprocess.py<br/>(Clean & Normalization)"]
    B --> C["ml/vectorizers/<br/>(TF-IDF N-Grams)"]
    C --> D["ml/models/<br/>(Logistic Regression)"]
    D --> E["Calibrated Probabilities<br/>(predict_proba)"]
    E --> F["Department & Issue Type + Confidence"]
```

### 1. Scikit-Learn (Classification & Vectorization)
- **`TfidfVectorizer` (Term Frequency-Inverse Document Frequency):**
  - Configured with `ngram_range=(1, 2)` to capture single words (*"pothole"*, *"sparking"*) as well as critical multi-word phrases (*"open manhole"*, *"water leakage"*, *"live wire"*).
  - Uses `sublinear_tf=True` (logarithmic scaling: $1 + \log(\text{tf})$) to prevent long repetitive complaints from biasing predictions.
- **`LogisticRegression` Classifier:**
  - Multi-class classifier configured with $L_2$ regularization ($C=2.0$) and `max_iter=500`.
  - Generates probability distributions across the 8 canonical departments (`Roads`, `Water`, `Sanitation`, `Electrical`, `Sewage`, `Traffic`, `Parks`, `Other`) and standard issue types.
- **`cosine_similarity`:**
  - Computes pairwise cosine similarity between high-dimensional TF-IDF vectors of newly submitted complaints and existing records for NLP duplicate detection.

---

### 2. Joblib
- **Why it is used:** High-performance disk serialization of complex NumPy/scikit-learn objects without Python pickling overhead.
- **How it is used in CivicFlow:**
  - `ml/train.py` writes trained models and fitted vectorizers into `ml/models/` and `ml/vectorizers/`.
  - `ml/predict.py` lazily loads these `.joblib` files on startup, allowing predictions to execute in memory in `<10ms` without retraining.

---

### 3. Text Preprocessing & Regex Engine (`ml/preprocess.py`)
- **Contraction Expansion:** Converts colloquial English (*"can't"*, *"won't"*, *"n't"*) into canonical forms (*"cannot"*, *"will not"*, *"not"*).
- **Sanitization:** Removes non-alphanumeric noise while preserving hyphenated landmark tokens (*"Sector-62"*, *"Block-C"*).
- **Whitespace Normalization:** Strips excess newlines, tabs, and duplicate spaces.

---

## 4. Custom Operational Algorithms & Math

CivicFlow builds several proprietary rule engines on top of pure machine learning:

### 1. The 100-Point Explainable Priority Engine (`backend/services/priority.py`)

Rather than relying on an opaque "black-box" model, CivicFlow implements a transparent 4-factor scoring algorithm:

$$\text{Total Priority Score} = \text{Severity}_{(0–40)} + \text{Duration}_{(0–20)} + \text{Public Impact}_{(0–20)} + \text{Safety Risk}_{(0–20)}$$

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Severity (0–40 pts):                                     │
│    • Open manhole, live wire, gas leak, fatal crater = 40  │
│    • Sewage overflow, pipeline burst = 36                   │
│    • Pothole, power outage, blocked drain = 25              │
│ 2. Duration (0–20 pts):                                     │
│    • >7 days or "weeks" = 20 pts                            │
│    • >48 hours or "3 days" = 15 pts                         │
│    • >24 hours = 10 pts                                     │
│ 3. Public Impact (0–20 pts):                                │
│    • Near school, hospital, market, highway, metro = 20 pts │
│ 4. Safety Risk (0–20 pts):                                  │
│    • Night hazard, injury risk, electrocution risk = 20 pts │
└─────────────────────────────────────────────────────────────┘
```

**Output:** Returns an integer `priority_score` (0–100), a `priority_level` (`High`, `Medium`, `Low`), and dynamic **human-readable reasons** (e.g., *"Reported duration exceeds 48 hours"*, *"High footfall zone impacted: school"*).

---

### 2. Dual-Signal Duplicate Clustering Engine (`backend/services/duplicates.py`)

CivicFlow combines **geospatial proximity** with **lexical similarity** to cluster duplicate reports:

```text
                        ┌───────────────────────────────┐
                        │ New Citizen Complaint Ingest  │
                        └──────────────┬────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     [Haversine GPS Formula]                       [TF-IDF Cosine Sim]
   Distance between (lat1, lon1)                 Sim(text1, text2) score
     and (lat2, lon2) in meters                         (0.0 to 1.0)
                │                                             │
                └──────────────────────┬──────────────────────┘
                                       ▼
        ┌─────────────────────────────────────────────────────────────┐
        │ Cluster Evaluation:                                         │
        │ • Distance ≤ 100m AND Similarity ≥ 0.20 ➔ MATCH             │
        │ • Distance ≤ 400m AND Similarity ≥ 0.35 ➔ MATCH             │
        │ • Distance > 400m AND Similarity ≥ 0.65 ➔ MATCH             │
        └──────────────────────────────┬──────────────────────────────┘
                                       ▼
                   Assign / Join Cluster ID: 'CL-001'
                 (Retains all individual citizen tickets)
```

**Haversine Distance Formula used in code:**
$$d = 2 R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta\text{lon}}{2}\right)}\right)$$
*(where $R = 6,371,000$ meters)*

---

### 3. Probability Calibration & Human-in-the-Loop Guardrail

To prevent flat probability spreading across 8 classes:
- `ml/predict.py` uses relative margin ratio over uniform baseline:
  $$\text{Margin} = P_{\text{top1}} - P_{\text{top2}}$$
  $$\text{Ratio} = \frac{P_{\text{top1}}}{1 / K} \quad (\text{where } K = 8 \text{ classes})$$
- **Guardrail Rule:** If calibrated confidence is $< 0.60$ (indicating an ambiguous or noisy report), the backend automatically sets:
  $$\text{status} = \text{"Manual Review"}$$
  This prevents AI hallucination or incorrect department routing, ensuring a human officer reviews edge cases.

---

## 5. Frontend & Visualization Stack

```
[React 18 + Vite Web Application]
   ├── AppContext (Global State & Live Sync)
   ├── CitizenPortal (Citizen Filing & Tracking)
   ├── Dashboard (Officer Ops Console)
   ├── CityMap (Mapbox GL GPS Visualization)
   └── api/client.js / services/api.ts (REST Bridge)
```

### 1. React 18 with TypeScript
- **State Architecture (`src/context/AppContext.tsx`):**
  - Houses multi-role state switching (`citizen`, `commander`, `field-worker`).
  - Synchronizes on mount with `api.getComplaints()` to load real backend data into memory.
  - Automatically dispatches `POST /api/complaints` on new ticket creation.
- **Strict TypeScript Typing (`src/types/`):**
  - Defines `CanonicalComplaint`, `CitizenComplaint`, `FieldJob`, `IncidentCategory`, `DashboardStats`.

### 2. Tailwind CSS
- Provides the high-end dark command-center aesthetic (`#080D14` canvas, `#111A24` surfaces, `#263342` borders).
- Micro-animations, responsive flex/grid layouts, and glassmorphic modals.

### 3. Mapbox GL / WebGL
- Renders high-performance vector tiles and GPS coordinate markers.
- Color-codes markers based on Priority Score:
  - 🔴 **High Priority (61–100)**: `#D65A5A`
  - 🟡 **Medium Priority (31–60)**: `#D49A32`
  - 🟢 **Low Priority (0–30)**: `#27A878`
- Supports interactive popups showing Complaint ID, Issue, Locality, and Duplicate Cluster status.

---

## 6. Data Storage & Serialization

- **SQLite Database (`backend/civicflow.db`):**
  - Embedded, zero-configuration database ensuring the entire system runs out-of-the-box on any judge's machine.
  - Portable design: The SQLAlchemy schema is 100% compatible with PostgreSQL/MySQL simply by changing the `DATABASE_URL` environment variable.
- **Demo Seed Pipeline (`backend/seed_data.py`):**
  - Contains 15+ hand-crafted realistic municipal scenarios covering all 8 departments, high-priority school/sewage emergencies, duplicate clusters around market areas, and low-confidence edge cases.
  - Automatically populates the database on fresh initialization.

---

## 7. Testing, Dev Tools & Architecture Patterns

### 1. Automated Integration Test Suite (`scratch/test_pipeline.py`)
- Uses `fastapi.testclient.TestClient` to perform automated end-to-end integration tests:
  - `Test 1`: Root health & API info check.
  - `Test 2`: Real-time dashboard KPI computation.
  - `Test 3`: High-priority complaint creation through NLP pipeline.
  - `Test 4`: Duplicate cluster detection on nearby coordinates.
  - `Test 5`: Department queue retrieval.
  - `Test 6`: Status updates via `PATCH`.
  - `Test 7`: Department reassignment via `POST /reassign`.

### 2. Development Scripts
- **`run_backend.py`**: Clean, one-line Python script that launches the FastAPI backend on port 8000.
- **`data/generated/generate_dataset.py`**: Synthetic dataset generation script producing 250 samples with realistic Indian city localities and 80/20 train/test splits.

---

*CivicFlow — Engineering Intelligent Governance.*
