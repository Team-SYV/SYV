import pytest
from unittest.mock import MagicMock

from services.transcribe_audio import transcribe_audio

def test_transcribe_audio(mocker):
    # Mock the OpenAI client
    mock_openai_client = mocker.patch("services.transcribe_audio.client")
    mock_audio_transcription = MagicMock()
    
    # Set up a fake response from the API
    mock_audio_transcription.create.return_value = {
        "text": "This is a test transcription.",
        "segments": [
            {"end": 10}
        ]
    }
    mock_openai_client.audio.transcriptions = mock_audio_transcription
    
    # Call the function with a dummy file path
    dummy_file_path = "dummy_audio_path.mp3"
    
    # Mock the file opening process
    mocker.patch("builtins.open", mocker.mock_open(read_data="dummy data"))
    
    # Run the function
    result = transcribe_audio(dummy_file_path)
    
    # Verify the output
    assert result['transcript'] == "This is a test transcription."
    assert result['words_per_minute'] == pytest.approx(30.0, 0.1)  

def test_no_answer_provided(mocker):
    # Mock the OpenAI client
    mock_openai_client = mocker.patch("services.transcribe_audio.client")
    mock_audio_transcription = MagicMock()
    
    # Set up a fake response with "you" as the transcription
    mock_audio_transcription.create.return_value = {
        "text": "you",
        "segments": [
            {"end": 5}
        ]
    }
    mock_openai_client.audio.transcriptions = mock_audio_transcription
    
    # Call the function with a dummy file path
    dummy_file_path = "dummy_audio_path.mp3"
    
    # Mock the file opening process
    mocker.patch("builtins.open", mocker.mock_open(read_data="dummy data"))
    
    # Run the function
    result = transcribe_audio(dummy_file_path)
    
    # Verify the output
    assert result['transcript'] == "No answer provided."
    assert result['words_per_minute'] == 0
