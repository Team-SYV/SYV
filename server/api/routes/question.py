from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from supabase import Client
from models.question import CreateQuestionInput, GetQuestionsResponse
from services.question_generator import generate_interview_questions
from utils.pdf_reader import pdf_reader
from utils.jwt import validate_token
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post('/create/')
async def create_questions(
    request: Request,
    interview_id: str = Form(...),
    file: UploadFile = File(None),  
    industry: str = Form(None),
    experience_level: str = Form(None),
    interview_type: str = Form(None),
    job_description: str = Form(None),
    company_name: str = Form(None),
    job_role: str = Form(None),
    supabase: Client = Depends(get_supabase)):
    
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
        raise HTTPException(status_code=403, detail="You are not authorized to access this interview")
    
    # Generate questions
    resume_text = None

    if file:
            resume_text = await pdf_reader(file)
    
    try:
        questions = generate_interview_questions(
            industry=industry,
            experience_level=experience_level,
            interview_type=interview_type,
            job_description=job_description,
            company_name=company_name,
            job_role=job_role,
            resume_text=resume_text
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate questions")

    # Insert the questions
    for question in questions:
        clean_question = question.replace('*', '')  
        response = supabase.table('questions').insert({
            'interview_id': interview_id,
            'question': clean_question
        }).execute()

        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail="Failed to create questions")
    
    return {'message': "Questions Created Successfully"}
    
@router.get('/get/{interview_id}/', response_model=GetQuestionsResponse)
def get_questions(interview_id: str, request: Request, supabase: Client = Depends(get_supabase)):

    # Validate the token
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validated_user_id = validate_token(auth_header)

    # Check if the interview exists
    interview_response = supabase.table('interview').select("user_id").eq('interview_id', interview_id).execute()
    if not interview_response.data:
        raise HTTPException(status_code=404, detail="Interview not found")

    if hasattr(interview_response, 'error') and interview_response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve interview details")

    # Check if the user is authorized
    user_id = interview_response.data[0].get('user_id')
    if user_id != validated_user_id:
        raise HTTPException(status_code=403, detail="You are not authorized to access this interview")

    # Fetch the questions
    response = supabase.table('questions').select("*").eq('interview_id', interview_id).order('created_at', desc=False).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="No questions found for the given interview ID")

    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=500, detail="Failed to retrieve questions")
    
    # Prepare the response
    question = [question['question'] for question in response.data]
    question_id = [question['question_id'] for question in response.data]

    return GetQuestionsResponse(
        question_id=question_id,
        questions=question
    )
