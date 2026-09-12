from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/api/students", tags=["students"])


@router.get("/", response_model=list[UserResponse])
def list_students(db: Session = Depends(get_db)):
    students = db.query(User).filter(User.role == "student").all()
    return students


@router.get("/{student_id}", response_model=UserResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student
