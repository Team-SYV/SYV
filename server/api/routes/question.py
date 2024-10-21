from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from models.question import CreateQuestion, GetQuestionByInterviewId
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post("/create")
def create_questions(question_data: CreateQuestion, supabase: Client=Depends(get_supabase)):
    required_fields = ['interview_id', 'question']
    for field in required_fields:
        if not question_data.model_dump().get(field):
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    response = supabase.table('questions').insert(question_data.model_dump()).execute()

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to create question")
    
    return {'message':"Questions Created Succesfully"}

@router.get('/get/{interview_id}', response_model=GetQuestionByInterviewId)
def get_questions(interview_id: str, supabase: Client = Depends(get_supabase)):
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
