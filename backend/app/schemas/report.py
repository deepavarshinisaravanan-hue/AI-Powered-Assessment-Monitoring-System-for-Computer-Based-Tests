from datetime import datetime

from pydantic import BaseModel


class ReportCreate(BaseModel):
    student_id: int
    exam_id: int
    score: float = 0.0
    percentage: float = 0.0
    status: str = "pending"


class ReportResponse(BaseModel):
    id: int
    student_id: int
    exam_id: int
    score: float
    percentage: float
    status: str
    generated_at: datetime

    class Config:
        from_attributes = True
