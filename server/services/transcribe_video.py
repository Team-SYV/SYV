import os
import ffmpeg
from openai import OpenAI
from dotenv import load_dotenv
from tempfile import NamedTemporaryFile

load_dotenv()

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

