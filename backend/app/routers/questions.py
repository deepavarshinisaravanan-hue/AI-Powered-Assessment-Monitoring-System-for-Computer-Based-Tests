from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.question import QuestionCreate, QuestionResponse, QuestionUpdate
from app.services.question_service import create_question, delete_question, get_all_questions, update_question

router = APIRouter(prefix="/api/questions", tags=["questions"])


@router.get("/", response_model=list[QuestionResponse])
def list_questions(db: Session = Depends(get_db)):
    return get_all_questions(db)


@router.post("/", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def add_question(payload: QuestionCreate, db: Session = Depends(get_db)):
    return create_question(db, payload)


@router.put("/{question_id}", response_model=QuestionResponse)
def edit_question(question_id: int, payload: QuestionUpdate, db: Session = Depends(get_db)):
    return update_question(db, question_id, payload)


@router.delete("/{question_id}")
def remove_question(question_id: int, db: Session = Depends(get_db)):
    return delete_question(db, question_id)
