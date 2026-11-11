from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.monitoring import MonitoringCreate, MonitoringResponse
from app.services.monitoring_service import (
    create_session,
    get_all_sessions,
    update_session_status,
)
from app.models.monitoring import MonitoringSession
from app.utils.auth import get_current_admin_user, get_current_user

router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])


@router.get("/", response_model=list[MonitoringResponse], dependencies=[Depends(get_current_admin_user)])
def list_sessions(db: Session = Depends(get_db)):
    return get_all_sessions(db)


@router.get("/live", dependencies=[Depends(get_current_admin_user)])
def list_live_sessions(db: Session = Depends(get_db)):
    return get_all_sessions(db)


@router.post("/", response_model=MonitoringResponse, status_code=status.HTTP_201_CREATED)
def add_session(
    payload: MonitoringCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "student" or current_user["user_id"] != payload.student_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student mismatch")
    return create_session(db, payload)


@router.patch("/{session_id}", response_model=MonitoringResponse)
def patch_session_status(
    session_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    session = db.query(MonitoringSession).filter(MonitoringSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitoring session not found")
    if current_user.get("role") != "admin" and session.student_id != current_user["user_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Session owner mismatch")
    return update_session_status(db, session_id, status)


# ---------------- WebRTC Signaling ----------------

rooms = {}


@router.websocket("/ws/{session_id}/{role}")
async def websocket_signaling(
    websocket: WebSocket,
    session_id: int,
    role: str,
):
    await websocket.accept()

    if session_id not in rooms:
        rooms[session_id] = {}

    rooms[session_id][role] = websocket

    try:
        other_role = "faculty" if role == "student" else "student"
        other_peer = rooms[session_id].get(other_role)
        if other_peer:
            await other_peer.send_json({"type": "ready"})

        while True:
            message = await websocket.receive_json()

            target_role = "faculty" if role == "student" else "student"

            target = rooms[session_id].get(target_role)

            if target:
                await target.send_json(message)

    except WebSocketDisconnect:
        if session_id in rooms:
            rooms[session_id].pop(role, None)

            if not rooms[session_id]:
                rooms.pop(session_id, None)
