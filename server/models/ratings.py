from pydantic import BaseModel

class createRatingsInput(BaseModel):
    interview_id:str
    answer_relevance: float
    eye_contact: float
    grammar: float
    pace_of_speech: float
    filler_words: float

class createRatingsResponse(BaseModel):
    ratings_id: str
    
class getRatingsInput(BaseModel):
    interview_id: str

class getRatingsResponse(BaseModel):
    answer_relevance: float
    eye_contact: float
    grammar: float
    pace_of_speech: float
    filler_words: float
