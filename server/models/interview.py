from datetime import datetime
from pydantic import BaseModel

class CreateInterview(BaseModel):
    job_information_id: str
    type: str
   

class CreateInterviewResponse(BaseModel):
    interview_id: str


class GetInterviewHistory(BaseModel):
    interview_id: str
    job_role: str
    company_name: str
    type: str
    created_at: datetime