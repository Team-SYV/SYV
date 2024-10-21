from pydantic import BaseModel

class CreateQuestion(BaseModel):
    interview_id: str
    question: str
   
class GetQuestionByInterviewId(BaseModel):
    question: str