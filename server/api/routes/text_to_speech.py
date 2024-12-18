import json
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import boto3
import base64
import os
import io
from dotenv import load_dotenv
from pydub import AudioSegment

from utils.jwt import validate_token

load_dotenv()

router = APIRouter()

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")

polly_client = boto3.client(
    "polly",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION,
)

class TextInput(BaseModel):
    text: str

@router.post("/synthesize/")
async def synthesize_speech(input: TextInput, request: Request):

    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header is missing")

    validate_token(auth_header)
    try:
        # Generate speech audio and visemes
        response_audio = polly_client.synthesize_speech(
            Engine="neural",
            Text=input.text,
            OutputFormat="mp3",
            VoiceId="Ruth",
        )
        response_visemes = polly_client.synthesize_speech(
            Engine="neural",
            Text=input.text,
            OutputFormat="json",
            SpeechMarkTypes=["viseme"],
            VoiceId="Ruth",
        )
        
        # Extract audio content and viseme metadata
        audio_data = response_audio["AudioStream"].read()
        visemes = response_visemes["AudioStream"].read().decode("utf-8")
        
        lines = visemes.strip().split("\n")
        parsed_visemes = [json.loads(line) for line in lines]

        audio_segment = AudioSegment.from_file(io.BytesIO(audio_data), format="mp3")
        audio_length_ms = len(audio_segment)
        
        
        # Base64 encode the audio
        audio_base64 = base64.b64encode(audio_data).decode("utf-8")
    
        return {
            "audio": audio_base64,
            "visemes": parsed_visemes,
            "length": audio_length_ms
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
