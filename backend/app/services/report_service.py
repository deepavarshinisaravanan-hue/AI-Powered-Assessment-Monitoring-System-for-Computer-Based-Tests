from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.report import Report
from app.schemas.report import ReportCreate


def get_all_reports(db: Session):
    return db.query(Report).all()


def create_report(db: Session, payload: ReportCreate):
    report = Report(**payload.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_student_report(db: Session, student_id: int):
    return db.query(Report).filter(Report.student_id == student_id).all()
