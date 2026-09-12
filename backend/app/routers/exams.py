from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.exam import ExamCreate, ExamResponse, ExamUpdate
from app.services.exam_service import create_exam, delete_exam, get_all_exams, update_exam

router = APIRouter(prefix="/api/exams", tags=["exams"])


@router.get("/", response_model=list[ExamResponse])
def list_exams(db: Session = Depends(get_db)):
    return get_all_exams(db)


@router.post("/", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
def add_exam(payload: ExamCreate, db: Session = Depends(get_db)):
    return create_exam(db, payload)


@router.put("/{exam_id}", response_model=ExamResponse)
def edit_exam(exam_id: int, payload: ExamUpdate, db: Session = Depends(get_db)):
    return update_exam(db, exam_id, payload)


@router.delete("/{exam_id}")
def remove_exam(exam_id: int, db: Session = Depends(get_db)):
    return delete_exam(db, exam_id)
