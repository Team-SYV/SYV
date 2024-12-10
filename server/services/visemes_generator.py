import json
import subprocess
from pathlib import Path

from utils.wav_converter import convert_to_wav

def generate_visemes(audio_file: str, output_dir: str = "visemes_output"):
    """Generate visemes using Rhubarb Lip Sync."""
    visemes_output = Path(output_dir) / "visemes.json"
    
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # Run Rhubarb Lip Sync to generate viseme data
    wav_file = Path(output_dir) / "converted.wav"
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

    return visemes_data