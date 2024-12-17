import shutil
from tempfile import NamedTemporaryFile
from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from supabase import Client

from services.eye_contact import process_eye_contact
from services.transcribe_video import extract_audio
from services.transcribe_audio import transcribe_audio
from utils.supabase import get_supabase_client
from utils.jwt import validate_token



router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post("/audio/")
async def transcribe_audio_endpoint(request: Request, file: UploadFile = File(...)):

    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validate_token(auth_header)
    
    try:
        file_path = f"/tmp/{file.filename}"
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        transcription = transcribe_audio(file_path)


        return {"transcription": transcription}

    except Exception :
        raise HTTPException(status_code=500, detail="Failed to transcribe the file")

@router.post("/video/")
async def transcribe_video(request: Request, file: UploadFile = File(...)):
    
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validate_token(auth_header)

    try:
        with NamedTemporaryFile(suffix=".mp4", delete=False) as temp_video:
            shutil.copyfileobj(file.file, temp_video)
            temp_video.seek(0)

            temp_audio =  extract_audio(temp_video.name)

            transcription =  transcribe_audio(temp_audio.name)
            eye_contact =  process_eye_contact(temp_video.name)

            transcript = transcription['transcript']
            wpm = transcription['words_per_minute']
            eye_contact_percentage = eye_contact['eye_contact_percentage']


            return {"transcription":transcript,"wpm": wpm, "eye_contact": eye_contact_percentage}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
