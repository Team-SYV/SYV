import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def generate_interview_questions( industry, experience_level, interview_type, job_description, company_name, job_role, resume_text=None):
    prompt = f"""
            You are a hiring manager in the {industry} industry conducting an interview for a {job_role} position{'' if company_name is None else ' at ' + company_name}.

            The details of the interview are as follows:
            - Interview type: {interview_type}
            - Candidate's experience level: {experience_level}.
            - Job description: { '' if job_description is None else job_description }
            - Resume details: { '' if resume_text is None else resume_text }

            Please generate **5 interview questions**.
            1. Start with an introductory question, such as 'Tell me about yourself and a brief background,' 
            2. Ensure the questions are simple, short, and easy to understand.
        """
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert interview question generator."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1000
    )

    response_text = completion.choices[0].message.content

    questions = response_text.split('\n') 

    # Filter and clean the questions, retaining only those that are numbered
    questions = [q.strip() for q in questions if q.strip() and q.strip()[0].isdigit()]

    return questions

def generate_answer_feedback(previous_question, previous_answer):
    prompt = f"""

    Previous question: {previous_question}
    Previous answer: {previous_answer}
    
    Please provide a one short sentence starting with "You" that either gives positive praise or indicates if the answer is unclear. 
    If it's unclear or lacking, suggest an example answer.
    Keep it simple and easy to understand.
    """

    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an experienced hiring manager in giving feedback."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=200
    )

    response_text = completion.choices[0].message.content.strip()

    return response_text

