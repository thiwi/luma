from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

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
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
