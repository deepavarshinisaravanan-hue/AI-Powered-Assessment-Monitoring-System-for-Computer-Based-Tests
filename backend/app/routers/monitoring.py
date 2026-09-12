from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.monitoring import MonitoringCreate, MonitoringResponse
from app.services.monitoring_service import create_session, get_all_sessions, update_session_status
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])


@router.get("/", response_model=list[MonitoringResponse])
def list_sessions(db: Session = Depends(get_db)):
    return get_all_sessions(db)


@router.get("/live")
def list_live_sessions(db: Session = Depends(get_db)):
    return get_all_sessions(db)


@router.post("/", response_model=MonitoringResponse, status_code=status.HTTP_201_CREATED)
def add_session(payload: MonitoringCreate, db: Session = Depends(get_db)):
    return create_session(db, payload)


@router.patch("/{session_id}", response_model=MonitoringResponse)
def patch_session_status(
    session_id: int,
    status: str,
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    return update_session_status(db, session_id, status)
