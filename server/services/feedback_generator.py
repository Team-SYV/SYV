import os
import json
import logging
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def generate_feedback(question, answer, wpm):
    prompt = f"""
        You are a hiring manager conducting an interview.
        Please provide feedback on the answer given to the question, focusing on:
        1. Grammar: Comment on the grammatical accuracy of the response.
        2. Answer Relevance: Assess how directly and thoroughly the answer addresses the question.
        3. Filler Words: Note any excessive use of filler words or phrases.
        4. Pace of Speech: based on words per minute.
        5. Tips: give tips to the interviewee to improve their interview skills, in paragraph mode.

        The question was: "{question}"

        The response was: "{answer}"

        The pace was "{wpm} words per minute

        Please format your response in the following JSON structure:
        {{
            "grammar": "<your feedback on grammar>",
            "relevance": "<your feedback on answer relevance>",
            "filler": "<your feedback on filler words>",
            "pace_of_speech": "<your feedback on the pace>",
            "tips": "<your given tips>"
        }}
    """

    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an expert interview answer reviewer."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1000
    )

    feedback = completion.choices[0].message.content
    logging.info(f"Raw feedback from OpenAI: {feedback}")

    feedback_cleaned = feedback.strip("` \n")
    
    if feedback_cleaned.lower().startswith("json"):
        feedback_cleaned = feedback_cleaned[4:].strip()

    logging.info(f"Cleaned feedback: {feedback_cleaned}")

    try:
        feedback_dict = json.loads(feedback_cleaned)
        feedback_dict["question"] = question
    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse feedback as JSON: {e}")
        feedback_dict = {
            "grammar": "",
            "relevance": "",
            "filler": "",
            "pace_of_speech": "",
            "tips": "",
        }

    return feedback_dict
