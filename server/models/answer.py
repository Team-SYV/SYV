from pydantic import BaseModel


class CreateAnswer(BaseModel):
    question_id: str
    answer: str

class CreateAnswerResponse(BaseModel):
    answer_id: str