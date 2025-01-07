import pytest
from unittest.mock import patch, MagicMock
from services.eye_contact import initialize_models, eye_contact, process_eye_contact


@patch("services.eye_contact.dlib")
def test_initialize_models(mock_dlib):
    # Mock detector and predictor
    mock_detector = MagicMock()
    mock_predictor = MagicMock()

    mock_dlib.get_frontal_face_detector.return_value = mock_detector
    mock_dlib.shape_predictor.return_value = mock_predictor

    # Call initialize_models
    initialize_models()

    # Verify that the dlib models are initialized
    mock_dlib.get_frontal_face_detector.assert_called_once()
    mock_dlib.shape_predictor.assert_called_once_with("services/shape_predictor_68_face_landmarks.dat")


@patch("services.eye_contact.dlib")
@patch("services.eye_contact.cv2")
def test_eye_contact(mock_cv2, mock_dlib):
    mock_frame = MagicMock()
    mock_gray_frame = MagicMock()
    mock_cv2.cvtColor.return_value = mock_gray_frame

    mock_face = MagicMock()
    mock_face.left.return_value = 50
    mock_face.right.return_value = 150
    mock_face.top.return_value = 50
    mock_face.bottom.return_value = 150

    mock_landmark = MagicMock()
    mock_landmark.part.side_effect = lambda i: MagicMock(x=75 + (i % 6), y=75 + (i % 6))  

    mock_dlib.get_frontal_face_detector.return_value.return_value = [mock_face]
    mock_dlib.shape_predictor.return_value = lambda gray, face: mock_landmark

    result = eye_contact(mock_frame)

    mock_cv2.cvtColor.assert_called_once_with(mock_frame, mock_cv2.COLOR_BGR2GRAY)
    assert result is False
    
@patch("services.eye_contact.dlib")
@patch("services.eye_contact.cv2")
@patch("services.eye_contact.initialize_models")
def test_process_eye_contact(mock_initialize_models, mock_cv2, mock_dlib):
    # Mock video capture
    mock_cap = MagicMock()
    mock_cap.isOpened.side_effect = [True, True, True, False]
    mock_cap.read.side_effect = [
        (True, "frame1"),
        (True, "frame2"),
        (True, "frame3"),
        (False, None),
    ]
    mock_cv2.VideoCapture.return_value = mock_cap

    # Mock eye_contact
    with patch("services.eye_contact.eye_contact", side_effect=[True, False, True]) as mock_eye_contact:
        result = process_eye_contact("mock_video.mp4")

    # Verify
    mock_cv2.VideoCapture.assert_called_once_with("mock_video.mp4")
    mock_initialize_models.assert_called_once()

    # Ensure that eye_contact is called one times
    assert mock_eye_contact.call_count == 1
    print(mock_eye_contact.call_count)

    # Verify the eye contact percentage is correct (50%)
    assert result["eye_contact_percentage"] == pytest.approx(50.0, rel=1e-2)