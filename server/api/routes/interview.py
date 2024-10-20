from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from models.interview import CreateInterview, CreateInterviewResponse
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post("/create",  response_model=CreateInterviewResponse)
async def create_interview(interview_data: CreateInterview, supabase: Client= Depends(get_supabase)):
    required_fields = ['user_id', 'job_information_id', 'type']
    for field in required_fields:
        if not interview_data.model_dump().get(field):
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    response = supabase.table('interview').insert(interview_data.model_dump()).execute()

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to create interview")

    return CreateInterviewResponse(interview_id=response.data[0]['interview_id'])

