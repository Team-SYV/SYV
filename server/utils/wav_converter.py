from pydub import AudioSegment

def convert_to_wav(input_file: str, output_file: str) -> str:
    """Convert an audio file to WAV format."""
    audio = AudioSegment.from_file(input_file)
    audio.export(output_file, format="wav")
    return output_file