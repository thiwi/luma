from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import SessionLocal
import uuid

router = APIRouter(prefix="/events", tags=["events"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.EventOut)
def create_event(event: schemas.EventCreate, session_token: str, db: Session = Depends(get_db)):
    session = db.query(models.Session).filter_by(token=session_token).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db_event = models.Event(**event.dict(), creator_id=session.id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/", response_model=list[schemas.EventOut])
def list_events(db: Session = Depends(get_db)):
    return db.query(models.Event).all()

@router.get("/{event_id}", response_model=schemas.EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"detail": "deleted"}
