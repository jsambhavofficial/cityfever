"""Main FastAPI Application Entrypoint for CivicFlow Backend."""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import Base, engine, SessionLocal, init_db
from backend.seed_data import seed_database
from backend.routes.complaints import router as complaints_router
from backend.routes.queues import router as queues_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.legacy_compat import router as legacy_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("civicflow")

def setup_app_db():
    """Initializes DB schema and seed records."""
    init_db()
    db = SessionLocal()
    try:
        seed_database(db, force=False)
    finally:
        db.close()

# Ensure DB is created on module load
setup_app_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for database initialization and seeding on startup."""
    logger.info("Initializing CivicFlow Database...")
    setup_app_db()
    logger.info("CivicFlow Backend Ready.")
    yield
    logger.info("CivicFlow Backend Shutting Down...")

app = FastAPI(
    title="CityFever API",
    description="Central Backend & Integration API for CityFever Civic Incident Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(complaints_router)
app.include_router(queues_router)
app.include_router(dashboard_router)
app.include_router(legacy_router)

@app.get("/")
def root():
    return {
        "app": "CityFever Backend API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health": "healthy"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
