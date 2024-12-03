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
    
    try:
        full_text = transcription['text']
        total_duration = transcription['segments'][-1]['end'] if transcription['segments'] else 0
    except TypeError:
        full_text = transcription.text
        total_duration = transcription.segments[-1].end if transcription.segments else 0
        word_count = len(full_text.split())
        wpm = (word_count / total_duration) * 60 if total_duration > 0 else 0

    # Check if transcription is "you", "You", or empty string and return "No answer provided"
    if full_text.strip().lower() in ["you", ""]:
        return {'transcript': "No answer provided.", 'words_per_minute': 0}

    return {'transcript': full_text, 'words_per_minute': wpm}
