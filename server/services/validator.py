import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def validate(job_description: str, resume: str):
    prompt = f"""
        Determine whether this resume: {resume} is a good fit for this job description: {job_description}
        only return true or false
    """
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert job information extractor."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500
    )
    
    # Extract the response from the API correctly
    response = completion.choices[0].message.content.strip().lower()

    # Return the result
    if response == 'true':
        return True
    elif response == 'false':
        return False
    else:
        raise ValueError("Unexpected response from API. Expected 'true' or 'false'.")
