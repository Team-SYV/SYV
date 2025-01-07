import unittest
from unittest.mock import MagicMock, patch
from services.question_generator import generate_answer_feedback, generate_interview_questions

class TestInterviewQuestionGenerator(unittest.TestCase):

    def setUp(self):
        # Mock the OpenAI client
        global client
        client = MagicMock()

        # Mock responses
        self.mock_questions_response = """
            1. Tell me about yourself and a brief background.
            2. What interests you about this role?
            3. Can you share a challenge you've faced in your career and how you handled it?
            4. How do you stay updated with industry trends?
            5. What skills do you bring that make you a strong fit for this position?
        """

        self.mock_feedback_response = "You provided a strong example that aligns well with the question."

    @patch("openai.OpenAI")
    def test_generate_interview_questions(self, MockOpenAI):
        MockOpenAI.return_value = client
        client.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content=self.mock_questions_response))]
        )

        # Test the function
        questions = generate_interview_questions(
            industry="Tech",
            experience_level="Mid-Level",
            interview_type="Behavioral",
            job_description="Design and develop scalable applications.",
            company_name="TechCorp",
            job_role="Software Engineer"
        )

        # Check that the function returns a non-empty list
        self.assertIsInstance(questions, list)
        self.assertGreater(len(questions), 0)
        self.assertTrue(all(isinstance(q, str) for q in questions))

    @patch("openai.OpenAI")
    def test_generate_interview_questions_with_empty_inputs(self, MockOpenAI):
        MockOpenAI.return_value = client
        client.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content=self.mock_questions_response))]
        )

        # Test with minimal inputs
        questions = generate_interview_questions(
            industry="Healthcare",
            experience_level="Entry-Level",
            interview_type="Technical",
            job_description=None,
            company_name=None,
            job_role="Nurse"
        )

        # Check that the function returns a non-empty list
        self.assertIsInstance(questions, list)
        self.assertGreater(len(questions), 0)
        self.assertTrue(all(isinstance(q, str) for q in questions))

if __name__ == "__main__":
    unittest.main()
