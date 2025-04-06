import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def extract_job_details(string: str):
    prompt = f"""
        Given the following text: {string}

        Extract the following information:
         Industry
         Job Role
         Selected Company
         Selected Experience Level, choices:
           - Entry-Level (0-2 Years)
           - Mid-Level (3-7 Years)
           - Senior-Level (8+ Years)

        Please provide the answers in a structured format.
    """
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert job information extractor."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500
    )

    response_text = completion.choices[0].message.content

    # Parse the response into a structured dictionary, removing any extra characters
    details = {}
    lines = response_text.split("\n")
    for line in lines:
        if ":" in line:
            key, value = line.split(":", 1)
            # Remove leading dashes, asterisks, and extra spaces
            cleaned_key = key.strip("-*").strip().lower().replace(" ", "_")
            cleaned_value = value.strip("*").strip()
            if cleaned_key in ["industry", "job_role", "selected_company", "selected_experience_level"]:
                details[cleaned_key] = cleaned_value

    # Add the original job description to the result
    details["job_description"] = string

    # Return the details as plain JSON
    return json.dumps(details, indent=4)

