from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.monitoring import MonitoringSession
from app.schemas.monitoring import MonitoringCreate


def get_all_sessions(db: Session):
    return db.query(MonitoringSession).all()


def create_session(db: Session, payload: MonitoringCreate):
    session = MonitoringSession(**payload.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def update_session_status(db: Session, session_id: int, status: str):
    session = db.query(MonitoringSession).filter(MonitoringSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitoring session not found")

    session.status = status
    db.commit()
    db.refresh(session)
    return session
