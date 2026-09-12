from pydantic import BaseModel
from datetime import datetime


class ViolationCreate(BaseModel):
    student_id: int
    exam_id: int
    violation_type: str
    severity: str = "medium"
    description: str | None = None
    timestamp: datetime


class ViolationResponse(BaseModel):
    id: int
    student_id: int
    exam_id: int
    violation_type: str
    severity: str
    description: str | None = None
    timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True
