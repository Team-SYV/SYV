from typing import List
from fastapi import APIRouter, HTTPException, Depends
from supabase import Client

from models.ratings import createRatingsInput, createRatingsResponse, getRatingsResponse
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post("/create",  response_model=createRatingsResponse)
async def create_ratings(ratings_data: createRatingsInput, supabase: Client= Depends(get_supabase)):
    required_fields = ['answer_relevance', 'eye_contact', 'grammar', 'pace_of_speech', 'filler_words']
    for field in required_fields:
        if not ratings_data.model_dump().get(field):
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    response = supabase.table('ratings').insert(ratings_data.model_dump()).execute()

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to create feedback")

    return createRatingsResponse(ratings_id=response.data[0]['rating_id'])

@router.get("/get/{interview_id}", response_model=List[getRatingsResponse])
async def get_feedback(interview_id: str, supabase: Client = Depends(get_supabase)):
    response = supabase.table('ratings').select('*').eq('interview_id', interview_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="No ratings found for the given interview ID")

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve ratings")

    ratings_list = [
        getRatingsResponse(
            answer_relevance=ratings['answer_relevance'],
            eye_contact=ratings['eye_contact'],
            grammar=ratings['grammar'],
            pace_of_speech=ratings.get('pace_of_speech'),  
            filler_words=ratings.get('filler_words'),
        )
        for ratings in response.data
    ]

    return ratings_list