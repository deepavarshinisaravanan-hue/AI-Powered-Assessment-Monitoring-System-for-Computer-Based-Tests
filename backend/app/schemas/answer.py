from pydantic import BaseModel


class AnswerCreate(BaseModel):
    student_id: int
    exam_id: int
    question_id: int
    selected_option: str


class AnswerResponse(BaseModel):
    id: int
    student_id: int
    exam_id: int
    question_id: int
    selected_option: str
    is_correct: int

    class Config:
        from_attributes = True
