from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.question import QuestionCreate, QuestionResponse, QuestionUpdate
from app.services.question_service import create_question, delete_question, get_all_questions, update_question
from app.utils.auth import get_current_admin_user

router = APIRouter(prefix="/api/questions", tags=["questions"])


@router.get("/", response_model=list[QuestionResponse], dependencies=[Depends(get_current_admin_user)])
def list_questions(db: Session = Depends(get_db)):
    return get_all_questions(db)


@router.post(
    "/",
    response_model=QuestionResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_admin_user)],
)
def add_question(payload: QuestionCreate, db: Session = Depends(get_db)):
    return create_question(db, payload)


@router.put(
    "/{question_id}",
    response_model=QuestionResponse,
    dependencies=[Depends(get_current_admin_user)],
)
def edit_question(question_id: int, payload: QuestionUpdate, db: Session = Depends(get_db)):
    return update_question(db, question_id, payload)


@router.delete("/{question_id}", dependencies=[Depends(get_current_admin_user)])
def remove_question(question_id: int, db: Session = Depends(get_db)):
    return delete_question(db, question_id)
