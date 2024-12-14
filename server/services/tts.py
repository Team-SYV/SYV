from pathlib import Path
import openai
import os
from openai import OpenAI

# Set your OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY
client = OpenAI()

def openai_tts(text: str, filename: str = "output.wav") -> str:
    response = client.audio.speech.create(
        model="tts-1",  
        voice="nova", 
        input=text,  
        response_format="wav"
    )
    audio_data = response.content  
    
    Path("visemes_output").mkdir(parents=True, exist_ok=True)

    output = Path("visemes_output") / filename
    
    with open((output), 'wb') as audio_file:
        audio_file.write(audio_data)

    return output  

