import cv2
from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse
from supabase import Client
from services.eye_contact import eye_contact
from utils.supabase import get_supabase_client

router = APIRouter()

def get_supabase() -> Client:
    return get_supabase_client()

@router.post("/eye-contact")
async def process_video(file: UploadFile = File(...)):
    # Save the uploaded file
    video_path = f"/tmp/{file.filename}"
    with open(video_path, "wb") as buffer:
        buffer.write(await file.read())

    # Open the video and process frames
    cap = cv2.VideoCapture(video_path)
    eye_contact_count = 0
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        if eye_contact(frame):
            eye_contact_count += 1

    cap.release()

    # Calculate eye contact percentage
    eye_contact_ratio = (eye_contact_count / frame_count) * 100 if frame_count > 0 else 0

    return JSONResponse(content={"eye_contact_percentage": eye_contact_ratio})
