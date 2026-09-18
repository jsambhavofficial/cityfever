"""Complaint Routes for CivicFlow (Member 2 ownership)."""
import random
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Complaint
from backend.schemas import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintUpdate,
    ComplaintReassign,
    DuplicateClusterDetail,
    ImageAnalysisRequest,
    ImageAnalysisResponse,
)
from backend.services.classifier import classify_complaint
from backend.services.entities import extract_entities
from backend.services.priority import calculate_priority
from backend.services.duplicates import find_similar_complaints
from backend.services.gemini_vision import analyze_civic_image

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

def generate_complaint_id(db: Session) -> str:
    """Generate next canonical complaint ID (e.g., C1016)."""
    count = db.query(Complaint).count()
    next_id = 1000 + count + 1
    # Ensure uniqueness
    while db.query(Complaint).filter(Complaint.id == f"C{next_id}").first():
        next_id += 1
    return f"C{next_id}"

@router.post("/analyze-image", response_model=ImageAnalysisResponse)
def analyze_incident_image(payload: ImageAnalysisRequest):
    """
    Multimodal Vision Ingestion Endpoint:
    Inspects photo via Gemini 3.6 Flash, extracts problem title, description,
    department, issue type, severity, and visual hazards.
    """
    return analyze_civic_image(payload.image, payload.hint)

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def submit_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    """
    Core Pipeline Submission Endpoint:
    1. If photo is provided with minimal/no text, Gemini Vision auto-generates description & classification.
    2. Preprocess & ML classification (Department, Issue Type, Confidences)
    3. Entity Extraction (Locality, Duration)
    4. Explainable Priority Scoring (100-point transparent rules)
    5. Duplicate Detection (TF-IDF cosine + Haversine distance)
    6. Save & return canonical schema.
    """
    text = (payload.complaint_text or "").strip()

    # If citizen uploaded only a photo without text, use Gemini Vision!
    if (not text or len(text) < 4) and payload.photo_url:
        vision_res = analyze_civic_image(payload.photo_url, payload.locality)
        text = f"{vision_res.get('title', 'Reported Incident')}. {vision_res.get('description', '')}"
        department = vision_res.get("department", "Roads")
        dept_confidence = 0.95
        issue_type = vision_res.get("issue_type", "Civic Incident")
        issue_confidence = 0.92
        locality = payload.locality or vision_res.get("landmark_hints") or "Delhi NCR"
        duration_text = "Visual verification"
        priority_score = vision_res.get("priority_score", 75)
        priority_level = vision_res.get("severity", "High")
        priority_reasons = vision_res.get("priority_reasons", ["Visual hazard identified via Gemini Multimodal Vision"])
    elif not text:
        raise HTTPException(status_code=400, detail="Please provide a grievance description or attach a photo.")
    else:
        # Standard NLP Prediction Pipeline
        ml_result = classify_complaint(text)
        department = ml_result["department"]
        dept_confidence = ml_result["department_confidence"]
        issue_type = ml_result["issue_type"]
        issue_confidence = ml_result["issue_confidence"]

        # Entity Extraction
        entity_result = extract_entities(text, hint=payload.locality)
        locality = entity_result.get("locality") or payload.locality
        duration_text = entity_result.get("duration_text")

        # Priority Scoring
        priority_result = calculate_priority(
            text=text,
            issue_type=issue_type,
            duration_text=duration_text,
            locality=locality
        )
        priority_score = priority_result["priority_score"]
        priority_level = priority_result["priority_level"]
        priority_reasons = priority_result["priority_reasons"]

    # 4. Duplicate Detection
    existing_db_complaints = db.query(Complaint).all()
    existing_list = [
        {
            "id": c.id,
            "complaint_text": c.complaint_text,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "duplicate_cluster_id": c.duplicate_cluster_id
        }
        for c in existing_db_complaints
    ]

    dup_result = find_similar_complaints(
        complaint_text=text,
        latitude=payload.latitude,
        longitude=payload.longitude,
        existing_complaints=existing_list
    )
    duplicate_cluster_id = dup_result["duplicate_cluster_id"]
    matched_complaint_ids = dup_result["matched_complaint_ids"]

    # 5. Confidence Rule Check
    # If department confidence is below 0.60, mark as "Manual Review"
    if dept_confidence < 0.60:
        complaint_status = "Manual Review"
    else:
        complaint_status = "Pending"

    # Generate unique canonical ID
    new_id = generate_complaint_id(db)

    # 6. Save to Database
    new_complaint = Complaint(
        id=new_id,
        complaint_text=text,
        department=department,
        issue_type=issue_type,
        department_confidence=dept_confidence,
        issue_confidence=issue_confidence,
        priority_score=priority_score,
        priority_level=priority_level,
        priority_reasons=priority_reasons,
        locality=locality,
        duration_text=duration_text,
        latitude=payload.latitude,
        longitude=payload.longitude,
        duplicate_cluster_id=duplicate_cluster_id,
        matched_complaint_ids=matched_complaint_ids,
        status=complaint_status,
        created_at=datetime.datetime.utcnow()
    )

    db.add(new_complaint)

    # If this complaint joined an existing cluster, update the matched list of other cluster members
    if duplicate_cluster_id and matched_complaint_ids:
        for m_id in matched_complaint_ids:
            other = db.query(Complaint).filter(Complaint.id == m_id).first()
            if other:
                other.duplicate_cluster_id = duplicate_cluster_id
                other_matched = list(set((other.matched_complaint_ids or []) + [new_id]))
                other.matched_complaint_ids = other_matched

    db.commit()
    db.refresh(new_complaint)

    return new_complaint

