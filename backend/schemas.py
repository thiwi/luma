from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    is_premium: bool
    is_admin: bool

    model_config = ConfigDict(from_attributes=True)

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


class MoodRoomCreate(BaseModel):
    title: str
    schedule: Optional[str] = None


class MoodRoomOut(MoodRoomCreate):
    id: int
    creator_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
