
from fastapi import APIRouter, status, Request, Response

from utils.clerk_webhook_handler import clerk_webhook_handler
from utils.supabase import get_supabase_client

import os

router = APIRouter()

supabase = get_supabase_client()
webhook_secret = os.getenv("WEBHOOK_SECRET")


@router.post("/clerk/", status_code=status.HTTP_204_NO_CONTENT)
async def webhook_handler(request: Request, response: Response):
    return await clerk_webhook_handler(request, response, supabase, webhook_secret)
