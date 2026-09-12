from pydantic import BaseModel


class ExamCreate(BaseModel):
    title: str
    description: str | None = None
    duration_minutes: int = 60
    status: str = "draft"


class ExamUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    duration_minutes: int | None = None
    status: str | None = None


class ExamResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    duration_minutes: int
    status: str

    class Config:
        from_attributes = True
