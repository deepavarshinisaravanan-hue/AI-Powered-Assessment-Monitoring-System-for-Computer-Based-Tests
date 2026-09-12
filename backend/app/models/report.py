from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    exam_id = Column(Integer, nullable=False)
    score = Column(Float, default=0.0)
    percentage = Column(Float, default=0.0)
    status = Column(String(30), default="pending")
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
