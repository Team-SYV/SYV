from fastapi import HTTPException
from PIL import Image
import openai
import io

from utils.clean_text import clean_text

def image_reader(file_path: str) -> str:
    try:
        image = Image.open(file_path)
        
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format=image.format)
        img_byte_arr = img_byte_arr.getvalue()
        
        response = openai.ChatCompletion.create(
            model="gpt-4-vision-preview",
            messages=[
                {"role": "system", "content": "You are an AI assistant that extracts text from images."},
                {"role": "user", "content": [
                    {"type": "text", "text": "Extract text from this image:"},
                    {"type": "image", "image": img_byte_arr}
                ]}
            ],
            max_tokens=500
        )
        
        extracted_text = response["choices"][0]["message"]["content"]
        return clean_text(extracted_text)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error occurred during OCR processing: {str(e)}")


def read_image(file_path: str) -> str:
    try:
        return image_reader(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error occurred during OCR processing: {str(e)}")
