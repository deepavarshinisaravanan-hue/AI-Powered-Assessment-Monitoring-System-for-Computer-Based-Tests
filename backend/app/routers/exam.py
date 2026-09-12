from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.answer import Answer
from app.models.exam import Exam
from app.models.question import Question
from app.models.report import Report
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/exam", tags=["exam"])


class AnswerItem(BaseModel):
    question_id: int
    selected_option: str


class SubmitExamPayload(BaseModel):
    exam_id: int
    student_id: int
    answers: list[AnswerItem]


@router.get("/current")
def get_current_exam(db: Session = Depends(get_db)):
    exam = db.query(Exam).order_by(Exam.id.desc()).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No exam available")

    questions = db.query(Question).filter(Question.exam_id == exam.id).all()
    return {
        "exam": {
            "id": exam.id,
            "title": exam.title,
            "description": exam.description,
            "duration_minutes": exam.duration_minutes,
            "status": exam.status,
        },
        "questions": [
            {
                "id": q.id,
                "exam_id": q.exam_id,
                "question_text": q.question_text,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
                "correct_option": q.correct_option,
                "difficulty": q.difficulty,
            }
            for q in questions
        ],
    }


@router.post("/submit")
def submit_exam(
    payload: SubmitExamPayload,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user["user_id"] != payload.student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student mismatch")

    total_questions = db.query(Question).filter(Question.exam_id == payload.exam_id).count()
    if total_questions == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam has no questions")

    score = 0
    for item in payload.answers:
        question = db.query(Question).filter(Question.id == item.question_id).first()
        if not question:
            continue
        is_correct = int(question.correct_option == item.selected_option)
        score += is_correct

        answer = Answer(
            student_id=payload.student_id,
            exam_id=payload.exam_id,
            question_id=item.question_id,
            selected_option=item.selected_option,
            is_correct=is_correct,
        )
        db.add(answer)

    percentage = round((score / total_questions) * 100, 2) if total_questions else 0
    report = Report(
        student_id=payload.student_id,
        exam_id=payload.exam_id,
        score=float(score),
        percentage=float(percentage),
        status="completed",
    )
    db.add(report)
    db.commit()

    return {
        "success": True,
        "score": score,
        "total_questions": total_questions,
        "percentage": percentage,
        "report_id": report.id,
    }
