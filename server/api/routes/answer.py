from fastapi import APIRouter, Depends, HTTPException, Request
from supabase import Client
from models.answer import CreateAnswer, CreateAnswerResponse
from utils.jwt import validate_token
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post("/create", response_model=CreateAnswerResponse)
def create_answer(answer_data: CreateAnswer, request: Request, supabase: Client = Depends(get_supabase)):
    # Validate the Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validated_user_id = validate_token(auth_header)

    # Check required fields
    required_fields = ['question_id', 'answer']
    for field in required_fields:
        if not answer_data.model_dump().get(field):
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    # Fetch the interview_id from the questions table
    question_response = supabase.table('questions').select('interview_id').eq('question_id', answer_data.question_id).execute()
    if not question_response.data:
        raise HTTPException(status_code=404, detail="Question not found")

    if hasattr(question_response, 'error') and question_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve question details")

    interview_id = question_response.data[0]['interview_id']

    # Fetch the user_id from the interview table
    interview_response = supabase.table('interview').select('user_id').eq('interview_id', interview_id).execute()
    if not interview_response.data:
        raise HTTPException(status_code=404, detail="Interview not found")

    if hasattr(interview_response, 'error') and interview_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve interview details")

    user_id = interview_response.data[0]['user_id']

    # Check if the validated_user_id matches the user_id in the interview table
    if user_id != validated_user_id:
        raise HTTPException(status_code=403, detail="You are not authorized to create an answer for this question")

    # Insert the answer into the answers table
    response = supabase.table('answer').insert(answer_data.model_dump()).execute()
    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to create answer")

    return CreateAnswerResponse(answer_id=response.data[0]['answer_id'])
