from fastapi import FastAPI, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from .routers import events, matching, resonance, artwork
from .middleware import PremiumMiddleware
from . import models
import uuid
import redis.asyncio as aioredis
import os

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

redis = aioredis.from_url(os.getenv("REDIS_URL", "redis://localhost"))

# group all API routes under /api
api_router = APIRouter()
api_router.include_router(events.router)
api_router.include_router(matching.router)
api_router.include_router(resonance.router)
api_router.include_router(artwork.router)

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
