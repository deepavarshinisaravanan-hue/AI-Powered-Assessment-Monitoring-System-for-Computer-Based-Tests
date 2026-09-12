from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exam_id = Column(Integer, nullable=False)
    question_id = Column(Integer, nullable=False)
    selected_option = Column(String(10), nullable=False)
    is_correct = Column(Integer, default=0)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
