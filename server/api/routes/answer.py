from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from models.answer import CreateAnswer, CreateAnswerResponse
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post("/create",response_model=CreateAnswerResponse)
def create_answer(answer_data: CreateAnswer, supabase: Client=Depends(get_supabase)):
    required_fields = ['question_id', 'answer']
    for field in required_fields:
        if not answer_data.model_dump().get(field):
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
    response = supabase.table('answer').insert(answer_data.model_dump()).execute()

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to create answer")

    return CreateAnswerResponse(answer_id=response.data[0]['answer_id'])


