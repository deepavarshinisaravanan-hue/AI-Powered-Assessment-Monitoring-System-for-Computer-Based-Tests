from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.exam import Exam
from app.models.exam_assignment import ExamAssignment
from app.models.question import Question
from app.models.user import User
from app.schemas.exam import ExamCreate, ExamResponse, ExamUpdate
from app.services.exam_service import delete_exam, get_all_exams, update_exam
from app.utils.auth import get_current_admin_user

router = APIRouter(prefix="/api/exams", tags=["exams"])


@router.get("/", response_model=list[ExamResponse], dependencies=[Depends(get_current_admin_user)])
def list_exams(db: Session = Depends(get_db)):
    return get_all_exams(db)


@router.post("/", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
def add_exam(
    payload: ExamCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin_user),
):
    student_ids = set(payload.student_ids)
    students = db.query(User).filter(User.id.in_(student_ids), User.role == "student", User.is_active.is_(True)).all()
    if len(students) != len(student_ids):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more assigned students are invalid.")

    exam = Exam(
        title=payload.title.strip(), description=payload.description, duration_minutes=payload.duration_minutes,
        status="published",
    )
    db.add(exam)
    db.flush()
    for item in payload.questions:
        db.add(Question(exam_id=exam.id, **item.model_dump()))
    for student_id in student_ids:
        db.add(ExamAssignment(exam_id=exam.id, student_id=student_id))
    db.commit()
    db.refresh(exam)
    return exam


@router.put("/{exam_id}", response_model=ExamResponse, dependencies=[Depends(get_current_admin_user)])
def edit_exam(exam_id: int, payload: ExamUpdate, db: Session = Depends(get_db)):
    return update_exam(db, exam_id, payload)


@router.delete("/{exam_id}", dependencies=[Depends(get_current_admin_user)])
def remove_exam(exam_id: int, db: Session = Depends(get_db)):
    return delete_exam(db, exam_id)
