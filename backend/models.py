"""SQLAlchemy ORM Models for CivicFlow."""
import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, JSON
from backend.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(50), primary_key=True, index=True)
    complaint_text = Column(Text, nullable=False)
    department = Column(String(100), nullable=False, index=True)
    issue_type = Column(String(100), nullable=False)
    department_confidence = Column(Float, nullable=False, default=0.50)
    issue_confidence = Column(Float, nullable=False, default=0.50)
    priority_score = Column(Integer, nullable=False, default=50)
    priority_level = Column(String(20), nullable=False, default="Medium", index=True)
    priority_reasons = Column(JSON, nullable=True, default=list)
    locality = Column(String(200), nullable=True, index=True)
    duration_text = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    duplicate_cluster_id = Column(String(50), nullable=True, index=True)
    matched_complaint_ids = Column(JSON, nullable=True, default=list)
    status = Column(String(50), nullable=False, default="Pending", index=True)
    assigned_to = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)
