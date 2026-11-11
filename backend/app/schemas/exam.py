from pydantic import BaseModel, Field


class ExamQuestionCreate(BaseModel):
    question_text: str = Field(min_length=1)
    option_a: str = Field(min_length=1)
    option_b: str = Field(min_length=1)
    option_c: str = Field(min_length=1)
    option_d: str = Field(min_length=1)
    correct_option: str = Field(pattern="^[ABCD]$")
    difficulty: str = "medium"


class ExamCreate(BaseModel):
    title: str = Field(min_length=1)
    description: str | None = None
    duration_minutes: int = Field(default=60, gt=0)
    status: str = "published"
    student_ids: list[int] = Field(min_length=1)
    questions: list[ExamQuestionCreate] = Field(min_length=1)


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
