"""Dashboard and Analytics Routes for CivicFlow (Member 2 ownership)."""
from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Complaint
from backend.schemas import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Returns high-level statistics for the officer operations dashboard and map analytics:
    - Total complaints
    - High/Medium/Low counts
    - Manual review cases count
    - Department breakdown
    - Duplicate clusters count
    - Top locality hotspots
    """
    all_complaints = db.query(Complaint).all()
    total = len(all_complaints)

<<<<<<< HEAD
    high_prio = sum(1 for c in all_complaints if c.priority_level == "High")
    med_prio = sum(1 for c in all_complaints if c.priority_level == "Medium")
    low_prio = sum(1 for c in all_complaints if c.priority_level == "Low")

    manual_review = sum(1 for c in all_complaints if c.status == "Manual Review")
    pending = sum(1 for c in all_complaints if c.status == "Pending")
    in_progress = sum(1 for c in all_complaints if c.status == "In Progress")
    resolved = sum(1 for c in all_complaints if c.status == "Resolved")

    # Duplicate clusters
    clusters = {c.duplicate_cluster_id for c in all_complaints if c.duplicate_cluster_id}
    duplicate_clusters_count = len(clusters)

    # Department breakdown
    dept_counts = dict(Counter(c.department for c in all_complaints))
    
    # Priority breakdown
    prio_counts = {
        "High": high_prio,
        "Medium": med_prio,
        "Low": low_prio
    }

    # Top localities
    locality_list = [c.locality for c in all_complaints if c.locality]
    top_localities = dict(Counter(locality_list).most_common(8))

    return {
        "total_complaints": total,
        "high_priority_count": high_prio,
        "medium_priority_count": med_prio,
        "low_priority_count": low_prio,
        "manual_review_count": manual_review,
        "pending_count": pending,
        "in_progress_count": in_progress,
        "resolved_count": resolved,
        "duplicate_clusters_count": duplicate_clusters_count,
        "department_breakdown": dept_counts,
        "priority_breakdown": prio_counts,
        "top_localities": top_localities
    }
=======
    status_counts = Counter(c.status for c in complaints if c.status)
    priority_distribution = Counter(c.priority_level for c in complaints if c.priority_level)
    department_breakdown = Counter(c.department for c in complaints if c.department)
    duplicate_clusters = {c.duplicate_cluster_id for c in complaints if c.duplicate_cluster_id}

    return DashboardStats(
        total_complaints=len(complaints),
        status_counts=dict(status_counts),
        priority_distribution=dict(priority_distribution),
        department_breakdown=dict(department_breakdown),
        duplicate_clusters_count=len(duplicate_clusters),
    )
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d
