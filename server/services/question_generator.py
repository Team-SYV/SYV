import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def generate_interview_questions(type, industry, experience_level, interview_type, job_description, company_name, job_role, resume_text=None):
    prompt = ""
    if (type == "RECORD"):

        prompt = f"""
            You are a hiring manager in the {industry} conducting an interview for a {job_role} position{'' if company_name is None else ' at ' + company_name}.

            The details of the interview are as follows:
            Interview type is {interview_type}, and the candidate's experience level is {experience_level}.
            Job description: {'' if job_description is None else job_description}.
            Resume details: {'' if resume_text is None else resume_text}.

            Please generate **5 interview questions**.
            Ensure the first question is an introductory one, such as 'Tell me about yourself and a brief background,' 
            Please ensure they are simple, short, straightforward, and easy to understand.
           
        """

    elif(type == "VIRTUAL"):

        prompt = f"""
            You are a hiring manager in the {industry} conducting an interview for a {job_role} position{'' if company_name is None else ' at ' + company_name}.

            The details of the interview are as follows:
            Interview type is {interview_type}, and the candidate's experience level is {experience_level}.
            Job description: {'' if job_description is None else job_description}.
            Resume details: {'' if resume_text is None else resume_text}.

            Please generate **10 interview questions**.
            Ensure the first question is an introductory one, such as 'Tell me about yourself and a brief background,' 
            Please ensure they are simple, short, straightforward, and easy to understand.
            Speak like we’re having coffee and your are asking me this questions.
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
    
    Please provide one short sentence starting with "You" that either gives positive praise or indicates if the answer is unclear. 
    If the answer is unclear, suggest how they could answer and improve next time.
    Speak like we’re having coffee and you’re excited to share your knowledge.
    Dont include emojis.
    """

    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an experienced hiring manager in giving feedback."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=50
    )

    response_text = completion.choices[0].message.content.strip()

    return response_text

