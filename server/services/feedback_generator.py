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
    # Log the inputs
    logging.info(f"Question: {question}")
    logging.info(f"Answer: {answer}")
    logging.info(f"Pace of Speech (WPM): {wpm}")
    logging.info(f"Eye Contact (%): {eye_contact}")
    
    # Prepare the prompt
    prompt = f"""
        You are an expert in interview feedback.

        The question was: "{question}"
        The response was: "{answer}"
        The pace was "{wpm} words per minute
        The eye contact percentage was {eye_contact}
    
         Please provide concise, easy to understand, straightforward, human-like, and a detailed feedback on the following aspects:
        
        1. Grammar: Start feedback with "Your" and evaluate the grammatical accuracy of the response, noting any errors or areas for improvement.
        2. Relevance: Start feedback with "Your" and assess how directly and comprehensively the answer addresses the question, including alignment with the job role or key points.
        3. Filler Words: Start feedback with "Your" and identify any excessive use of filler words or pauses (like "um," "uh," "like," etc.), and comment on how they may impact the response’s clarity and user's confidence.
        4. Pace of Speech: Start feedback with "Your" and evaluate the pace based on the words per minute ({wpm} WPM) and suggest if adjustments are needed for better comprehension or impact.
        5. Eye Contact: Start feedback with "Your" and assess eye contact effectiveness, given the eye contact percentage ({eye_contact}%), and discuss its effect on the overall engagement and user's confidence with the interviewer.
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
            "pace_of_speech_rating": "<your rating on the pace, should be a number>",
            "eye_contact_rating": "<your rating on eye contact percentage, should be a number>"
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
            "pace_of_speech_rating": 0,
            "eye_contact_rating": 0,
        }

    return feedback_dict

def generate_virtual_feedback(questions, answers, wpm, eye_contact):
    # Check if the inputs have consistent lengths
    if not (len(questions) == len(answers) == len(wpm) == len(eye_contact)):
        raise ValueError("The number of questions, answers, WPM, and eye contact data points must match.")
    
    # Generate individual feedback for each question-answer pair
    individual_feedback = []
    for i, (question, answer) in enumerate(zip(questions, answers)):
        individual_feedback.append({
            "question": question,
            "answer": answer,
            "wpm": wpm[i],
            "eye_contact": eye_contact[i]
        })

    # Construct the prompt with cumulative data for OpenAI completion
    prompt = f"""
        You are an expert in interview feedback.
        Based on the interviewee's answers to the following questions, provide detailed and cumulative feedback on their overall performance, focusing on:
        1. Grammar: Start feedback with "Your" and evaluate the grammatical accuracy of the response, noting any errors or areas for improvement.
        2. Relevance: Start feedback with "Your" and assess how directly and comprehensively the answer addresses the question, including alignment with the job role or key points.
        3. Filler Words: Start feedback with "Your" and identify any excessive use of filler words or pauses (like "um," "uh," "like," etc.), and comment on how they may impact the response’s clarity and user's confidence.
        4. Pace of Speech: Start feedback with "Your" and evaluate the pace based on the words per minute ({wpm} WPM) and suggest if adjustments are needed for better comprehension or impact.
        5. Eye Contact: Start feedback with "Your" and assess eye contact effectiveness, given the eye contact percentage ({eye_contact}%), and discuss its effect on the overall engagement and user's confidence with the interviewer.
        
        Here are the questions and answers:
    """

    for item in individual_feedback:
        prompt += f"""
            - Question: "{item['question']}"
            - Answer: "{item['answer']}"
            - Words per minute: {item['wpm']}
            - Eye contact percentage: {item['eye_contact']}
        """

    prompt += """
        Additionally, rate each category out of 5.
        Format your response in the following JSON structure:
        {
            "grammar": "<cumulative feedback on grammar>",
            "relevance": "<cumulative feedback on answer relevance>",
            "filler": "<cumulative feedback on filler words>",
            "pace_of_speech": "<cumulative feedback on the overall pace>",
            "eye_contact": "<cumulative feedback on eye contact percentage>",
            "tips": "<improvement tips>",
            "grammar_rating": "<cumulative rating for grammar>",
            "relevance_rating": "<cumulative rating for answer relevance>",
            "filler_rating": "<cumulative rating for filler words>",
            "pace_of_speech_rating": "<cumulative rating for pace>",
            "eye_contact_rating": "<cumulative rating for eye contact>"
        }
    """

    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert interview reviewer."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1000
    )

    feedback = completion.choices[0].message.content

    feedback_cleaned = feedback.strip("` \n")

    # Parse the response and handle errors if necessary
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
            "pace_of_speech_rating":0,
            "eye_contact_rating": 0,
        }

    return feedback_dict
