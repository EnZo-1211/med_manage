import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy import Uuid as UUID
from app.core.database import Base


class PatientActivity(Base):
    __tablename__ = "patient_activity"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)        # "medicine_added", "medicine_deactivated", "access_granted"
    target_type = Column(String, nullable=True)    # "medicine", "access"
    target_id = Column(UUID(as_uuid=True), nullable=True)
    details = Column(String, nullable=True)         # short summary, e.g. "Paracetamol 500mg"
    created_at = Column(DateTime, default=datetime.utcnow)
