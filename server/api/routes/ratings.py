from typing import List
from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from collections import defaultdict
from typing import Dict

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
            created_at=ratings['created_at'],
            answer_relevance=ratings['answer_relevance'],
            eye_contact=ratings['eye_contact'],
            grammar=ratings['grammar'],
            pace_of_speech=ratings.get('pace_of_speech'),  
            filler_words=ratings.get('filler_words'),
        )
        for ratings in response.data
    ]

    return ratings_list

@router.get("/progress/{user_id}", response_model=Dict[str, Dict[str, list]])
async def get_feedback_by_user_id(user_id: str, supabase: Client = Depends(get_supabase)):
    # Step 1: Fetch all interview_ids for the given user_id
    interview_response = supabase.table('interview').select('interview_id').eq('user_id', user_id).execute()
    
    if not interview_response.data:
        raise HTTPException(status_code=404, detail="No interviews found for the given user ID")
    
    if hasattr(interview_response, 'error') and interview_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve interviews for the user")

    # Extract all interview_ids
    interview_ids = [interview['interview_id'] for interview in interview_response.data]

    # Step 2: Fetch all ratings for the retrieved interview_ids
    ratings_response = supabase.table('ratings').select('*').in_('interview_id', interview_ids).execute()
    
    if not ratings_response.data:
        raise HTTPException(status_code=404, detail="No ratings found for the given user ID")

    if hasattr(ratings_response, 'error') and ratings_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve ratings")

    # Step 3: Group ratings by date
    ratings_by_date = defaultdict(lambda: {
        'answerRelevance': [],
        'grammar': [],
        'eyeContact': [],
        'paceOfSpeech': [],
        'fillerWords': []
    })

    for ratings in ratings_response.data:
        # Extract date (assuming created_at is in ISO format and needs only the date part)
        date = ratings['created_at'].split('T')[0]  # Use only the date part (YYYY-MM-DD)

        # Append each rating to the corresponding list by category
        ratings_by_date[date]['answerRelevance'].append(ratings['answer_relevance'])
        ratings_by_date[date]['grammar'].append(ratings['grammar'])
        ratings_by_date[date]['eyeContact'].append(ratings['eye_contact'])
        ratings_by_date[date]['paceOfSpeech'].append(ratings.get('pace_of_speech', None))  # Use None if not present
        ratings_by_date[date]['fillerWords'].append(ratings.get('filler_words', None))  # Use None if not present

    # Step 4: Return the formatted response
    return dict(ratings_by_date)