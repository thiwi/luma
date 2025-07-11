from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..database import SessionLocal
import random

router = APIRouter(prefix="/match", tags=["match"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def match_events(session_token: str, db: Session = Depends(get_db)):
    session = db.query(models.Session).filter_by(token=session_token).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    events = db.query(models.Event).filter(models.Event.creator_id != session.id).all()
    random.shuffle(events)
    return events[:3]
