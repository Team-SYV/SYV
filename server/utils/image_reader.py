from fastapi import HTTPException
from PIL import Image
import pytesseract

from utils.clean_text import clean_text

async def image_reader(file_path: str) -> str:
    try:
        # Open the image using PIL
        image = Image.open(file_path)

        # Extract text using pytesseract
        extracted_text = pytesseract.image_to_string(image)

        return clean_text(extracted_text)

    except Exception as e:
        raise HTTPException(status_code=500, detail="Error occurred during OCR processing, {e}")

def read_image(file_path: str) -> str:
    try:
        # Open the image using PIL
        image = Image.open(file_path)

        # Extract text using pytesseract
        text = pytesseract.image_to_string(image)

        return text
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error occurred during OCR processing")
