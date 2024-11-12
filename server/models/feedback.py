from pydantic import BaseModel
from typing import Optional

class GenerateFeedbackInput(BaseModel):
    answer_id: Optional [str] = None 
    interview_id: Optional [str] = None
    answer: str
    question: str
    wpm: str
    eye_contact: str

class GetFeedbackResponse(BaseModel):
    answer_id: Optional [str] = None 
    interview_id: Optional [str] = None
    answer_relevance: str
    eye_contact: str
    grammar: str
    pace_of_speech: str
    filler_words: str
    tips:str

class CreateFeedbackResponse(BaseModel):
    feedback_id: str

class GetFeedback(BaseModel):
    feedback_id: str
