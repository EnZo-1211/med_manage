import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy import Uuid as UUID
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    google_sub = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AccessRole(str, enum.Enum):
    owner = "owner"
    caregiver = "caregiver"
    viewer = "viewer"


class AccessStatus(str, enum.Enum):
    invited = "invited"
    active = "active"
    revoked = "revoked"


class PatientUser(Base):
    __tablename__ = "patient_users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    invited_email = Column(String, nullable=False)
    role = Column(Enum(AccessRole), default=AccessRole.caregiver)
    status = Column(Enum(AccessStatus), default=AccessStatus.invited)
    created_at = Column(DateTime, default=datetime.utcnow)
