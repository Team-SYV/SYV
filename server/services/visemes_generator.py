import json
import subprocess
from pathlib import Path
import base64

from utils.wav_converter import convert_to_wav

def generate_visemes(audio_file: str, output_dir: str = "visemes_output", visemes_json: str = "visemes.json", audio: str = "converted.wav"):
    """Generate visemes using Rhubarb Lip Sync and return the viseme data with the Base64-encoded audio in metadata."""
    visemes_output = Path(output_dir) / visemes_json  # Use visemes_json instead of json_output
    
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # Run Rhubarb Lip Sync to generate viseme data
    wav_file = Path(output_dir) / audio  # Using 'audio' as the filename for the WAV file
    convert_to_wav(audio_file, str(wav_file))

    rhubarb_path = "bin/rhubarb/rhubarb"
    command = [
        rhubarb_path,
        '-f', 'json',
        str(wav_file),
        '-o', str(visemes_output)
    ]

    # Use subprocess to run the command
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error generating visemes: {e}")
        return None

    with open(visemes_output, 'r') as file:
        visemes_data = json.load(file)

    # Read the WAV file and encode it in Base64
    with open(wav_file, 'rb') as audio_file:
        audio_binary = audio_file.read()
        audio_base64 = base64.b64encode(audio_binary).decode('utf-8')  # Convert to Base64 and decode to string

    # Replace the soundFile path with the Base64-encoded audio in the metadata
    visemes_data['metadata']['soundFile'] = audio_base64  # Update metadata with Base64 audio

# Delete the generated files after processing
    try:
        wav_file.unlink()  # Delete the WAV file
        visemes_output.unlink()  # Delete the visemes JSON file
    except Exception as e:
        print(f"Error deleting files: {e}")

    return visemes_data
