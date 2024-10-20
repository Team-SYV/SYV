from pydantic import BaseModel

class CreateInterview(BaseModel):
    user_id: str
    job_information_id: str
    type: str
   

class CreateInterviewResponse(BaseModel):
    interview_id: str
