from fastapi import APIRouter, HTTPException, Depends, Request
from supabase import Client
from models.job_information import CreateJobInformation, CreateJobInformationResponse
from utils.jwt import validate_token
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post("/create",  response_model=CreateJobInformationResponse)
async def create_job_information(job_data: CreateJobInformation, request: Request, supabase: Client= Depends(get_supabase)):

    # Validate the token
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validated_user_id = validate_token(auth_header)


    required_fields = ['industry', 'job_role', 'interview_type', 'experience_level']
    for field in required_fields:
        if not job_data.model_dump().get(field):
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
    job_data_dict = job_data.model_dump()
    job_data_dict['user_id'] = validated_user_id

    response = supabase.table('job_information').insert(job_data_dict).execute()

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to create job description")

    return CreateJobInformationResponse(job_information_id=response.data[0]['job_information_id'])

@router.get("/get/{job_id}", response_model=CreateJobInformation)
async def get_job_information(job_id: str, request: Request, supabase: Client= Depends(get_supabase)):

    # Validate the token
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validated_user_id = validate_token(auth_header)

    response = supabase.table('job_information').select('*').eq('job_information_id', job_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Job information not found")

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve job information")
    
    job_data = response.data[0]
    if 'user_id' in job_data and job_data['user_id'] != validated_user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this job information")

    return CreateJobInformation(
            industry=response.data[0]['industry'],
            job_role=response.data[0]['job_role'],
            interview_type=response.data[0]['interview_type'],
            experience_level=response.data[0]['experience_level'],
            company_name=response.data[0].get('company_name'),  
            job_description=response.data[0].get('job_description') 
        )