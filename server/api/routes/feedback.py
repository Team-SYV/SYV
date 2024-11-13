from typing import List
from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from models.feedback import GetFeedbackResponse
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

# @router.post("/create",  response_model=CreateFeedbackResponse)
# async def create_feedback(feedback_data: CreateFeedback, supabase: Client= Depends(get_supabase)):
#     required_fields = ['answer_relevance', 'eye_contact', 'grammar', 'pace_of_speech', 'filler_words', 'tips']
#     for field in required_fields:
#         if not feedback_data.model_dump().get(field):
#             raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

#     response = supabase.table('feedback').insert(feedback_data.model_dump()).execute()

#     if hasattr(response, 'error') and response.error:
#         raise HTTPException(status_code=500, detail="Failed to create feedback")

#     return CreateFeedbackResponse(feedback_id=response.data[0]['feedback_id'])

@router.get("/get/{interview_id}", response_model=List[GetFeedbackResponse])
async def get_feedback(interview_id: str, supabase: Client = Depends(get_supabase)):
    response = supabase.table('feedback').select('*').eq('interview_id', interview_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="No feedback found for the given interview ID")

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve feedback")

    feedback_list = [
        GetFeedbackResponse(
            answer_id=feedback['answer_id'],
            interview_id=feedback['interview_id'],
            answer_relevance=feedback['answer_relevance'],
            eye_contact=feedback['eye_contact'],
            grammar=feedback['grammar'],
            pace_of_speech=feedback.get('pace_of_speech'),  
            filler_words=feedback.get('filler_words'),
            tips=feedback.get('tips'),
        )
        for feedback in response.data
    ]

    return feedback_list