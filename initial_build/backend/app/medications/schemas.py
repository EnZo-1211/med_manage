from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class PatientMedicationBase(BaseModel):
    patient_id: UUID
    medicine_id: UUID
    dose: str
    frequency: str
    route: Optional[str] = None
    instructions: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None

class PatientMedicationCreate(PatientMedicationBase):
    pass

class PatientMedicationUpdate(BaseModel):
    dose: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = None
    instructions: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class PatientMedicationResponse(PatientMedicationBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class DashboardMedicationResponse(BaseModel):
    id: UUID
    patient_id: UUID
    medicine_id: UUID
    medicine_name: str
    medicine_image: Optional[str] = None
    dose: str
    frequency: str
    notes: Optional[str] = None
    time: str = "08:00 AM" # hardcoded for V1 UI
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

