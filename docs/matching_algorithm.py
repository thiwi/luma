"""Soft matching algorithm pseudocode."""
import random

def select_events(user_session, redis_conn, db):
    recent = redis_conn.get(f"recent:{user_session}")
    candidates = db.query(Event).filter(Event.id.notin_(recent)).all()
    random.shuffle(candidates)
    emotionally_relevant = [e for e in candidates if resonates(user_session, e)]
    events = emotionally_relevant[:3]
    redis_conn.set(f"recent:{user_session}", [e.id for e in events], ex=300)
    return events
