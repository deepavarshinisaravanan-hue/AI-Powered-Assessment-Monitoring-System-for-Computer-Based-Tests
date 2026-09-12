from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.violation import Violation
from app.schemas.violation import ViolationCreate


def create_violation(db: Session, payload: ViolationCreate):
    """Create a new violation record."""
    violation = Violation(
        student_id=payload.student_id,
        exam_id=payload.exam_id,
        violation_type=payload.violation_type,
        severity=payload.severity,
        description=payload.description,
        timestamp=payload.timestamp,
    )
    db.add(violation)
    db.commit()
    db.refresh(violation)
    return violation


def get_violations_for_exam(db: Session, exam_id: int):
    """Get all violations for a specific exam."""
    violations = db.query(Violation).filter(Violation.exam_id == exam_id).all()
    return violations


def get_violations_for_student_exam(db: Session, student_id: int, exam_id: int):
    """Get all violations for a student in a specific exam."""
    violations = db.query(Violation).filter(
        Violation.student_id == student_id,
        Violation.exam_id == exam_id
    ).all()
    return violations


def get_violations_for_student(db: Session, student_id: int):
    """Get all violations for a student across all exams."""
    violations = db.query(Violation).filter(Violation.student_id == student_id).all()
    return violations
