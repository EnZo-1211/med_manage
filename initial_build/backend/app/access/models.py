import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy import Uuid as UUID
from app.core.database import Base

class PatientAccess(Base):
    __tablename__ = "patient_access"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    access_code_hash = Column(String, nullable=False)
    status = Column(String, default="ACTIVE") # ACTIVE, REVOKED, EXPIRED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
