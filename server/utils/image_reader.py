import base64
import os
from fastapi import HTTPException
from openai import OpenAI

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def encode_image(image_path:str):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def image_reader(file_path: str) -> str:
    try:
        base64_image = encode_image(file_path)
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an AI assistant that extracts text from images."},
                {"role": "user", "content": [
                    {"type": "text", "text": "Extract text from this image:"},
                    {"type": "image_url",
                    "image_url": {
                        "url": f"data:image/png;base64,{base64_image}"}}
                ]}
            ],
            max_tokens=500
        )        
        return response.choices[0].message.content.replace('\n', ' ').replace('�', '')
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error occurred during OCR processing: {str(e)}{file_path}")
