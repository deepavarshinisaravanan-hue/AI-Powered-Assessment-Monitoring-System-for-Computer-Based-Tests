from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.violation import ViolationCreate, ViolationResponse
from app.services.violation_service import (
    create_violation,
    get_violations_for_exam,
    get_violations_for_student_exam,
)
from app.utils.auth import get_current_admin_user, get_current_user

router = APIRouter(prefix="/api/violations", tags=["violations"])


@router.post("/", response_model=ViolationResponse, status_code=status.HTTP_201_CREATED)
def report_violation(
    payload: ViolationCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create a new violation record during an exam."""
    if current_user.get("role") != "student" or current_user["user_id"] != payload.student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student mismatch")
    return create_violation(db, payload)


@router.get("/exam/{exam_id}", response_model=list[ViolationResponse], dependencies=[Depends(get_current_admin_user)])
def get_exam_violations(exam_id: int, db: Session = Depends(get_db)):
    """Get all violations for a specific exam."""
    return get_violations_for_exam(db, exam_id)


@router.get("/exam/{exam_id}/student/{student_id}", response_model=list[ViolationResponse], dependencies=[Depends(get_current_admin_user)])
def get_student_exam_violations(exam_id: int, student_id: int, db: Session = Depends(get_db)):
    """Get all violations for a specific student in a specific exam."""
    return get_violations_for_student_exam(db, student_id, exam_id)
