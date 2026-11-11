from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine, check_db_connection
# Import all models to ensure SQLAlchemy recognizes them for create_all()
from app.models.user import User
from app.models.exam import Exam
from app.models.exam_assignment import ExamAssignment
from app.models.question import Question
from app.models.answer import Answer
from app.models.monitoring import MonitoringSession
from app.models.violation import Violation
from app.models.report import Report
from app.routers.auth import router as auth_router
from app.routers.students import router as students_router
from app.routers.questions import router as questions_router
from app.routers.exams import router as exams_router
from app.routers.exam import router as exam_router
from app.routers.answers import router as answers_router
from app.routers.monitoring import router as monitoring_router
from app.routers.violations import router as violations_router
from app.routers.reports import router as reports_router
from app.routers.admin import router as admin_router
from app.services.seed_service import seed_demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    for index in MonitoringSession.__table__.indexes:
        index.create(bind=engine, checkfirst=True)
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
    yield


app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(students_router)
app.include_router(questions_router)
app.include_router(exams_router)
app.include_router(exam_router)
app.include_router(answers_router)
app.include_router(monitoring_router)
app.include_router(violations_router)
app.include_router(reports_router)
app.include_router(admin_router)


@app.get("/")
def read_root():
    return {
        "message": "Assessment Monitoring System Backend Running",
        "database": settings.DB_URL,
    }


@app.get("/api/db-check")
def db_check():
    """Health check endpoint to test database connectivity."""
    return check_db_connection()


@app.get("/api/demo-credentials")
def demo_credentials():
    return {
        "admin": {"email": "admin@example.com", "password": "admin123"},
        "student": {"email": "student@example.com", "password": "student123"},
    }
