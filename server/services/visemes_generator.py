import json
import subprocess
from pathlib import Path
import base64

from utils.wav_converter import convert_to_wav

def generate_visemes(audio_file: str, output_dir: str = "visemes_output", visemes_json: str = "visemes.json", audio: str = "converted.wav"):
    visemes_output = Path(output_dir) / visemes_json  
    
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    wav_file = Path(output_dir) / audio  
    convert_to_wav(audio_file, str(wav_file))

    rhubarb_path = "bin/Rhubarb/rhubarb"
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

    with open(wav_file, 'rb') as audio_file:
        audio_binary = audio_file.read()
        audio_base64 = base64.b64encode(audio_binary).decode('utf-8')  

    visemes_data['metadata']['soundFile'] = audio_base64

    try:
        wav_file.unlink()  
        visemes_output.unlink()  
    except Exception as e:
        print(f"Error deleting files: {e}")

    return visemes_data
