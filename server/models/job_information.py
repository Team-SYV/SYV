from pydantic import BaseModel
from typing import Optional

class CreateJobInformation(BaseModel):
    user_id: str
    industry: str
    job_role: str
    interview_type: str
    experience_level: str
    company_name:Optional [str] = None
    job_description: Optional [str] = None

class CreateJobInformationResponse(BaseModel):
    job_information_id: str
