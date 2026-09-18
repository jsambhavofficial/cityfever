"""Department Queue Routes for CivicFlow (Member 2 ownership)."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Complaint
from backend.schemas import ComplaintResponse

router = APIRouter(prefix="/api/queues", tags=["Queues"])

@router.get("/{department}", response_model=List[ComplaintResponse])
def get_department_queue(
    department: str,
    status: Optional[str] = Query(None, description="Filter by status (e.g. Pending, In Progress)"),
    priority_level: Optional[str] = Query(None, description="Filter by priority: High, Medium, Low"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Officer Department Queue:
    Retrieves incoming complaints for a specific department, ordered by priority score descending.
    """
    query = db.query(Complaint)
    
    if department.lower() != "all":
        query = query.filter(Complaint.department.ilike(department))

    if status and status.lower() != "all":
        query = query.filter(Complaint.status == status)

    if priority_level and priority_level.lower() != "all":
        query = query.filter(Complaint.priority_level == priority_level)

    # Sort high priority first, then newest
    complaints = query.order_by(Complaint.priority_score.desc(), Complaint.created_at.desc()).limit(limit).all()
    return complaints
