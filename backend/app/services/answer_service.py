from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.answer import Answer
from app.models.question import Question
from app.schemas.answer import AnswerCreate


def submit_answer(db: Session, payload: AnswerCreate):
    question = db.query(Question).filter(
        Question.id == payload.question_id,
        Question.exam_id == payload.exam_id,
    ).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    is_correct = int(question.correct_option == payload.selected_option)
    answer = Answer(
        student_id=payload.student_id,
        exam_id=payload.exam_id,
        question_id=payload.question_id,
        selected_option=payload.selected_option,
        is_correct=is_correct,
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer


def get_answers_for_student(db: Session, student_id: int):
    answers = db.query(Answer).filter(Answer.student_id == student_id).all()
    if not answers:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No answers found")
    return answers
