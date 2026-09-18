"""Department Queue Routes for CivicFlow (Member 2 ownership)."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

<<<<<<< HEAD
from backend.database import get_db
from backend.models import Complaint
from backend.schemas import ComplaintResponse
=======
from database import get_db
from models import Complaint
from schemas import QueueOut
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d

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

<<<<<<< HEAD
    if status and status.lower() != "all":
        query = query.filter(Complaint.status == status)

    if priority_level and priority_level.lower() != "all":
        query = query.filter(Complaint.priority_level == priority_level)

    # Sort high priority first, then newest
    complaints = query.order_by(Complaint.priority_score.desc(), Complaint.created_at.desc()).limit(limit).all()
    return complaints
=======
@router.get("/{department}", response_model=QueueOut)
def get_department_queue(department: str, db: Session = Depends(get_db)):
    """Complaints for one department's officer view, highest priority first.
    Per contract: only non-resolved complaints are included."""
    items = (
        db.query(Complaint)
        .filter(Complaint.department == department, Complaint.status != "Resolved")
        .order_by(Complaint.priority_score.desc().nullslast(), Complaint.created_at.desc())
        .all()
    )
    return QueueOut(
        department=department,
        pending_count=len(items),
        high_priority_count=sum(1 for c in items if c.priority_level == "High"),
        items=items,
    )
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d
