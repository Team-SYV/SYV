from fastapi import  FastAPI
from fastapi.middleware.cors import CORSMiddleware

from supabase import Client
from utils.supabase import get_supabase_client

from api.routes.webhooks import router as webhooks_router
from api.routes.interview import router as interview_router
from api.routes.question import router as question_router
from api.routes.answer import router as answer_router
from api.routes.feedback import router as feedback_router
from api.routes.ratings import router as ratings_router
from api.routes.visemes import router as vicemes_router
from api.routes.transcription import router as transcription_router
from api.routes.eye_contact import router as eye_contact_router


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

app.include_router(webhooks_router, prefix="/api/webhooks", tags=["webhook"])
app.include_router(interview_router, prefix="/api/interview", tags=["interview"])
app.include_router(question_router, prefix="/api/question", tags=["question"])
app.include_router(answer_router, prefix="/api/answer", tags=["answer"])
app.include_router(feedback_router, prefix="/api/feedback", tags=["feedback"])
app.include_router(ratings_router, prefix="/api/ratings", tags=["ratings"])
app.include_router(vicemes_router, prefix="/api/visemes", tags=["vicemes"])
app.include_router(transcription_router, prefix="/api/transcribe", tags=["transcription"])
app.include_router(eye_contact_router, prefix="/api/eye_contact", tags=["eye_contact"])
