from fastapi import FastAPI, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from .routers import events, matching, resonance, artwork, auth, moodrooms
from .middleware import PremiumMiddleware
from . import models
import uuid
import redis.asyncio as aioredis
from redis.exceptions import RedisError
import os
from .fake_redis import FakeRedis

app = FastAPI()
app.add_middleware(PremiumMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def seed_data():
    """Populate the database with a few default events."""
    db = SessionLocal()
    try:
        # Only seed when the tables are empty
        if db.query(models.Event).count() > 0:
            return

        # create a session to own the seed events
        seed_session = models.Session(token="seed")
        db.add(seed_session)
        db.commit()
        db.refresh(seed_session)

        default_events = [
            {"content": "I have a difficult exam tomorrow."},
            {"content": "I am afraid to go home tonight."},
            {"content": "Missing my parents."},
        ]

        for ev in default_events:
            db_event = models.Event(
                creator_id=seed_session.id,
                mood=None,
                symbol=None,
                content=ev["content"],
            )
            db.add(db_event)

        db.commit()
    finally:
        db.close()


seed_data()

# Try to connect to a Redis server if one is configured. Otherwise fall back to
# an in-memory implementation so the application can run without the Redis
# service.
redis_url = os.getenv("REDIS_URL")
if redis_url:
    try:
        redis = aioredis.from_url(redis_url)
        # ensure the connection works
        import asyncio
        asyncio.run(redis.ping())
    except Exception:
        redis = FakeRedis()
else:
    redis = FakeRedis()

# group all API routes under /api
api_router = APIRouter()
api_router.include_router(events.router)
api_router.include_router(matching.router)
api_router.include_router(resonance.router)
api_router.include_router(artwork.router)
api_router.include_router(auth.router)
api_router.include_router(moodrooms.router)

@api_router.post("/session")
async def create_session():
    token = str(uuid.uuid4())
    db = SessionLocal()
    try:
        sess = models.Session(token=token)
        db.add(sess)
        db.commit()
    finally:
        db.close()
    return {"token": token}

app.include_router(api_router, prefix="/api")

@app.websocket("/ws/presence/{event_id}")
async def websocket_endpoint(websocket, event_id: int):
    await websocket.accept()
    await redis.incr(f"event:{event_id}:count")
    try:
        while True:
            count = int(await redis.get(f"event:{event_id}:count"))
            await websocket.send_json({"count": count})
            await websocket.receive_text()
    except Exception:
        pass
    finally:
        await redis.decr(f"event:{event_id}:count")
        await websocket.close()


@app.websocket("/ws/moodrooms/{room_id}")
async def moodroom_ws(websocket, room_id: int):
    await websocket.accept()
    await redis.incr(f"moodroom:{room_id}:count")
    try:
        while True:
            count = int(await redis.get(f"moodroom:{room_id}:count"))
            await websocket.send_json({"count": count})
            await websocket.receive_text()
    except Exception:
        pass
    finally:
        await redis.decr(f"moodroom:{room_id}:count")
        await websocket.close()
