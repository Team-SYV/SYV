import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def transcribe_audio(audio_file_path):
    with open(audio_file_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="en",
            response_format="verbose_json"
        )
    
    full_text = transcription['text']
    total_duration = transcription['segments'][-1]['end'] if transcription['segments'] else 0

    return {'transcript':full_text, 'time':total_duration}
