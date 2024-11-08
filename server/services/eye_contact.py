import cv2
import dlib
import numpy as np

detector = dlib.get_frontal_face_detector()
datFile = "services/shape_predictor_68_face_landmarks.dat"
predictor = dlib.shape_predictor(datFile)

def eye_contact(frame):
    """
    Detect if the person is making eye contact in the given video frame.
    Returns True if eye contact is detected, otherwise False.
    """
    # Resize frame to speed up processing
    frame = cv2.resize(frame, (640, 480))

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)

    if not faces:
        return False 

    for face in faces:
        landmarks = predictor(gray, face)

        # Eye regions based on facial landmarks
        left_eye = [landmarks.part(i) for i in range(36, 42)]
        right_eye = [landmarks.part(i) for i in range(42, 48)]

        # Convert points to numpy arrays for easier processing
        left_eye_points = np.array([(p.x, p.y) for p in left_eye], np.int32)
        right_eye_points = np.array([(p.x, p.y) for p in right_eye], np.int32)

        # Extract x-coordinates from numpy array (first column of the arrays)
        left_eye_x = left_eye_points[:, 0]
        right_eye_x = right_eye_points[:, 0]
        left_eye_y = left_eye_points[:, 1]
        right_eye_y = right_eye_points[:, 1]

        # Calculate the center of the face (using face bounding box)
        face_center_x = (face.left() + face.right()) // 2
        face_center_y = (face.top() + face.bottom()) // 2

        # Check if both eyes are close to the center of the face
        # Eye alignment with face center: both horizontally and vertically
        horizontal_alignment = np.abs(np.mean(left_eye_x) - face_center_x) < 50 and \
                               np.abs(np.mean(right_eye_x) - face_center_x) < 50
        vertical_alignment = np.abs(np.mean(left_eye_y) - face_center_y) < 50 and \
                             np.abs(np.mean(right_eye_y) - face_center_y) < 50

        if horizontal_alignment and vertical_alignment:
            return True  # Eye contact detected (aligned with face center)

    return False
