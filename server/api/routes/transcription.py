import shutil
from tempfile import NamedTemporaryFile
from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from supabase import Client

from services.scrape import extract_job_details
from utils.image_reader import image_reader
from utils.pdf_reader import read_pdf
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

@router.post("/image/")
async def transcribe_image(request: Request, file: UploadFile = File(...)):

    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validate_token(auth_header)

    try:
        # Save the uploaded image to a temporary location
        file_path = f"/tmp/{file.filename}"
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        # Ensure this function is awaited properly
        transcription =  image_reader(file_path)
        job_details =  extract_job_details(transcription)

        return {"job_details": job_details}

    except Exception:
        raise HTTPException(status_code=500, detail="Failed to transcribe the image")


@router.post("/pdf/")
async def transcribe_pdf(request: Request, file: UploadFile = File(...)):

    # auth_header = request.headers.get("Authorization")
    # if not auth_header:
    #     raise HTTPException(status_code=401, detail="Authorization header is missing")

    # validate_token(auth_header)
    
    try:
        file_path = f"/tmp/{file.filename}"
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        transcription = read_pdf(file_path)
        job_details =  extract_job_details(transcription)

        return {"job_details": job_details}


    except Exception as e :
        raise HTTPException(status_code=500, detail=f"""Failed to transcribe the PDF, {e}""")