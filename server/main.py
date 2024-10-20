from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from api.webhooks.clerk import clerk_webhook_handler
from utils.supabase import get_supabase_client
from api.routes.job_information import router as job_information_router

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

@app.post("/api/webhooks/", status_code=status.HTTP_204_NO_CONTENT)
async def webhook_handler(request: Request, response: Response):
    return await clerk_webhook_handler(request, response, supabase, webhook_secret)
