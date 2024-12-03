import ffmpeg
from dotenv import load_dotenv
from tempfile import NamedTemporaryFile

load_dotenv()

def extract_audio(video_path: str) -> NamedTemporaryFile:
    """Extract audio from a video using ffmpeg-python."""
    temp_audio = NamedTemporaryFile(suffix=".mp3", delete=True)

    try:
        (
            ffmpeg
            .input(video_path)
            .output(temp_audio.name, format='mp3', ar=16000, ac=1) 
            .run(quiet=True, overwrite_output=True)
        )
    except ffmpeg.Error as e:
        raise RuntimeError(f"Failed to extract audio: {e.stderr.decode()}")

    return temp_audio
