import cv2
import dlib
import numpy as np

# Lazy initialization for dlib models
detector = None
predictor = None


def initialize_models():
    global detector, predictor
    if detector is None or predictor is None:
        detector = dlib.get_frontal_face_detector()
        datFile = "services/shape_predictor_68_face_landmarks.dat"
        predictor = dlib.shape_predictor(datFile)


def eye_contact(frame):
    """
    Detect if the person is looking in the direction of the screen (relaxed eye contact).
    Returns True if the relaxed gaze alignment is detected, otherwise False.
    """
    initialize_models()

    # Convert to grayscale for face detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces in the grayscale image
    faces = detector(gray)

    # If no faces are detected, return False for no relaxed eye contact
    if len(faces) == 0:
        return False

    # Process each detected face
    for face in faces:
        landmarks = predictor(gray, face)  # Get facial landmarks

        # Eye regions based on facial landmarks
        left_eye = [landmarks.part(i) for i in range(36, 42)]
        right_eye = [landmarks.part(i) for i in range(42, 48)]

        # Calculate the center of the eyes (midpoint between left and right eye)
        left_eye_center = np.mean([(p.x, p.y) for p in left_eye], axis=0)
        right_eye_center = np.mean([(p.x, p.y) for p in right_eye], axis=0)

        # Calculate the midpoint between the two eyes
        eyes_center = ((left_eye_center[0] + right_eye_center[0]) // 2,
                       (left_eye_center[1] + right_eye_center[1]) // 2)

        # Calculate the center of the face (using face bounding box)
        face_center_x = (face.left() + face.right()) // 2
        face_center_y = (face.top() + face.bottom()) // 2

        # Simulate looking at the screen by offsetting the face center horizontally
        screen_offset_x = 50 
        screen_center_x = face_center_x + screen_offset_x

        # Relaxed alignment thresholds
        horizontal_alignment = np.abs(eyes_center[0] - screen_center_x) < 200
        vertical_alignment = np.abs(eyes_center[1] - face_center_y) < 200

        # If both horizontal and vertical alignment are satisfied, return True (relaxed gaze)
        if horizontal_alignment and vertical_alignment:
            return True  

    return False  

def process_eye_contact(video_path: str):
    """
    Process the video to detect eye contact in each frame and calculate the percentage of eye contact frames.
    """
    initialize_models()

    # Initialize variables
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {"eye_contact_percentage": 0}

    eye_contact_count = 0
    frame_count = 0
    frame_skip_rate = 12  

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break  # Exit loop when the video ends or there's an error

        if frame_count % frame_skip_rate != 0:
            frame_count += 1
            continue

        frame_count += 1

        # Check for eye contact in the current frame
        if eye_contact(frame):
            eye_contact_count += 1

    # Release the video resource
    cap.release()

    # Calculate eye contact percentage
    eye_contact_ratio = (eye_contact_count / frame_count) * 100 if frame_count > 0 else 0
    return {"eye_contact_percentage": eye_contact_ratio}
