from pydantic import BaseModel
from typing import List, Optional

class CreateQuestionInput(BaseModel):
    type: str
    industry:str
    experience_level: str
    interview_type: str
    job_description: Optional[str] = None
    company_name: Optional[str] = None
    job_role: str
    interview_id: str

   
class GetQuestionsResponse(BaseModel):
    question_id: List [str]
    questions: List [str]