from typing import List
from fastapi import APIRouter, Form, HTTPException, Depends, Request
from supabase import Client
from models.feedback import CreateRecordFeedbackInput, CreateVirtualFeedbackInput, GetFeedbackResponse, CreateFeedbackResponse
from services.question_generator import generate_answer_feedback
from services.feedback_generator import generate_feedback, generate_feedback_virtual
from utils.jwt import validate_token
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post("/create/",response_model= CreateFeedbackResponse)
async def create_record_feedback(feedback_data: CreateRecordFeedbackInput, request: Request, supabase: Client = Depends(get_supabase)):
  
   # Validate the token
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validated_user_id = validate_token(auth_header)

 # Validate the input
    required_fields = ['answer_id', 'interview_id', 'answer', 'question']
    for field in required_fields:
        if not feedback_data.model_dump().get(field):
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    # Ensure `wpm` and `eye_contact` are present, even if their values are zero
    if feedback_data.pace_of_speech is None or feedback_data.eye_contact is None:
        raise HTTPException(status_code=400, detail="Missing required field: wpm or eye_contact")
    
    try:
        # Check if the interview exists
        interview_response = supabase.table('interview').select('user_id').eq('interview_id', feedback_data.interview_id).execute()
        if not interview_response.data:
            raise HTTPException(status_code=404, detail="Interview not found")

        if hasattr(interview_response, 'error') and interview_response.error:
            raise HTTPException(status_code=500, detail="Failed to retrieve interview details")

        # Check if the user is authorized
        user_id = interview_response.data[0]['user_id']

        if user_id != validated_user_id:
            raise HTTPException(status_code=403, detail="You are not authorized to generate feedback for this interview")

        # Generate feedback
        question = feedback_data.question
        answer = feedback_data.answer
        wpm = feedback_data.pace_of_speech
        eye_contact = feedback_data.eye_contact

        feedback = generate_feedback(question, answer, wpm, eye_contact)

        # Prepare feedback and ratings data
        feedback_data = {
            "grammar": feedback.get("grammar", ""),
            "answer_relevance": feedback.get("relevance", ""),
            "filler_words": feedback.get("filler", ""),
            "pace_of_speech": feedback.get("pace_of_speech", ""),
            "eye_contact": feedback.get("eye_contact", ""),
            "tips": feedback.get("tips", ""),
            "answer_id": feedback_data.answer_id,
            "interview_id": feedback_data.interview_id
        }

        ratings_data = {
            "grammar_rating": feedback.get("grammar_rating", 0),
            "answer_relevance_rating": feedback.get("relevance_rating", 0),
            "filler_words_rating": feedback.get("filler_rating", 0),
            "pace_of_speech_rating": feedback.get("pace_of_speech_rating", 0),
            "eye_contact_rating": feedback.get("eye_contact_rating", 0),
        }

        # Insert feedback into the database
        response = supabase.table('feedback').insert(feedback_data).execute()
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail="Failed to create feedback")

        return CreateFeedbackResponse(feedback_id=response.data[0]['feedback_id'], ratings_data=ratings_data)
    
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create feedback")

@router.post("/create/virtual/response/")
async def generate_response(
    request: Request,
    previous_question: str = Form(...), 
    previous_answer: str = Form(...)
):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validate_token(auth_header)

    try:
        feedback = generate_answer_feedback(previous_question, previous_answer)
        return {"feedback": feedback}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate answer feedback")
    

@router.get("/get/{interview_id}/", response_model=List[GetFeedbackResponse])
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
        raise HTTPException(status_code=403, detail="You are not authorized to access feedback for this interview")

    # Retrieve feedback
    feedback_response = supabase.table('feedback').select('*').eq('interview_id', interview_id).execute()

    if not feedback_response.data:
        raise HTTPException(status_code=404, detail="No feedback found for the given interview ID")

    if hasattr(feedback_response, 'error') and feedback_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve feedback")
    

    # Retrieve answers for the feedback
    answer_ids = [feedback['answer_id'] for feedback in feedback_response.data]
    answers_response = supabase.table('answer').select('answer_id, answer, question_id').in_('answer_id', answer_ids).execute()
    if hasattr(answers_response, 'error') and answers_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve answers")

    answers_data = {answer['answer_id']: answer for answer in answers_response.data}

    question_ids = list(set(answer['question_id'] for answer in answers_data.values()))
    questions_response = supabase.table('questions').select('question_id, question, created_at').in_('question_id', question_ids).execute()
    if hasattr(questions_response, 'error') and questions_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve questions")

    questions_data = {question['question_id']: question for question in questions_response.data}

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
            answer=answers_data.get(feedback['answer_id'])['answer'],
            question=questions_data[answers_data.get(feedback['answer_id'])['question_id']]['question'],
        )
        for feedback in feedback_response.data
    ]

    return feedback_list