@router.get("", response_model=List[ComplaintResponse])
def get_complaints(
    department: Optional[str] = Query(None, description="Filter by department"),
    priority_level: Optional[str] = Query(None, description="Filter by priority: High, Medium, Low"),
    status: Optional[str] = Query(None, description="Filter by status: Pending, Manual Review, In Progress, Resolved"),
    duplicate_cluster_id: Optional[str] = Query(None, description="Filter by duplicate cluster ID"),
    search: Optional[str] = Query(None, description="Text search in complaint or locality"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieve filtered complaints list ordered by priority score and creation date."""
    query = db.query(Complaint)

    if department and department.lower() != "all":
        query = query.filter(Complaint.department == department)
    if priority_level and priority_level.lower() != "all":
        query = query.filter(Complaint.priority_level == priority_level)
    if status and status.lower() != "all":
        query = query.filter(Complaint.status == status)
    if duplicate_cluster_id:
        query = query.filter(Complaint.duplicate_cluster_id == duplicate_cluster_id)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Complaint.complaint_text.ilike(search_fmt)) |
            (Complaint.locality.ilike(search_fmt)) |
            (Complaint.id.ilike(search_fmt))
        )

    # Order by priority score descending, then created_at descending
    results = query.order_by(Complaint.priority_score.desc(), Complaint.created_at.desc()).offset(offset).limit(limit).all()
    return results

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint_by_id(complaint_id: str, db: Session = Depends(get_db)):
    """Retrieve single complaint details by ID."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint '{complaint_id}' not found.")
    return complaint

@router.patch("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(complaint_id: str, payload: ComplaintUpdate, db: Session = Depends(get_db)):
    """Update complaint status or assigned officer."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint '{complaint_id}' not found.")

    if payload.status is not None:
        complaint.status = payload.status
    if payload.assigned_to is not None:
        complaint.assigned_to = payload.assigned_to

    complaint.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(complaint)
    return complaint

@router.post("/{complaint_id}/reassign", response_model=ComplaintResponse)
def reassign_complaint(complaint_id: str, payload: ComplaintReassign, db: Session = Depends(get_db)):
    """Reassign complaint to a different department with officer assignment."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint '{complaint_id}' not found.")

    complaint.department = payload.department
    if payload.assigned_to:
        complaint.assigned_to = payload.assigned_to
    
    # If reassigned out of Manual Review, mark as Pending or In Progress
    if complaint.status == "Manual Review":
        complaint.status = "Pending"

    if payload.reason:
        reasons = complaint.priority_reasons or []
        reasons.append(f"Reassigned to {payload.department}: {payload.reason}")
        complaint.priority_reasons = reasons

    complaint.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(complaint)
    return complaint

@router.get("/{complaint_id}/similar", response_model=DuplicateClusterDetail)
def get_similar_complaints(complaint_id: str, db: Session = Depends(get_db)):
    """Get all complaints that belong to the same duplicate cluster or have similarity matches."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint '{complaint_id}' not found.")

    cluster_id = complaint.duplicate_cluster_id or f"SINGLE-{complaint_id}"
    
    if complaint.duplicate_cluster_id:
        cluster_members = db.query(Complaint).filter(
            Complaint.duplicate_cluster_id == complaint.duplicate_cluster_id
        ).all()
    elif complaint.matched_complaint_ids:
        ids_to_fetch = [complaint.id] + list(complaint.matched_complaint_ids)
        cluster_members = db.query(Complaint).filter(Complaint.id.in_(ids_to_fetch)).all()
    else:
        cluster_members = [complaint]

    return {
        "duplicate_cluster_id": cluster_id,
        "complaint_count": len(cluster_members),
        "primary_issue": complaint.issue_type,
        "department": complaint.department,
        "locality": complaint.locality,
        "complaints": cluster_members
    }
