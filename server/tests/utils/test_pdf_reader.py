pytest_plugins = ["pytest_asyncio"]

import pytest
from fastapi import UploadFile, HTTPException
from unittest.mock import AsyncMock, Mock, mock_open, patch
from utils.pdf_reader import pdf_reader, read_pdf


@pytest.mark.asyncio
async def test_pdf_reader():
    # Mock PDF content
    mock_pdf_content = b"Mock PDF content"
    mock_file_name = "test.pdf"

    # Mock UploadFile object
    mock_upload_file = AsyncMock(spec=UploadFile)
    mock_upload_file.filename = mock_file_name
    mock_upload_file.read.return_value = mock_pdf_content

    # Patch file handling and PDF reading
    with patch("builtins.open", mock_open()) as mocked_open, \
         patch("utils.pdf_reader.read_pdf", return_value="Extracted text from PDF") as mocked_read_pdf:

        # Call the pdf_reader function
        result = await pdf_reader(mock_upload_file)

        # Verify the mocked file operations
        mocked_open.assert_called_once_with(f"/tmp/{mock_file_name}", "wb")
        mocked_open().write.assert_called_once_with(mock_pdf_content)

        # Verify the read_pdf function call
        mocked_read_pdf.assert_called_once_with(f"/tmp/{mock_file_name}")

        # Assert the result
        assert result == "Extracted text from PDF"


@pytest.mark.asyncio
async def test_pdf_reader_exception():
    # Mock UploadFile object with invalid content
    mock_upload_file = AsyncMock(spec=UploadFile)
    mock_upload_file.filename = "test.pdf"
    mock_upload_file.read.side_effect = Exception("File read error")

    # Ensure pdf_reader raises an HTTPException on failure
    with pytest.raises(HTTPException) as exc_info:
        await pdf_reader(mock_upload_file)

    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Failed to process the uploaded file"


def test_read_pdf():
    # Mock PdfReader behavior
    mock_file_path = "/mock/path/test.pdf"
    mock_pages = [
        Mock(),  # Mock page object for page 1
        Mock(),  # Mock page object for page 2
    ]
    mock_pages[0].extract_text.return_value = "Page 1 text "
    mock_pages[1].extract_text.return_value = "Page 2 text"

    with patch("utils.pdf_reader.PdfReader") as MockPdfReader:
        # Set up the mock PdfReader
        MockPdfReader.return_value.pages = mock_pages

        # Call the read_pdf function
        result = read_pdf(mock_file_path)

        # Verify the result
        assert result == "Page 1 text Page 2 text"

        # Verify the PdfReader was called correctly
        MockPdfReader.assert_called_once_with(mock_file_path)
