from fastapi import FastAPI, File, Form, HTTPException, Request, Response, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from api.webhooks.clerk import clerk_webhook_handler
from services.question_generator import generate_interview_questions
from services.pdf_reader import read_pdf
from utils.supabase import get_supabase_client
from api.routes.job_information import router as job_information_router
from api.routes.interview import router as interview_router
from api.routes.question import router as question_router
from api.routes.answer import router as answer_router

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

app.include_router(job_information_router, prefix="/api/job_information", tags=["job_information"])
app.include_router(interview_router, prefix="/api/interview", tags=["interview"])
app.include_router(question_router, prefix="/api/question", tags=["question"])
app.include_router(answer_router, prefix="/api/answer", tags=["answer"])


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
    
