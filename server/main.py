import shutil
from tempfile import NamedTemporaryFile
from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, Response, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client
from api.webhooks.clerk import clerk_webhook_handler
from models.feedback import GenerateFeedbackInput, GenerateVirtualFeedbackInput
from services.eye_contact import process_video
from services.transcribe_audio import transcribe_audio
from services.feedback_generator import generate_feedback, generate_virtual_feedback
from services.transcribe_video import extract_audio
from services.question_generator import generate_interview_questions
from services.pdf_reader import read_pdf
from utils.supabase import get_supabase_client
from api.routes.job_information import router as job_information_router
from api.routes.interview import router as interview_router
from api.routes.question import router as question_router
from api.routes.answer import router as answer_router
from api.routes.feedback import router as feedback_router
from api.routes.ratings import router as ratings_router


import os
import logging


logging.basicConfig(level=logging.DEBUG)
app = FastAPI()

supabase = get_supabase_client()
webhook_secret = os.getenv("WEBHOOK_SECRET")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_supabase() -> Client:
    return get_supabase_client()

app.include_router(job_information_router, prefix="/api/job_information", tags=["job_information"])
app.include_router(interview_router, prefix="/api/interview", tags=["interview"])
app.include_router(question_router, prefix="/api/question", tags=["question"])
app.include_router(answer_router, prefix="/api/answer", tags=["answer"])
app.include_router(feedback_router, prefix="/api/feedback", tags=["feedback"])
app.include_router(ratings_router, prefix="/api/ratings", tags=["ratings"])

@app.post("/api/webhooks/", status_code=status.HTTP_204_NO_CONTENT)
async def webhook_handler(request: Request, response: Response):
    return await clerk_webhook_handler(request, response, supabase, webhook_secret)

@app.post("/api/generate-questions/")
async def generate_questions(
    file: UploadFile = File(None),  
    type: str = Form(None),
    industry: str = Form(None),
    experience_level: str = Form(None),
    interview_type: str = Form(None),
    job_description: str = Form(None),
    company_name: str = Form(None),
    job_role: str = Form(None),

):    
    resume_text = None
    
    if file:
        try:
            file_path = f"/tmp/{file.filename}"
            with open(file_path, "wb") as buffer:
                buffer.write(await file.read())

            resume_text = read_pdf(file_path)

        except Exception as e:
            logging.error(f"Error reading file: {e}")
            raise HTTPException(status_code=500, detail="Failed to process the uploaded file")

    try:
        questions = generate_interview_questions(
            industry=industry,
            type=type,
            experience_level=experience_level,
            interview_type=interview_type,
            job_description=job_description,
            company_name=company_name,
            job_role=job_role,
            resume_text=resume_text, 
        )

        return {"questions": questions}

    except Exception as e:
        logging.error(f"Error generating questions: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate questions")
    
@app.post("/api/transcribe-video/")
async def transcribe_video(file: UploadFile = File(...)):
    """Receive a video, extract audio, and return transcription text."""
    try:
        with NamedTemporaryFile(suffix=".mp4", delete=True) as temp_video:
            shutil.copyfileobj(file.file, temp_video)
            temp_video.seek(0)

            temp_audio =  extract_audio(temp_video.name)

            transcription =  transcribe_audio(temp_audio.name)
            eye_contact =  process_video(temp_video.name)

            transcript = transcription['transcript']
            wpm = transcription['words_per_minute']
            eye_contact_percentage = eye_contact['eye_contact_percentage']


            return {"transcription":transcript,"wpm": wpm, "eye_contact": eye_contact_percentage}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    
@app.post("/api/generate-feedback/")
async def generate_feedback_api(feedback_input: GenerateFeedbackInput, supabase: Client= Depends(get_supabase)):
    """Generate feedback based on a question and answer."""
    try:
        question = feedback_input.question
        answer = feedback_input.answer
        wpm = feedback_input.wpm
        eye_contact = feedback_input.eye_contact

        feedback = generate_feedback(question, answer, wpm, eye_contact)

        feedback_data = {
            "grammar": feedback.get("grammar", ""),
            "answer_relevance": feedback.get("relevance", ""),
            "filler_words": feedback.get("filler", ""),
            "pace_of_speech": feedback.get("pace_of_speech", ""),
            "eye_contact": feedback.get("eye_contact", ""),
            "tips": feedback.get("tips",""),
            "answer_id": feedback_input.answer_id,
            "interview_id": feedback_input.interview_id
        }

        ratings_data = {
            "grammar_rating": feedback.get("grammar_rating", 0),
            "answer_relevance_rating": feedback.get("relevance_rating", 0),
            "filler_words_rating": feedback.get("filler_rating", 0),
            "pace_of_speech_rating": feedback.get("pace_of_speech_rating", 0),
            "eye_contact_rating": feedback.get("eye_contact_rating", 0),

        }
        response = supabase.table('feedback').insert(feedback_data).execute()
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail="Failed to create feedback")
        return {"feedback_id": response.data[0]['feedback_id'], "ratings_data": ratings_data }
    except Exception as e:
        logging.error(f"Error generating feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate feedback")
    
@app.post("/api/generate-virtual-feedback/")
async def generate_virtual_feedback_api(input: GenerateVirtualFeedbackInput,supabase: Client = Depends(get_supabase)
):
    """Generate virtual feedback based on multiple questions and answers."""
    try:
        feedback = generate_virtual_feedback(input.questions, input.answers, input.wpm, input.eye_contact)

        feedback_data = {
            "grammar": feedback.get("grammar", ""),
            "answer_relevance": feedback.get("relevance", ""),
            "filler_words": feedback.get("filler", ""),
            "pace_of_speech": feedback.get("pace_of_speech", ""),
            "eye_contact": feedback.get("eye_contact", ""),
            "tips": feedback.get("tips", ""),
            "interview_id": input.interview_id
        }

        ratings_data = {
            "grammar_rating": feedback.get("grammar_rating", 0),
            "answer_relevance_rating": feedback.get("relevance_rating", 0),
            "filler_words_rating": feedback.get("filler_rating", 0),
            "pace_of_speech_rating": feedback.get("pace_of_speech_rating", 0),
            "eye_contact_rating": feedback.get("eye_contact_rating", 0),
        }

        response = supabase.table('feedback').insert(feedback_data).execute()
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail="Failed to create feedback")

        return {"feedback_id": response.data[0]['feedback_id'], "ratings_data": ratings_data}

    except Exception as e:
        logging.error(f"Error generating virtual feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate virtual feedback")