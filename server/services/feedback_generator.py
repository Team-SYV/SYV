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
        You are an expert in interview feedback.

        Please provide concise, easy to understand, straightforward, human-like, and a detailed feedback on the following aspects:
        
        1. Grammar: Start feedback with "Your" and evaluate the grammatical accuracy of the answer:"{answer}", noting any errors and suggesting a corrected version.
        2. Relevance: Start feedback with "Your" and assess how directly and comprehensively the answer: {answer} addresses the question: "{question}". If it does not address the question, suggest a more appropriate response."
        3. Filler Words: Start feedback with "Your" and identify any excessive use of filler words and pauses (like "um," "uh," "like," etc.), and comment on how they may impact the response’s clarity and user's confidence.
        4. Pace of Speech: Start feedback with 'Your' and evaluate the pace of speech based on the words per minute ({wpm} WPM). Suggest adjustments if needed to enhance comprehension and impact."
        5. Eye Contact: Start feedback with "Your" and assess eye contact effectiveness, given the eye contact percentage of ({eye_contact}%), and discuss its effect on overall engagement and user's confidence with the interviewer.
        6. Tips: Provide an ideal response to the question: "{question}" based on the given answer: "{answer}". Phrase the response as if you were answering the question yourself. If the given answer is incorrect or no answer is provided, suggest an ideal response that directly addresses the question in a clear and effective manner, written as though you were the one answering it.

        Additionally, rate each of them out of 5.

        Please format your response in the following JSON structure:
        {{
            "grammar": "<your feedback on grammar>",
            "relevance": "<your feedback on answer relevance>",
            "filler": "<your feedback on filler words>",
            "pace_of_speech": "<your feedback on the pace>",
            "eye_contact": "<your feedback on eye contact percentage>",
            "tips": "<your given tips and ideal answer>",
            "grammar_rating": "<your rating on grammar, should be a number>", 
            "relevance_rating": "<your rating on answer relevance, should be a number>",
            "filler_rating": "<your rating on filler words, should be a number>",
            "pace_of_speech_rating": { get_wpm_rating(wpm)},
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
    logging.info(f"Raw feedback from OpenAI: {feedback}")

    # Clean feedback and handle JSON parsing
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
            "eye_contact": "",
            "tips": "",
            "grammar_rating": 0,
            "relevance_rating": 0,
            "filler_rating": 0,
            "pace_of_speech_rating": get_wpm_rating(wpm),
            "eye_contact_rating": get_eye_contact_rating(eye_contact),
        }

    return feedback_dict

def generate_virtual_feedback(questions, answers, wpm, eye_contact):
    """
    Generate cumulative feedback for multiple questions and answers, incorporating mean ratings for WPM and eye contact.
    """
    # Input validation
    if not (len(questions) == len(answers) == len(wpm) == len(eye_contact)):
        raise ValueError("The number of questions, answers, WPM, and eye contact values must match.")

    if not questions:
        raise ValueError("Questions cannot be empty.")

    # Generate individual feedback data
    individual_feedback = []
    for i in range(len(questions)):
        feedback_item = {
            "question": questions[i],
            "answer": answers[i],
            "wpm": wpm[i],
            "eye_contact": eye_contact[i],
        }
        individual_feedback.append(feedback_item)

    # Calculate mean WPM and eye contact ratings
    mean_wpm_rating = (sum(get_wpm_rating(w) for w in wpm)) / len(wpm)
    mean_eye_contact_rating = sum(get_eye_contact_rating(e) for e in eye_contact) / len(eye_contact)

    # Construct the prompt
    prompt = """
        You are an expert in interview feedback.
        Based on the interviewee's answers to the following questions, provide detailed and cumulative feedback on their overall performance, focusing on:
        1. Grammar: Start feedback with "Your" and evaluate the grammatical accuracy of the response, noting any errors and suggesting a corrected version.
        2. Relevance: Start feedback with "Your" and assess how directly and comprehensively the answer addresses the question". If it does not address the question, suggest a more appropriate response."
        3. Filler Words: Start feedback with "Your" and identify any excessive use of filler words or pauses (like "um," "uh," "like," etc.), and comment on how they may impact the response’s clarity and user's confidence.
        4. Pace of Speech: Start feedback with "Your" and evaluate the pace based on the words per minute ({wpm} WPM) and suggest if adjustments are needed for better comprehension or impact.
        5. Eye Contact: Start feedback with "Your" and assess eye contact effectiveness, given the eye contact percentage ({eye_contact}%), and discuss its effect on the overall engagement and user's confidence with the interviewer.
        
        Here are the questions and answers:
    """

    for feedback in individual_feedback:
        prompt += f"""
            - Question: "{feedback['question']}"
            - Answer: "{feedback['answer']}"
            - WPM: {feedback['wpm']}
            - Eye Contact: {feedback['eye_contact']}%
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
            max_tokens=1000  # Adjust for token limits
        )
        feedback = completion.choices[0].message.content
    except Exception as e:
        logging.error(f"Error during OpenAI API call: {e}")
        return {
            "error": "Failed to generate feedback due to an API error.",
        }

    # Parse the feedback response
    feedback_cleaned = feedback.strip("` \n")
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
    elif 90 <= wpm < 100 or 151 <= wpm <= 160:
        return 2
    elif 100 <= wpm < 110 or 161 <= wpm <= 170:
        return 3
    elif 110 <= wpm < 171 <= wpm <= 180:  
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