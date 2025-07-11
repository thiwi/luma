from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from .database import SessionLocal
from . import models
from datetime import date


def connections_per_mood(db: Session):
    return db.query(models.Event.mood, func.count()).group_by(models.Event.mood).all()


def daily_resonance_counts(db: Session):
    return (
        db.query(func.date(models.Event.created_at), func.count())
        .group_by(func.date(models.Event.created_at))
        .all()
    )


def common_themes(db: Session):
    return db.query(models.Event.symbol, func.count()).group_by(models.Event.symbol).order_by(func.count().desc()).limit(5).all()


def gather_stats():
    db = SessionLocal()
    try:
        return {
            "mood_counts": connections_per_mood(db),
            "daily": daily_resonance_counts(db),
            "themes": common_themes(db),
        }
    finally:
        db.close()
