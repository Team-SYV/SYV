from pydantic import BaseModel


class CreateAnswerInput(BaseModel):
    question_id: str
    answer: str

class CreateAnswerResponse(BaseModel):
    answer_id: str