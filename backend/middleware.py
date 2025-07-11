from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import PremiumFeature, Session as DBSession

PREMIUM_ENDPOINTS = {"/resonance/link", "/mood"}

class PremiumMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        if request.url.path in PREMIUM_ENDPOINTS:
            token = request.query_params.get("session_token")
            if not token:
                raise HTTPException(status_code=403, detail="premium access required")
            db: Session = SessionLocal()
            try:
                session = db.query(DBSession).filter_by(token=token).first()
                has_feature = db.query(PremiumFeature).filter_by(session_id=session.id).first() if session else None
            finally:
                db.close()
            if not has_feature:
                raise HTTPException(status_code=403, detail="premium feature")
        response = await call_next(request)
        return response
