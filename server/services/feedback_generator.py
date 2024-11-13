import os
import json
import logging
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def generate_feedback(question, answer, wpm, eye_contact):
    prompt = f"""
        You are a hiring manager conducting an interview.
        Please provide feedback on the answer given to the question, focusing on:
        1. Grammar: Comment on the grammatical accuracy of the response.
        2. Answer Relevance: Assess how directly and thoroughly the answer addresses the question.
        3. Filler Words: Note any excessive use of filler words or phrases.
        4. Pace of Speech: based on words per minute.
        5. Eye Contact: based on the eye contact percentage.
        6. Tips: give tips to the interviewee to improve their interview skills, in paragraph mode.

        The question was: "{question}"

        The response was: "{answer}"

        The pace was "{wpm} words per minute

        The eye contact percentage was {eye_contact}

        Additionally, rate each of them out of 5.

        Please format your response in the following JSON structure:
        {{
            "grammar": "<your feedback on grammar>",
            "relevance": "<your feedback on answer relevance>",
            "filler": "<your feedback on filler words>",
            "pace_of_speech": "<your feedback on the pace>",
            "eye_contact": "<your feedback on eye contact percentage>"
            "tips": "<your given tips>"
            "grammar_rating": "<your rating on grammar, should be a number>" 
            "relevance_rating": "<your rating on answer relevance, should be a number>",
            "filler_rating": "<your rating on filler words, should be a number>",
            "pace_of_speech_rating": "<your rating on the pace, should be a number>",
            "eye_contact_rating": "<your rating on eye contact percentage, should be a number>"
        }}
    """

    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
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
        You are a hiring manager conducting an interview.
        Based on the interviewee's answers to the following questions, provide cumulative feedback on their overall performance, focusing on:
        1. Grammar: Comment on the grammatical accuracy across answers.
        2. Answer Relevance: Assess how directly and thoroughly answers address each question.
        3. Filler Words: Note any excessive use of filler words across responses.
        4. Pace of Speech: based on the words per minute across all answers.
        5. Eye Contact: based on the eye contact percentage across all answers.
        6. Tips: provide improvement tips to the interviewee, in paragraph format.

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
