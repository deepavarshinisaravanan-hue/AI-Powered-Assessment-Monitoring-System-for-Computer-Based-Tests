from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.answer import Answer
from app.models.exam import Exam
from app.models.exam_assignment import ExamAssignment
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


@router.get("/available")
def get_available_exams(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student access required")
    exams = (
        db.query(Exam)
        .join(ExamAssignment, ExamAssignment.exam_id == Exam.id)
        .filter(Exam.status == "published", ExamAssignment.student_id == current_user["user_id"])
        .order_by(Exam.id.desc())
        .all()
    )
    completed_ids = {
        row[0] for row in db.query(Report.exam_id).filter(
            Report.student_id == current_user["user_id"], Report.status == "completed"
        ).all()
    }
    available = [exam for exam in exams if exam.id not in completed_ids]
    return [{
        "id": exam.id,
        "title": exam.title,
        "description": exam.description,
        "duration_minutes": exam.duration_minutes,
        "question_count": db.query(Question).filter(Question.exam_id == exam.id).count(),
    } for exam in available]


@router.get("/current")
def get_current_exam(
    exam_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student access required")
    query = (
        db.query(Exam)
        .join(ExamAssignment, ExamAssignment.exam_id == Exam.id)
        .filter(Exam.status == "published", ExamAssignment.student_id == current_user["user_id"])
    )
    if exam_id is not None:
        query = query.filter(Exam.id == exam_id)
    exam = query.order_by(Exam.id.desc()).first()
    if not exam:
        return {"exam": None, "questions": []}

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
    if current_user.get("role") != "student" or current_user["user_id"] != payload.student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student mismatch")

    exam = db.query(Exam).join(ExamAssignment, ExamAssignment.exam_id == Exam.id).filter(
        Exam.id == payload.exam_id,
        Exam.status == "published",
        ExamAssignment.student_id == payload.student_id,
    ).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Assessment is not assigned to this student")

    questions = db.query(Question).filter(Question.exam_id == payload.exam_id).all()
    total_questions = len(questions)
    if total_questions == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam has no questions")

    # A retry after a lost response (or an auto/manual submit race) should
    # return the completed result without writing duplicate answers or reports.
    existing_report = db.query(Report).filter(
        Report.student_id == payload.student_id,
        Report.exam_id == payload.exam_id,
        Report.status == "completed",
    ).order_by(Report.id.desc()).first()
    if existing_report:
        return {
            "success": True,
            "already_submitted": True,
            "score": existing_report.score,
            "total_questions": total_questions,
            "percentage": existing_report.percentage,
            "report_id": existing_report.id,
        }

    question_by_id = {question.id: question for question in questions}
    answer_map = {item.question_id: item.selected_option.upper() for item in payload.answers}
    if len(answer_map) != len(payload.answers) or any(
        question_id not in question_by_id or option not in {"A", "B", "C", "D"}
        for question_id, option in answer_map.items()
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Submitted answers are invalid")

    score = 0
    for question in questions:
        selected_option = answer_map.get(question.id)
        is_correct = int(selected_option == question.correct_option)
        score += is_correct
        if selected_option is not None:
            db.add(Answer(
                student_id=payload.student_id,
                exam_id=payload.exam_id,
                question_id=question.id,
                selected_option=selected_option,
                is_correct=is_correct,
            ))

    percentage = round((score / total_questions) * 100, 2) if total_questions else 0
    report = Report(
        student_id=payload.student_id,
        exam_id=payload.exam_id,
        score=float(score),
        percentage=float(percentage),
        status="completed",
    )
    db.add(report)
    try:
        db.commit()
        db.refresh(report)
    except Exception:
        db.rollback()
        raise

    return {
        "success": True,
        "score": score,
        "total_questions": total_questions,
        "percentage": percentage,
        "report_id": report.id,
    }
