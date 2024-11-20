from typing import List
from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from models.feedback import GetFeedbackResponse, GetRecordFeedbackResponse
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

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

@router.get("/get/record/{interview_id}", response_model=List[GetRecordFeedbackResponse])
async def get_feedback_and_questions(interview_id: str, supabase: Client = Depends(get_supabase)):
    # Step 1: Fetch feedback for the interview
    feedback_response = supabase.table('feedback').select('*').eq('interview_id', interview_id).execute()

    if not feedback_response.data:
        raise HTTPException(status_code=404, detail="No feedback found for the given interview ID")

    if hasattr(feedback_response, 'error') and feedback_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve feedback")

    feedback_data = feedback_response.data

    # Step 2: Extract answer_ids and fetch answers
    answer_ids = [feedback['answer_id'] for feedback in feedback_data]
    answers_response = supabase.table('answer').select('answer_id, question_id').in_('answer_id', answer_ids).execute()

    if hasattr(answers_response, 'error') and answers_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve answers")

    answers_data = {answer['answer_id']: answer['question_id'] for answer in answers_response.data}

    # Step 3: Extract question_ids and fetch questions
    question_ids = list(set(answers_data.values()))
    questions_response = supabase.table('questions').select('question_id, question').in_('question_id', question_ids).execute()

    if hasattr(questions_response, 'error') and questions_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve questions")

    questions_data = {question['question_id']: question['question'] for question in questions_response.data}

    # Step 4: Map feedback to questions
    feedback_list = []
    for feedback in feedback_data:
        question_id = answers_data.get(feedback['answer_id'])
        question_text = questions_data.get(question_id)

        feedback_list.append(
            GetRecordFeedbackResponse(
                answer_id=feedback['answer_id'],
                interview_id=feedback['interview_id'],
                answer_relevance=feedback['answer_relevance'],
                eye_contact=feedback['eye_contact'],
                grammar=feedback['grammar'],
                pace_of_speech=feedback.get('pace_of_speech'),
                filler_words=feedback.get('filler_words'),
                tips=feedback.get('tips'),
                question=question_text
            )
        )

    return feedback_list