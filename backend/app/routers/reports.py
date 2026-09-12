from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.report import ReportCreate, ReportResponse
from app.services.report_service import create_report, get_all_reports, get_student_report

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/", response_model=list[ReportResponse])
def list_reports(db: Session = Depends(get_db)):
    return get_all_reports(db)


@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def add_report(payload: ReportCreate, db: Session = Depends(get_db)):
    return create_report(db, payload)


@router.get("/student/{student_id}", response_model=list[ReportResponse])
def student_report(student_id: int, db: Session = Depends(get_db)):
    return get_student_report(db, student_id)
