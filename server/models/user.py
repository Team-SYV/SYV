from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    email: str
    image: Optional[str] = None

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    image: Optional[str] = None
