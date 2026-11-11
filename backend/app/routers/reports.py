from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.report import ReportCreate, ReportResponse
from app.services.report_service import create_report, get_all_reports, get_student_report
from app.utils.auth import get_current_admin_user, get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/", response_model=list[ReportResponse], dependencies=[Depends(get_current_admin_user)])
def list_reports(db: Session = Depends(get_db)):
    return get_all_reports(db)


@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin_user)])
def add_report(payload: ReportCreate, db: Session = Depends(get_db)):
    return create_report(db, payload)


@router.get("/student/{student_id}", response_model=list[ReportResponse])
def student_report(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "admin" and current_user["user_id"] != student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student mismatch")
    return get_student_report(db, student_id)
