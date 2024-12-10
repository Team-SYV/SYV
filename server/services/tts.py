import openai
import os
from openai import OpenAI

# Set your OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY
client = OpenAI()

def openai_tts(text: str, filename: str = "output.aac") -> str:
    response = client.audio.speech.create(
        model="tts-1",  
        voice="nova", 
        input=text,  
        response_format="aac"
    )
    
    audio_data = response.content  
    
    with open(filename, 'wb') as audio_file:
        audio_file.write(audio_data)

    return filename  

