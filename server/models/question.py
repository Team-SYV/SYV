from pydantic import BaseModel
from typing import List

class CreateQuestion(BaseModel):
    interview_id: str
    question: str
   
class GetQuestionByInterviewId(BaseModel):
    questions: List [str]