from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.utils.auth import get_current_admin_user, get_current_user

router = APIRouter(prefix="/api/students", tags=["students"])


@router.get("/", response_model=list[UserResponse], dependencies=[Depends(get_current_admin_user)])
def list_students(db: Session = Depends(get_db)):
    students = db.query(User).filter(User.role == "student").all()
    return students


@router.get("/{student_id}", response_model=UserResponse)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "admin" and current_user["user_id"] != student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student mismatch")
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student
