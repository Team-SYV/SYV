import shutil
from tempfile import NamedTemporaryFile
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from supabase import Client

from services.validator import validate
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
        with NamedTemporaryFile(suffix=".png", delete=False) as temp_image:
            shutil.copyfileobj(file.file, temp_image)
            temp_image.seek(0)

        transcription =  image_reader(temp_image.name)
        job_details =  extract_job_details(transcription)

        return {"job_details": job_details}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"""Failed to transcribe the image {e}""")
    
@router.post("/pdf/")
async def transcribe_pdf(request: Request, file: UploadFile = File(...)):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validate_token(auth_header)

    try:
        with NamedTemporaryFile(suffix=".pdf", delete=False) as temp_pdf:
            shutil.copyfileobj(file.file, temp_pdf)
            temp_pdf.seek(0)

        transcription = read_pdf(temp_pdf.name)
        job_details = extract_job_details(transcription)

        return {"job_details": job_details}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"""Failed to transcribe the pdf {e}""")

@router.post("/resume/")
async def transcribe_resume(request: Request, file: UploadFile = File(...)):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validate_token(auth_header)

    try:
        with NamedTemporaryFile(suffix=".pdf", delete=False) as temp_pdf:
            shutil.copyfileobj(file.file, temp_pdf)
            temp_pdf.seek(0)

        transcription = read_pdf(temp_pdf.name)

        return {"resume": transcription}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"""Failed to transcribe the pdf {e}""")

@router.post("/validate/")
async def validate_files(request: Request, job_description: str = Form(...), resume: str = Form(...) ):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validate_token(auth_header)
    
    try:
        result = validate(job_description, resume)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to validate the files, {e}")
    