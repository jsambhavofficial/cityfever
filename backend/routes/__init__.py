"""Routes package for CivicFlow API."""
from .complaints import router as complaints_router
from .queues import router as queues_router
from .dashboard import router as dashboard_router

__all__ = ["complaints_router", "queues_router", "dashboard_router"]
