"""Pydantic Request and Response Schemas for CivicFlow API."""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ImageAnalysisRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded image or HTTP URL")
    hint: Optional[str] = Field(None, description="Optional citizen context or hint")

class ImageAnalysisResponse(BaseModel):
    title: str
    description: str
    department: str
    issue_type: str
    severity: str
    priority_score: int
    priority_reasons: List[str]
    visual_hazards: Optional[List[str]] = []
    landmark_hints: Optional[str] = None
    ai_engine: Optional[str] = None

class ComplaintCreate(BaseModel):
    complaint_text: Optional[str] = Field(None, description="Citizen grievance or incident description")
    locality: Optional[str] = Field(None, description="Optional manual locality hint")
    latitude: Optional[float] = Field(None, description="GPS Latitude coordinate")
    longitude: Optional[float] = Field(None, description="GPS Longitude coordinate")
    photo_url: Optional[str] = Field(None, description="Optional photo URL or base64 evidence")

class ComplaintUpdate(BaseModel):
    status: Optional[str] = Field(None, description="Status: Pending, In Progress, Resolved, Rejected, Manual Review")
    assigned_to: Optional[str] = Field(None, description="Officer or team member name/id")

class ComplaintReassign(BaseModel):
    department: str = Field(..., description="Target department to reassign complaint")
    reason: Optional[str] = Field(None, description="Reason for manual reassignment")
    assigned_to: Optional[str] = Field(None, description="Optional officer assignment")

class ComplaintResponse(BaseModel):
    id: str
    complaint_text: str
    department: str
    issue_type: str
    department_confidence: float
    issue_confidence: float
    priority_score: int
    priority_level: str
    priority_reasons: Optional[List[str]] = []
    locality: Optional[str] = None
    duration_text: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    duplicate_cluster_id: Optional[str] = None
    matched_complaint_ids: Optional[List[str]] = []
    status: str
    assigned_to: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_complaints: int
    high_priority_count: int
    medium_priority_count: int
    low_priority_count: int
    manual_review_count: int
    pending_count: int
    in_progress_count: int
    resolved_count: int
    duplicate_clusters_count: int
    department_breakdown: dict
    priority_breakdown: dict
    top_localities: dict

class DuplicateClusterDetail(BaseModel):
    duplicate_cluster_id: str
    complaint_count: int
    primary_issue: str
    department: str
    locality: Optional[str] = None
    complaints: List[ComplaintResponse]
