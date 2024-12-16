from fastapi import APIRouter, HTTPException

# from services.rhubarb import generate_viseme_data
from services.tts import openai_tts
from services.visemes_generator import generate_visemes

router = APIRouter()

@router.get("/get/")
async def generate_speech(text: str):
    audio_file = openai_tts(text)
    
    visemes_file = generate_visemes(audio_file)

    if visemes_file:
        return visemes_file
    else:
        raise HTTPException(status_code=500, detail="Failed to generate visemes")
