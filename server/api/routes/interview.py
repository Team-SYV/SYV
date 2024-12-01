from typing import List
from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from models.interview import CreateInterview, CreateInterviewResponse, GetInterviewHistory
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

@router.get("/get/{interview_id}", response_model=CreateInterview)
async def get_interview(interview_id: str,supabase: Client= Depends(get_supabase)):
    response = supabase.table('interview').select('*').eq('interview_id', interview_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Interview not found")

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve interview")

    return CreateInterview(
    user_id=response.data[0]['user_id'],
    job_information_id=response.data[0]['job_information_id'],
    type=response.data[0]['type']     
    )

@router.get("/history/{user_id}", response_model=List[GetInterviewHistory])
async def get_interview_history(user_id: str, supabase: Client = Depends(get_supabase)):
    # Fetch interview IDs with ratings
    rating_response = supabase.table('ratings').select('interview_id').execute()
    
    if hasattr(rating_response, 'error') and rating_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve ratings")

    rated_interview_ids = [item['interview_id'] for item in rating_response.data if 'interview_id' in item]

    if not rated_interview_ids:
        return []  # No interviews with ratings

    # Fetch interview history for the user
    response = supabase.table('interview').select(
        'interview_id', 'job_information_id', 'type', 'created_at'
    ).eq('user_id', user_id).in_('interview_id', rated_interview_ids).execute()

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve interview history")

    interview_history = response.data if response.data is not None else []

    # Fetch job info details
    job_info_details = {}
    job_information_ids = list(set(interview['job_information_id'] for interview in interview_history))

    if job_information_ids:
        job_info_response = supabase.table('job_information').select(
            'job_information_id', 'job_role', 'company_name'
        ).in_('job_information_id', job_information_ids).execute()

        if hasattr(job_info_response, 'error') and job_info_response.error:
            raise HTTPException(status_code=500, detail="Failed to retrieve job info")

        for job_info in job_info_response.data:
            job_info_details[job_info['job_information_id']] = {
                "job_role": job_info['job_role'],
                "company_name": job_info['company_name']
            }

    # Return structured response
    return [
        GetInterviewHistory(
            interview_id=interview['interview_id'],
            job_role=job_info_details.get(interview['job_information_id'], {}).get("job_role", "Unknown Role"),
            company_name=job_info_details.get(interview['job_information_id'], {}).get("company_name", "Unknown Company"),
            type=interview['type'],
            created_at=interview['created_at']
        )
        for interview in interview_history
    ]
