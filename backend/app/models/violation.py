from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Violation(Base):
    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exam_id = Column(Integer, nullable=False)
    violation_type = Column(String(50), nullable=False)  # e.g., "tab", "fullscreen", "copy", "paste", "rightclick", "phone", "multiface", "noface"
    severity = Column(String(20), nullable=False, default="medium")  # "high", "medium", "low"
    description = Column(String(255), nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
