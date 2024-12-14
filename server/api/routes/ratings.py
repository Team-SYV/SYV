from typing import List
from fastapi import APIRouter, HTTPException, Depends, Request
from supabase import Client
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict

from models.ratings import createRatingsInput, createRatingsResponse, getRatingsResponse
from utils.jwt import validate_token
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post("/create/", response_model=createRatingsResponse)
async def create_ratings(ratings_data: createRatingsInput, request: Request, supabase: Client = Depends(get_supabase)):
    
    # Validate the token
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validated_user_id = validate_token(auth_header)

    # Validate the input
    required_fields = ['answer_relevance', 'eye_contact', 'grammar', 'pace_of_speech', 'filler_words', 'interview_id']
    for field in required_fields:
        if ratings_data.model_dump().get(field) is None:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    # Check if the interview exists
    interview_response = supabase.table('interview').select('user_id').eq('interview_id', ratings_data.interview_id).execute()
    if not interview_response.data:
        raise HTTPException(status_code=404, detail="Interview not found")

    if hasattr(interview_response, 'error') and interview_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve interview details")

    # Check if the user is authorized
    user_id = interview_response.data[0]['user_id']

    if user_id != validated_user_id:
        raise HTTPException(status_code=403, detail="You are not authorized")

    # Insert the ratings
    response = supabase.table('ratings').insert(ratings_data.model_dump()).execute()
    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to create ratings")

    return createRatingsResponse(ratings_id=response.data[0]['rating_id'])

@router.get("/get/{interview_id}/", response_model=List[getRatingsResponse])
async def get_feedback(interview_id: str, request: Request, supabase: Client = Depends(get_supabase)):
    # Validate the token
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validated_user_id = validate_token(auth_header)

    # Check if the interview exists
    interview_response = supabase.table('interview').select('user_id').eq('interview_id', interview_id).execute()
    if not interview_response.data:
        raise HTTPException(status_code=404, detail="Interview not found")

    if hasattr(interview_response, 'error') and interview_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve interview details")

    # Check if the user is authorized
    user_id = interview_response.data[0]['user_id']

    if user_id != validated_user_id:
        raise HTTPException(status_code=403, detail="You are not authorized to access this interview's ratings")

    # Fetch the ratings
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

@router.get("/progress/", response_model=Dict[str, Dict[str, list]])
async def get_feedback_by_user_id(request: Request, supabase: Client = Depends(get_supabase)):

    # Validate the token
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validated_user_id = validate_token(auth_header)

    week_start = request.query_params.get('week_start')

    # Check if the user has any interviews
    interview_response = supabase.table('interview').select('interview_id').eq('user_id', validated_user_id).execute()
    
    interview_ids = [interview['interview_id'] for interview in interview_response.data]

    # Fetch the ratings
    ratings_response = supabase.table('ratings').select('*').in_('interview_id', interview_ids).execute()
    
    # Prepare the response
    week_start_date = datetime.strptime(week_start, "%Y-%m-%d")
    week_end_date = week_start_date + timedelta(days=6)

    ratings_by_day = defaultdict(lambda: {
        'answerRelevance': [0] * 7,
        'grammar': [0] * 7,
        'eyeContact': [0] * 7,
        'paceOfSpeech': [0] * 7,
        'fillerWords': [0] * 7,
        'count': [0] * 7  
    })

    for ratings in ratings_response.data:
        date_str = ratings['created_at'].split('T')[0]  
        date = datetime.strptime(date_str, "%Y-%m-%d")

        if week_start_date <= date <= week_end_date:
            day_index = (date - week_start_date).days

            ratings_by_day[week_start_date]['answerRelevance'][day_index] += ratings['answer_relevance']
            ratings_by_day[week_start_date]['grammar'][day_index] += ratings['grammar']
            ratings_by_day[week_start_date]['eyeContact'][day_index] += ratings['eye_contact']
            ratings_by_day[week_start_date]['paceOfSpeech'][day_index] += ratings.get('pace_of_speech', 0)  # Default to 0 if not present
            ratings_by_day[week_start_date]['fillerWords'][day_index] += ratings.get('filler_words', 0)  # Default to 0 if not present
            ratings_by_day[week_start_date]['count'][day_index] += 1

    for week_start_date, ratings in ratings_by_day.items():
        for category, rating_list in ratings.items():
            if category != 'count':  
                for i in range(7):
                    if ratings_by_day[week_start_date]['count'][i] > 0: 
                        rating_list[i] = round(rating_list[i] / ratings_by_day[week_start_date]['count'][i], 2)

    return {week_start_date.strftime("%Y-%m-%d"): ratings_by_day[week_start_date]}