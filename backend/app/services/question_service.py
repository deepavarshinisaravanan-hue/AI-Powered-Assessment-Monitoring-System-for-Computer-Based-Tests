from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate


def get_all_questions(db: Session):
    return db.query(Question).all()


def create_question(db: Session, payload: QuestionCreate):
    question = Question(**payload.model_dump())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


def update_question(db: Session, question_id: int, payload: QuestionUpdate):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(question, key, value)

    db.commit()
    db.refresh(question)
    return question


def delete_question(db: Session, question_id: int):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    db.delete(question)
    db.commit()
    return {"detail": "Question deleted successfully"}
