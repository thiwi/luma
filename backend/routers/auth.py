from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from passlib.hash import bcrypt
from ..database import SessionLocal
from .. import models, schemas
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter_by(email=user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User exists")
    hashed = bcrypt.hash(user.password)
    db_user = models.User(email=user.email, password_hash=hashed, is_premium=True)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    token = str(uuid.uuid4())
    session = models.Session(token=token)
    session.user_id = db_user.id
    db.add(session)
    db.commit()
    return db_user


@router.post("/login", response_model=schemas.SessionOut)
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter_by(email=user.email).first()
    if not db_user or not bcrypt.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = str(uuid.uuid4())
    session = models.Session(token=token)
    session.user_id = db_user.id
    db.add(session)
    db.commit()
    return {"token": token}
