from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from models.job_information import CreateJobInformation, CreateJobInformationResponse
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post("/create",  response_model=CreateJobInformationResponse)
async def create_job_information(job_data: CreateJobInformation, supabase: Client= Depends(get_supabase)):
    required_fields = ['user_id', 'industry', 'job_role', 'interview_type', 'experience_level']
    for field in required_fields:
        if not job_data.model_dump().get(field):
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    response = supabase.table('job_information').insert(job_data.model_dump()).execute()

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to create job description")

    return CreateJobInformationResponse(job_information_id=response.data[0]['job_information_id'])

@router.get("/get/{job_id}", response_model=CreateJobInformation)
async def get_job_information(job_id: str,supabase: Client= Depends(get_supabase)):
    response = supabase.table('job_information').select('*').eq('job_information_id', job_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Job information not found")

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve job information")

    return CreateJobInformation(
            user_id=response.data[0]['user_id'],
            industry=response.data[0]['industry'],
            job_role=response.data[0]['job_role'],
            interview_type=response.data[0]['interview_type'],
            experience_level=response.data[0]['experience_level'],
            company_name=response.data[0].get('company_name'),  
            job_description=response.data[0].get('job_description') 
        )