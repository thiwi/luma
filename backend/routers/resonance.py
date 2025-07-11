from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..database import SessionLocal

router = APIRouter(prefix="/resonance", tags=["resonance"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/link")
def create_link(session_token: str, target_token: str, db: Session = Depends(get_db)):
    session = db.query(models.Session).filter_by(token=session_token).first()
    target = db.query(models.Session).filter_by(token=target_token).first()
    if not session or not target:
        raise HTTPException(status_code=404, detail="Session not found")
    link = models.SilentLink(session_a=session.id, session_b=target.id)
    db.add(link)
    db.commit()
    return {"detail": "linked"}

@router.get("/links")
def list_links(session_token: str, db: Session = Depends(get_db)):
    session = db.query(models.Session).filter_by(token=session_token).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    links = db.query(models.SilentLink).filter(
        (models.SilentLink.session_a == session.id) | (models.SilentLink.session_b == session.id)
    ).all()
    return links
