from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.database import Base, engine, get_db, check_db_connection

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "message": "Assessment Monitoring System Backend Running",
        "database": settings.DB_NAME
    }


@app.get("/api/db-check")
def db_check():
    """Health check endpoint to test PostgreSQL connection."""
    return check_db_connection()
