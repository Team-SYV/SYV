from pypdf import PdfReader

def read_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    num_pages = len(reader.pages)
    all_text = ""

    for page_num in range(num_pages):
        page = reader.pages[page_num]
        text = page.extract_text()
        all_text += text

    return all_text
