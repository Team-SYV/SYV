from pydantic import BaseModel
from typing import Optional, List


class CreateRecordFeedbackInput(BaseModel):
    answer_id: str
    interview_id: str
    answer: str
    question: str
    wpm: float
    eye_contact: float


class CreateVirtualFeedbackInput(BaseModel):
    interview_id: str
    answers: List[str]
    questions: List[str]
    wpm: List[float]
    eye_contact: List[float]

class CreateFeedbackResponse(BaseModel):
    feedback_id: str
    ratings_data: dict


class GetFeedbackResponse(BaseModel):
    answer_id: Optional [str] = None 
    interview_id: Optional [str] = None
    answer_relevance: str
    eye_contact: str
    grammar: str
    pace_of_speech: str
    filler_words: str
    tips:str
    question: Optional[str] = None


class CreateFeedbackResponse(BaseModel):
    feedback_id: str
    ratings_data: dict

class GetFeedback(BaseModel):
    feedback_id: str