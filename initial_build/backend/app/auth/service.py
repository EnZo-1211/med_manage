from datetime import datetime, timedelta
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from sqlalchemy.orm import Session
import jwt

from app.core.config import settings
from app.auth.models import User, PatientUser, AccessStatus


def verify_google_id_token(token: str) -> dict:
    # Raises ValueError if invalid, expired, or issued for a different client ID
    return id_token.verify_oauth2_token(token, google_requests.Request(), settings.GOOGLE_CLIENT_ID)


def get_or_create_user(db: Session, google_payload: dict) -> User:
    user = db.query(User).filter(User.google_sub == google_payload["sub"]).first()
    if user:
        return user

    user = User(
        email=google_payload["email"],
        google_sub=google_payload["sub"],
        name=google_payload.get("name"),
        avatar_url=google_payload.get("picture"),
    )
    db.add(user)
    db.flush()

    # claim any pending invites sent to this email before they'd signed in
    pending = db.query(PatientUser).filter(
        PatientUser.invited_email == user.email,
        PatientUser.status == AccessStatus.invited,
    ).all()
    for invite in pending:
        invite.user_id = user.id
        invite.status = AccessStatus.active

    db.commit()
    db.refresh(user)
    return user


def create_session_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_session_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
