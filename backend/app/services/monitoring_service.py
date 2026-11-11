from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.monitoring import MonitoringSession
from app.schemas.monitoring import MonitoringCreate


def get_all_sessions(db: Session):
    return db.query(MonitoringSession).filter(MonitoringSession.status == "active").all()


def create_session(db: Session, payload: MonitoringCreate):
    session = (
        db.query(MonitoringSession)
        .filter(
            MonitoringSession.student_id == payload.student_id,
            MonitoringSession.exam_id == payload.exam_id,
            MonitoringSession.status == "active",
        )
        .first()
    )
    if session:
        return session

    session = MonitoringSession(**payload.model_dump())
    db.add(session)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        session = (
            db.query(MonitoringSession)
            .filter(
                MonitoringSession.student_id == payload.student_id,
                MonitoringSession.exam_id == payload.exam_id,
                MonitoringSession.status == "active",
            )
            .first()
        )
        if session:
            return session
        raise
    db.refresh(session)
    return session


def update_session_status(db: Session, session_id: int, new_status: str):
    session = db.query(MonitoringSession).filter(MonitoringSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitoring session not found")

    session.status = new_status
    db.commit()
    db.refresh(session)
    return session
