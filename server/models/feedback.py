from pydantic import BaseModel
from typing import Optional, List


class GenerateFeedbackInput(BaseModel):
    answer_id: Optional [str] = None 
    interview_id: Optional [str] = None
    answer: str
    question: str
    wpm: float
    eye_contact: float


class GenerateVirtualFeedbackInput(BaseModel):
    interview_id: Optional[str] = None
    answers: List[str]
    questions: List[str]
    wpm: List[float]
    eye_contact: List[float]


class GetFeedbackResponse(BaseModel):
    answer_id: Optional [str] = None 
    interview_id: Optional [str] = None
    answer_relevance: str
    eye_contact: str
    grammar: str
    pace_of_speech: str
    filler_words: str
    tips:str

class GetRecordFeedbackResponse(BaseModel):
    answer_id: Optional [str] = None 
    interview_id: Optional [str] = None
    answer_relevance: str
    eye_contact: str
    grammar: str
    pace_of_speech: str
    filler_words: str
    tips:str
    question: str


class CreateFeedbackResponse(BaseModel):
    feedback_id: str

class GetFeedback(BaseModel):
    feedback_id: str