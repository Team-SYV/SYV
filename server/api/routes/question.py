from fastapi import APIRouter, Depends, HTTPException, Request
from supabase import Client
from models.question import CreateQuestion, GetQuestionByInterviewId
from utils.jwt import validate_token
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post("/create")
def create_questions(question_data: CreateQuestion, request: Request, supabase: Client = Depends(get_supabase)):

    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validated_user_id = validate_token(auth_header)

    required_fields = ['interview_id', 'question']
    for field in required_fields:
        if not question_data.model_dump().get(field):
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    interview_response = supabase.table('interview').select('user_id').eq('interview_id', question_data.interview_id).execute()
    if not interview_response.data:
        raise HTTPException(status_code=404, detail="Interview not found")

    if hasattr(interview_response, 'error') and interview_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve interview details")

    user_id = interview_response.data[0]['user_id']

    if user_id != validated_user_id:
        raise HTTPException(status_code=403, detail="You are not authorized")

    response = supabase.table('questions').insert(question_data.model_dump()).execute()
    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to create question")

    return {'message': "Questions Created Successfully"}


@router.get('/get/{interview_id}', response_model=GetQuestionByInterviewId)
def get_questions(interview_id: str, request: Request, supabase: Client = Depends(get_supabase)):
    # Validate the token
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validated_user_id = validate_token(auth_header)

    interview_response = supabase.table('interview').select("user_id").eq('interview_id', interview_id).execute()
    if not interview_response.data:
        raise HTTPException(status_code=404, detail="Interview not found")

    if hasattr(interview_response, 'error') and interview_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve interview details")

    user_id = interview_response.data[0].get('user_id')
    if user_id != validated_user_id:
        raise HTTPException(status_code=403, detail="You are not authorized to access this interview")

    response = supabase.table('questions').select("*").eq('interview_id', interview_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No questions found for the given interview ID")

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve questions")

    questions = [question['question'] for question in response.data]
    question_id = [question['question_id'] for question in response.data]

    return GetQuestionByInterviewId(
        question_id=question_id,
        questions=questions
    )
