from datetime import datetime

from pydantic import BaseModel


class MonitoringCreate(BaseModel):
    student_id: int
    exam_id: int
    status: str = "active"
    screen_activity: dict | None = None
    webcam_status: str = "pending"


class MonitoringResponse(BaseModel):
    id: int
    student_id: int
    exam_id: int
    status: str
    screen_activity: dict | None = None
    webcam_status: str
    created_at: datetime

    class Config:
        from_attributes = True
