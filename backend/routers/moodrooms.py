from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models, schemas

router = APIRouter(prefix="/moodrooms", tags=["moodrooms"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_session(db: Session, token: str):
    return db.query(models.Session).filter_by(token=token).first()


@router.get("/", response_model=list[schemas.MoodRoomOut])
def list_rooms(db: Session = Depends(get_db)):
    return db.query(models.MoodRoom).all()


@router.post("/", response_model=schemas.MoodRoomOut)
def create_room(room: schemas.MoodRoomCreate, session_token: str, db: Session = Depends(get_db)):
    session = get_session(db, session_token)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    user = db.query(models.User).get(session.user_id) if session.user_id else None
    if not user or not user.is_premium:
        raise HTTPException(status_code=403, detail="Premium required")
    db_room = models.MoodRoom(title=room.title, schedule=room.schedule, creator_id=user.id)
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room


@router.get("/{room_id}", response_model=schemas.MoodRoomOut)
def get_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(models.MoodRoom).get(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Not found")
    return room
