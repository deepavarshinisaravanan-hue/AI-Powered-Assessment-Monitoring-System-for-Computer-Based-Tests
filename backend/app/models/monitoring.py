from sqlalchemy import Column, Index, Integer, String, DateTime, ForeignKey, JSON, text
from sqlalchemy.sql import func

from app.database import Base


class MonitoringSession(Base):
    __tablename__ = "monitoring_sessions"
    __table_args__ = (
        Index(
            "uq_monitoring_active_student_exam",
            "student_id",
            "exam_id",
            unique=True,
            sqlite_where=text("status = 'active'"),
            postgresql_where=text("status = 'active'"),
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exam_id = Column(Integer, nullable=False)
    status = Column(String(30), default="active")
    screen_activity = Column(JSON, nullable=True)
    webcam_status = Column(String(30), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
