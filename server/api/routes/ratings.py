from typing import List
from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from collections import defaultdict
from datetime import datetime, timedelta
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
async def get_feedback_by_user_id(user_id: str, week_start: str, supabase: Client = Depends(get_supabase)):
    # Step 1: Fetch all interview_ids for the given user_id
    interview_response = supabase.table('interview').select('interview_id').eq('user_id', user_id).execute()
    
    # Extract all interview_ids
    interview_ids = [interview['interview_id'] for interview in interview_response.data]

    # Step 2: Fetch all ratings for the retrieved interview_ids
    ratings_response = supabase.table('ratings').select('*').in_('interview_id', interview_ids).execute()
    
    # Step 3: Prepare the date range for the current week (Sunday to Saturday)
    week_start_date = datetime.strptime(week_start, "%Y-%m-%d")
    week_end_date = week_start_date + timedelta(days=6)

    # Step 4: Group ratings by day within the current week
    ratings_by_day = defaultdict(lambda: {
        'answerRelevance': [0] * 7,
        'grammar': [0] * 7,
        'eyeContact': [0] * 7,
        'paceOfSpeech': [0] * 7,
        'fillerWords': [0] * 7,
        'count': [0] * 7  # This will track the count of ratings for each day
    })

    for ratings in ratings_response.data:
        # Extract date (assuming created_at is in ISO format and needs only the date part)
        date_str = ratings['created_at'].split('T')[0]  # Use only the date part (YYYY-MM-DD)
        date = datetime.strptime(date_str, "%Y-%m-%d")

        # Only consider ratings within the current week (Sunday to Saturday)
        if week_start_date <= date <= week_end_date:
            # Get the index for the day of the week (0 = Sunday, 6 = Saturday)
            day_index = (date - week_start_date).days

            # Add ratings to the corresponding day and increment count for averaging
            ratings_by_day[week_start_date]['answerRelevance'][day_index] += ratings['answer_relevance']
            ratings_by_day[week_start_date]['grammar'][day_index] += ratings['grammar']
            ratings_by_day[week_start_date]['eyeContact'][day_index] += ratings['eye_contact']
            ratings_by_day[week_start_date]['paceOfSpeech'][day_index] += ratings.get('pace_of_speech', 0)  # Default to 0 if not present
            ratings_by_day[week_start_date]['fillerWords'][day_index] += ratings.get('filler_words', 0)  # Default to 0 if not present
            ratings_by_day[week_start_date]['count'][day_index] += 1

    # Step 5: Calculate averages for each category by day
    for week_start_date, ratings in ratings_by_day.items():
        for category, rating_list in ratings.items():
            if category != 'count':  # We don't need to average the 'count'
                for i in range(7):
                    if ratings_by_day[week_start_date]['count'][i] > 0:  # Avoid division by zero
                        rating_list[i] = round(rating_list[i] / ratings_by_day[week_start_date]['count'][i], 2)

    # Step 6: Return the formatted response
    return {week_start_date.strftime("%Y-%m-%d"): ratings_by_day[week_start_date]}

