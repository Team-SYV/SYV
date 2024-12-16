import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import boto3
import base64
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Initialize FastAPI app
router = APIRouter()

# AWS Credentials from environment variables
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")

# Initialize AWS Polly client with credentials
polly_client = boto3.client(
    "polly",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION,
)

class TextInput(BaseModel):
    text: str

@router.post("/synthesize/")
async def synthesize_speech(input: TextInput):
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

        
        # Base64 encode the audio
        audio_base64 = base64.b64encode(audio_data).decode("utf-8")
    
        return {
            "audio": audio_base64,
            "visemes": parsed_visemes,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
