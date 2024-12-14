import shutil
from tempfile import NamedTemporaryFile
from fastapi import APIRouter, File, HTTPException, UploadFile
from supabase import Client

from services.eye_contact import process_eye_contact
from utils.supabase import get_supabase_client


router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post("/get/")
async def eye_contact(file: UploadFile = File(...)):
    try:
        with NamedTemporaryFile(suffix=".mp4", delete=False) as temp_video:
            shutil.copyfileobj(file.file, temp_video)
            temp_video.seek(0)

            result = process_eye_contact(temp_video.name)
            return {"eye_contact": result['eye_contact_percentage']}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")
   
