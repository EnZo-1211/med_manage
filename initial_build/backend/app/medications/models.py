import uuid
from sqlalchemy import Column, String, Date, Boolean, DateTime, Text, ForeignKey, func
from sqlalchemy import Uuid as UUID
from app.core.database import Base

class PatientMedication(Base):
    __tablename__ = "patient_medications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    medicine_id = Column(UUID(as_uuid=True), ForeignKey("medicines.id"), nullable=False)
    dose = Column(String, nullable=False)
    frequency = Column(String, nullable=False)
    route = Column(String, nullable=True)
    instructions = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), nullable=True)
    updated_by = Column(UUID(as_uuid=True), nullable=True)
