import unittest
from unittest.mock import MagicMock
import json

from services.feedback_generator import generate_feedback, generate_feedback_virtual, get_eye_contact_rating, get_wpm_rating

class TestInterviewFeedback(unittest.TestCase):

    def setUp(self):
        # Mock the OpenAI client
        global client
        client = MagicMock()

        # Mock the completion response
        self.mock_feedback = {
            "grammar": "Your grammar was accurate overall.",
            "relevance": "Your answer addressed the question well.",
            "filler": "Your use of filler words was minimal.",
            "pace_of_speech": "Your pace was appropriate.",
            "eye_contact": "Your eye contact was effective.",
            "tips": "Consider adding examples to strengthen your answers.",
            "grammar_rating": 5,
            "relevance_rating": 5,
            "filler_rating": 5,
            "pace_of_speech_rating": 4,
            "eye_contact_rating": 4,
        }

        client.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content=json.dumps(self.mock_feedback)))]
        )

    def test_get_wpm_rating(self):
        self.assertEqual(get_wpm_rating(80), 1)
        self.assertEqual(get_wpm_rating(95), 2)
        self.assertEqual(get_wpm_rating(105), 3)
        self.assertEqual(get_wpm_rating(115), 4)
        self.assertEqual(get_wpm_rating(130), 5)

    def test_get_eye_contact_rating(self):
        self.assertEqual(get_eye_contact_rating(10), 1)
        self.assertEqual(get_eye_contact_rating(35), 2)
        self.assertEqual(get_eye_contact_rating(50), 3)
        self.assertEqual(get_eye_contact_rating(70), 4)
        self.assertEqual(get_eye_contact_rating(90), 5)
        self.assertEqual(get_eye_contact_rating(0), 0)

    def test_generate_feedback(self):
        question = "What is your greatest strength?"
        answer = "I am a quick learner and adapt well."
        wpm = 120
        eye_contact = 80

        feedback = generate_feedback(question, answer, wpm, eye_contact)
        self.assertIn("grammar", feedback)
        self.assertIn("relevance", feedback)
        self.assertIn("filler", feedback)
        self.assertIn("pace_of_speech", feedback)
        self.assertIn("eye_contact", feedback)

    def test_generate_feedback_virtual(self):
        questions = ["What is your greatest strength?", "What are your weaknesses?"]
        answers = ["I am a quick learner.", "I sometimes overthink problems."]
        wpms = [120, 110]
        eye_contacts = [80, 75]

        feedback = generate_feedback_virtual(questions, answers, wpms, eye_contacts)
        self.assertIn("grammar", feedback)
        self.assertIn("relevance", feedback)
        self.assertIn("filler", feedback)
        self.assertIn("pace_of_speech", feedback)
        self.assertIn("eye_contact", feedback)
        self.assertEqual(feedback["pace_of_speech_rating"], 4)
        self.assertEqual(feedback["eye_contact_rating"], 4)

    def test_generate_feedback_virtual_input_validation(self):
        with self.assertRaises(ValueError):
            generate_feedback_virtual(
                ["Question 1"], ["Answer 1"], [120], []
            )

        with self.assertRaises(ValueError):
            generate_feedback_virtual([], [], [], [])

if __name__ == "__main__":
    unittest.main()
