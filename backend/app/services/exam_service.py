from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.exam import Exam
from app.schemas.exam import ExamCreate, ExamUpdate


def get_all_exams(db: Session):
    return db.query(Exam).all()


def create_exam(db: Session, payload: ExamCreate):
    exam = Exam(**payload.model_dump())
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return exam


def update_exam(db: Session, exam_id: int, payload: ExamUpdate):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(exam, key, value)

    db.commit()
    db.refresh(exam)
    return exam


def delete_exam(db: Session, exam_id: int):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    db.delete(exam)
    db.commit()
    return {"detail": "Exam deleted successfully"}
