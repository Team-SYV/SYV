import cv2
import dlib
import numpy as np

# Load dlib's face detector and shape predictor (68 face landmarks)
detector = dlib.get_frontal_face_detector()
datFile = "services/shape_predictor_68_face_landmarks.dat"  # Path to the shape predictor model
predictor = dlib.shape_predictor(datFile)

def eye_contact(frame):
    """
    Detect if the person is making eye contact in the given video frame.
    Returns True if eye contact is detected, otherwise False.
    """
    # Convert to grayscale for face detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces in the grayscale image
    faces = detector(gray)

    # If no faces are detected, return False for no eye contact
    if len(faces) == 0:
        return False

    # Process each detected face
    for face in faces:
        # Draw face bounding box for debugging
        cv2.rectangle(frame, (face.left(), face.top()), (face.right(), face.bottom()), (0, 255, 0), 2)

        landmarks = predictor(gray, face)  # Get facial landmarks

        # Draw landmarks for debugging (eyes in blue)
        for n in range(36, 42):  # Left eye landmarks
            cv2.circle(frame, (landmarks.part(n).x, landmarks.part(n).y), 2, (255, 0, 0), -1)
        for n in range(42, 48):  # Right eye landmarks
            cv2.circle(frame, (landmarks.part(n).x, landmarks.part(n).y), 2, (255, 0, 0), -1)

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

        # Relaxed alignment thresholds (adjusted from 80 to 100)
        horizontal_alignment = np.abs(eyes_center[0] - face_center_x) < 100
        vertical_alignment = np.abs(eyes_center[1] - face_center_y) < 100

        # If both horizontal and vertical alignment are satisfied, return True (eye contact)
        if horizontal_alignment and vertical_alignment:
            return True  # Eye contact detected

    return False  # No eye contact detected


def process_video(video_path: str):
    """
    Process the video to detect eye contact in each frame and calculate the percentage of eye contact frames.
    """
    # Initialize variables
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():

        return {"eye_contact_percentage": 0}
    
    eye_contact_count = 0
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break  # Exit loop when the video ends or there's an error

        frame_count += 1

        # Check for eye contact in the current frame
        if eye_contact(frame):
            eye_contact_count += 1

    # Release the video resource
    cap.release()

    # Calculate eye contact percentage
    eye_contact_ratio = (eye_contact_count / frame_count) * 100 if frame_count > 0 else 0
    return {"eye_contact_percentage": eye_contact_ratio}
