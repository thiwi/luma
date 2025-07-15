from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("sessions.id"))
    mood = Column(String, nullable=True)
    symbol = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    session = relationship("Session")

class PremiumFeature(Base):
    __tablename__ = "premium_features"
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    feature_name = Column(String)

class SilentLink(Base):
    __tablename__ = "silent_links"
    id = Column(Integer, primary_key=True)
    session_a = Column(Integer, ForeignKey("sessions.id"))
    session_b = Column(Integer, ForeignKey("sessions.id"))

class Mood(Base):
    __tablename__ = "moods"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    lottie_file = Column(String)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_premium = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)


class MoodRoom(Base):
    __tablename__ = "mood_rooms"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    schedule = Column(String, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
