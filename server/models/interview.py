from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CreateInterviewInput(BaseModel):
    type: str
    job_role: str
    company_name: Optional [str] = None
   

class CreateInterviewResponse(BaseModel):
    interview_id: str


class GetInterviewResponse(BaseModel):
    interview_id: Optional[str] = None
    type: str
    job_role: str
    company_name: Optional [str] = None
    created_at: datetime

