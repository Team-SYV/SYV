from typing import List
from fastapi import APIRouter, HTTPException, Depends, Request
from supabase import Client
from models.interview import CreateInterviewInput, CreateInterviewResponse, GetInterviewResponse
from utils.jwt import validate_token
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post("/create/",  response_model=CreateInterviewResponse)
async def create_interview(interview_data: CreateInterviewInput, request: Request, supabase: Client= Depends(get_supabase)):
    
    # Validate the token
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validated_user_id = validate_token(auth_header)

    # Validate the input 
    required_fields = ['type', 'job_role']
    for field in required_fields:
        if not interview_data.model_dump().get(field):
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    # Add the user_id to the interview data
    interview_data_dict = interview_data.model_dump()
    interview_data_dict['user_id'] = validated_user_id

    # Insert the interview data
    response = supabase.table('interview').insert(interview_data_dict).execute()

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to create interview")

    return CreateInterviewResponse(interview_id=response.data[0]['interview_id'])

@router.get("/get/{interview_id}/", response_model=GetInterviewResponse)
async def get_interview(interview_id: str, request: Request, supabase: Client= Depends(get_supabase)):

    # Validate the token
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validated_user_id = validate_token(auth_header)

    # Fetch the interview data
    response = supabase.table('interview').select('*').eq('interview_id', interview_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    if response.data[0]['user_id'] != validated_user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this interview")

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve interview")

    return GetInterviewResponse(
    type=response.data[0]['type'],
    job_role=response.data[0]['job_role'],
    company_name=response.data[0].get('company_name'),
    created_at=response.data[0]['created_at'] 
    )

@router.get("/history/", response_model=List[GetInterviewResponse])
async def get_interview_history(request: Request, supabase: Client = Depends(get_supabase)):

     # Validate the token
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validated_user_id = validate_token(auth_header)
    
    # Only Fetch Rated Interviews
    rating_response = supabase.table('ratings').select('interview_id').execute()
    
    if hasattr(rating_response, 'error') and rating_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve ratings")

    rated_interview_ids = [item['interview_id'] for item in rating_response.data if 'interview_id' in item]

    if not rated_interview_ids:
        return []  

    # Fetch interview history for the user
    response = supabase.table('interview').select('interview_id', 'type', 'created_at', 'job_role', 'company_name'
    ).eq('user_id', validated_user_id).in_('interview_id', rated_interview_ids).execute()

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve interview history")

    interview_history = response.data if response.data is not None else []

    # Return structured response
    return [
        GetInterviewResponse(
            interview_id=interview['interview_id'],
            type=interview['type'],
            job_role=interview['job_role'],
            company_name=interview['company_name'],
            created_at=interview['created_at']
        )
        for interview in interview_history
    ]
