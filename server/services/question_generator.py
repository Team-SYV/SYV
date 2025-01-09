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

def generate_follow_up(previous_question, previous_answer, next_question, type):
    prompt = ""
    if(type == "0"):
        prompt = f"""
        Previous question: {previous_question}
        Previous answer: {previous_answer}
        
        Respond with:
        1. "A short praise or statement if the answer is unclear, followed by a follow-up question based on the answer provided.
        """
    elif(type == "1"):
        prompt = f"""
        Previous question: {previous_question}
        Previous answer: {previous_answer}
        
        Respond with:
          1. A short praise or statement if the answer is unclear and say that we are moving on to the next question.
        """
    else:
        prompt = f"""
        Previous question: {previous_question}
        Previous answer: {previous_answer}

        Respond with:
        1. A short acknowledgement of the answer.        
        """

    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an experienced hiring manager skilled at evaluating responses and crafting follow-up questions."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=200
    )

    response_text = completion.choices[0].message.content.strip()

    try:
        lines = response_text.split("\n")
        follow_up_question = lines[0].replace("Follow-up question: ", "").strip()
        return follow_up_question
    except (IndexError, ValueError):
        return "Could you clarify further?"