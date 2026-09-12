from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.monitoring import MonitoringSession
from app.models.report import Report
from app.models.user import User
from app.services.auth_service import get_user_by_id
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    admin = get_user_by_id(db, current_user["user_id"])
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == "student").count()
    total_admins = db.query(User).filter(User.role == "admin").count()
    active_sessions = db.query(MonitoringSession).filter(MonitoringSession.status == "active").count()
    pending_reports = db.query(Report).filter(Report.status == "pending").count()

    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_admins": total_admins,
        "active_monitoring_sessions": active_sessions,
        "pending_reports": pending_reports,
    }
