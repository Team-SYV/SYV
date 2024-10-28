from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from models.feedback import CreateFeedback, CreateFeedbackResponse
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post("/create",  response_model=CreateFeedbackResponse)
async def create_feedback(feedback_data: CreateFeedback, supabase: Client= Depends(get_supabase)):
    required_fields = ['answer_relevance', 'eye_contact', 'grammar', 'pace_of_speech', 'filler_words', 'tips']
    for field in required_fields:
        if not feedback_data.model_dump().get(field):
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    response = supabase.table('feedback').insert(feedback_data.model_dump()).execute()

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to create feedback")

    return CreateFeedbackResponse(job_information_id=response.data[0]['feedback_id'])

@router.get("/get/{feedback_id}", response_model=CreateFeedback)
async def get_job_information(feedback_id: str,supabase: Client= Depends(get_supabase)):
    response = supabase.table('feedback').select('*').eq('feedback_id', feedback_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Feedback not found")

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve feedback")

    return CreateFeedback(
            answer_id=response.data[0]['answer_id'],
            interview_id=response.data[0]['interview_id'],
            answer_relevance=response.data[0]['answer_relevance'],
            eye_contact=response.data[0]['eye_contact'],
            grammar=response.data[0]['grammar'],
            pace_of_speech=response.data[0].get('pace_of_speech'),  
            filler_words=response.data[0].get('filler_words') ,
            tips=response.data[0].get('tips') ,
        )