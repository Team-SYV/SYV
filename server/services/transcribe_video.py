import os
import ffmpeg
from openai import OpenAI
from tempfile import NamedTemporaryFile

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def extract_audio(video_path: str) -> NamedTemporaryFile:
    """Extract audio from a video using ffmpeg-python."""
    temp_audio = NamedTemporaryFile(suffix=".wav", delete=True)

    try:
        (
            ffmpeg
            .input(video_path)
            .output(temp_audio.name, format='wav')
            .run(quiet=True, overwrite_output=True)
        )
    except ffmpeg.Error as e:
        raise RuntimeError(f"Failed to extract audio: {e.stderr.decode()}")

    return temp_audio

def transcribe_audio(audio_path: str) -> str:
    """Transcribe audio using OpenAI Whisper."""
    with open(audio_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="en",
        )
    return transcription.text
