from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.answer import AnswerCreate, AnswerResponse
from app.services.answer_service import get_answers_for_student, submit_answer

router = APIRouter(prefix="/api/answers", tags=["answers"])


@router.post("/submit", response_model=AnswerResponse, status_code=status.HTTP_201_CREATED)
def submit(payload: AnswerCreate, db: Session = Depends(get_db)):
    return submit_answer(db, payload)


@router.get("/student/{student_id}", response_model=list[AnswerResponse])
def answers_for_student(student_id: int, db: Session = Depends(get_db)):
    return get_answers_for_student(db, student_id)
