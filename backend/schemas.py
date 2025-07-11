from pydantic import BaseModel
from typing import Optional

class SessionCreate(BaseModel):
    pass

class SessionOut(BaseModel):
    token: str

class EventCreate(BaseModel):
    mood: Optional[str]
    symbol: Optional[str]
    content: str

class EventOut(EventCreate):
    id: int
    creator_id: int
    created_at: str

    class Config:
        orm_mode = True
