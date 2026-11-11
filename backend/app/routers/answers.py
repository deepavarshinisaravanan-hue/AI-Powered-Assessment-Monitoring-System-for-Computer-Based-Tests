from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.answer import AnswerCreate, AnswerResponse
from app.services.answer_service import get_answers_for_student, submit_answer
from app.utils.auth import get_current_admin_user, get_current_user

router = APIRouter(prefix="/api/answers", tags=["answers"])


@router.post("/submit", response_model=AnswerResponse, status_code=status.HTTP_201_CREATED)
def submit(payload: AnswerCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "student" or current_user["user_id"] != payload.student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student mismatch")
    return submit_answer(db, payload)


@router.get("/student/{student_id}", response_model=list[AnswerResponse])
def answers_for_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "admin" and current_user["user_id"] != student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student mismatch")
    return get_answers_for_student(db, student_id)
