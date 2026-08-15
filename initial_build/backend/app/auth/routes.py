from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
import jwt

from app.core.database import get_db
from app.auth.service import (
    verify_google_id_token, get_or_create_user,
    create_session_token, decode_session_token,
)
from app.auth.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


class GoogleLoginRequest(BaseModel):
    id_token: str


class SessionResponse(BaseModel):
    session_token: str
    email: str
    name: str | None
    avatar_url: str | None


@router.post("/google", response_model=SessionResponse)
def login_with_google(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        google_payload = verify_google_id_token(payload.id_token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    user = get_or_create_user(db, google_payload)
    session_token = create_session_token(user)

    return SessionResponse(
        session_token=session_token,
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url,
    )


def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.removeprefix("Bearer ").strip()

    try:
        payload = decode_session_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please sign in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid session")

    import uuid
    try:
        user_id = uuid.UUID(payload["sub"])
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid user ID in token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
