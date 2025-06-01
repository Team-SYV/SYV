import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def validate(job_description: str, resume: str):
    prompt = f"""
        You are an expert job recruiter. Evaluate whether the resume: {resume} is a strong match for the job description: {job_description}. 
        A strong match means the resume demonstrates all key skills, qualifications, and experience levels explicitly required in the job description. 
        Ignore superficial similarities and focus on specific requirements like years of experience.
        Return only 'true' if the resume meets all key requirements; otherwise, return 'false'.
    """
    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert job information extractor."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500
        )
        
        response = completion.choices[0].message.content.strip().lower()
        
        if response == 'true':
            return True
        elif response == 'false':
            return False
        else:
            return False  
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return False