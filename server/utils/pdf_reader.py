from pypdf import PdfReader
from fastapi import HTTPException

async def pdf_reader(file):
    try:
        file_path = f"/tmp/{file.filename}"
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        resume_text = read_pdf(file_path)
        return resume_text

    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to process the uploaded file")
    

def read_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    num_pages = len(reader.pages)
    all_text = ""

    for page_num in range(num_pages):
        page = reader.pages[page_num]
        text = page.extract_text()
        all_text += text

    return all_text

