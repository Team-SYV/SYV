import os
import json
import logging
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

import logging
import json

# Set up logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)

def generate_feedback(question, answer, wpm, eye_contact):
    prompt = f"""

        Imagine you are an instructor providing feedback on my interview performance. 
        
        Evaluate the following based on the given input:
        - **Question**: {question}
        - **Answer**: {answer}
        - **Words Per Minute (WPM)**: {wpm}
        - **Eye Contact Percentage**: {eye_contact}%

        **Provide a thorough and detailed feedback on:**
        1. **Grammar**: Start with "Your" and evaluate grammatical accuracy, focusing on errors like subject-verb agreement, sentence structure, tense consistency, and article usage. Provide specific corrections for errors and suggest improved versions of the sentences. Rate this aspect out of 5.
        2. **Relevance**: Start with "Your" and assess how well the answer addresses the question. Suggest a better response if necessary. Rate out of 5.
        3. **Filler Words**: Start with "Your" and note excessive use of fillers (e.g., "um," "uh"). Suggest ways to reduce them. Rate out of 5.
        4. **Pace of Speech**: Start with "Your" and evaluate pace based on {wpm} WPM. Comment if it's too fast, slow, or appropriate.
        5. **Eye Contact**: Start with "Your" and evaluate eye contact effectiveness ({eye_contact}%). Suggest improvements if necessary.
        6. **Tips**: Provide an ideal response to the question based on the given answer. If the given answer is incorrect, lacking, or no answer is provided, suggest an ideal response that directly addresses the question as though you were the one answering it.

        **Output Format** (in JSON):
        {{
            "grammar": "<feedback>",
            "relevance": "<feedback>",
            "filler": "<feedback>",
            "pace_of_speech": "<feedback>",
            "eye_contact": "<feedback>",
            "tips": "<tips feedback>",
            "grammar_rating": <1-5>,
            "relevance_rating": <1-5>,
            "filler_rating": <1-5>,
            "pace_of_speech_rating": {get_wpm_rating(wpm)},
            "eye_contact_rating": {get_eye_contact_rating(eye_contact)}
        }}
    """

    # Call OpenAI API (simulated as client.chat.completions.create here)
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert interview answer reviewer."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1000
    )

    # Retrieve feedback
    feedback = completion.choices[0].message.content

    # Clean feedback and handle JSON parsing
    feedback_cleaned = feedback.strip("` \n")
    if feedback_cleaned.lower().startswith("json"):
        feedback_cleaned = feedback_cleaned[4:].strip()

    # logging.info(f"Feedback: {feedback_cleaned}")

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
            "eye_contact": "",
            "tips": "",
            "grammar_rating": 0,
            "relevance_rating": 0,
            "filler_rating": 0,
            "pace_of_speech_rating": get_wpm_rating(wpm),
            "eye_contact_rating": get_eye_contact_rating(eye_contact),
        }

    return feedback_dict

def generate_feedback_virtual(questions, answers, wpm, eye_contact):
    
    # Input validation
    if not (len(questions) == len(answers) == len(wpm) == len(eye_contact)):
        raise ValueError("The number of questions, answers, WPM, and eye contact values must match.")

    if not questions:
        raise ValueError("Questions cannot be empty.")


    # Calculate mean WPM and eye contact ratings
    mean_wpm_rating = (sum(get_wpm_rating(w) for w in wpm)) / len(wpm)
    mean_eye_contact_rating = sum(get_eye_contact_rating(e) for e in eye_contact) / len(eye_contact)

    # Construct the prompt
    prompt = """
        Imagine you are my instructor providing feedback on my interview performance.  
        
        Based on the interviewee's answers to the following questions, provide detailed feedback on their overall performance, focusing on:
        1. **Grammar**: Start with "Your" and evaluate grammatical accuracy, focusing on errors like subject-verb agreement, sentence structure, tense consistency, and article usage. Provide specific corrections for errors and suggest improved versions of the sentences. Rate this aspect out of 5.
        2. **Relevance**: Start with "Your" and assess how well the answer addresses the question. Suggest a better response if necessary. Rate out of 5.
        3. **Filler Words**: Start with "Your" and note excessive use of fillers (e.g., "um," "uh"). Suggest ways to reduce them. Rate out of 5 where 5 has no use of fillers and 1 is excessive use of fillers.
        4. **Pace of Speech**: Start with "Your" and evaluate pace based on {wpm} WPM. Comment if it's too fast, slow, or appropriate.
        5. **Eye Contact**: Start with "Your" and evaluate eye contact effectiveness ({eye_contact}%). Suggest improvements if necessary.
        
    """

    prompt += f"""
        Evaluate the following based on the given input:
            - Question: "{questions}"
            - Answer: "{answers}"
            - WPM: {wpm}
            - Eye Contact: {eye_contact}%
        """

    prompt += f"""
        Additionally, rate each category out of 5.
        Format your response in the following JSON structure:
         {{
            "grammar": "<cumulative feedback on grammar>",
            "relevance": "<cumulative feedback on answer relevance>",
            "filler": "<cumulative feedback on filler words>",
            "pace_of_speech": "<cumulative feedback on the overall pace>",
            "eye_contact": "<cumulative feedback on eye contact percentage>",
            "tips": "<improvement tips>",
            "grammar_rating": "<cumulative rating for grammar>",
            "relevance_rating": "<cumulative rating for answer relevance>",
            "filler_rating": "<cumulative rating for filler words>",
            "pace_of_speech_rating": { round(mean_wpm_rating)},
            "eye_contact_rating": {round(mean_eye_contact_rating)}
        }}
    """

    # Call the OpenAI API
    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert interview reviewer."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000  
        )
        feedback = completion.choices[0].message.content
    except Exception as e:
        logging.error(f"Error during OpenAI API call: {e}")
        return {
            "error": "Failed to generate feedback due to an API error.",
        }

    # Parse the feedback response
    feedback_cleaned = feedback.strip("` \n")
    logging.info(f"Feedback: {feedback_cleaned}")

    try:
        feedback_dict = json.loads(feedback_cleaned)
    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse feedback as JSON: {e}")
        feedback_dict = {
            "grammar": "",
            "relevance": "",
            "filler": "",
            "pace_of_speech": "",
            "eye_contact": "",
            "tips": "",
            "grammar_rating": 0,
            "relevance_rating": 0,
            "filler_rating": 0,
            "pace_of_speech_rating":round(mean_wpm_rating),
            "eye_contact_rating": round(mean_eye_contact_rating),
        }

    return feedback_dict
def get_wpm_rating(wpm):
    """
    Scale words per minute (WPM) to a rating from 0 to 5.
    """
    if wpm < 90 or wpm > 180: 
        return 1
    elif 90 <= wpm <= 99 or 171 <= wpm <= 180:
        return 2
    elif 100 <= wpm <= 109 or 161 <= wpm <= 170:
        return 3
    elif 110<= wpm <= 119 or 151 <= wpm <= 160:  
        return 4
    elif 120 <= wpm <= 150:     
        return 5  

def get_eye_contact_rating(eye_contact):
    """
    Scale eye contact percentage to a rating from 0 to 5.
    """
    if eye_contact == 0:
        return 0
    elif 1 <= eye_contact <= 20:
        return 1
    elif 21 <= eye_contact <= 40:
        return 2
    elif 41 <= eye_contact <= 60:
        return 3
    elif 61 <= eye_contact <= 80:
        return 4
    elif 81 <= eye_contact <= 100:
        return 5
    else:
        return 0 