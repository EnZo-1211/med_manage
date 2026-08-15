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
    time: Optional[str] = None
    day_of_week: Optional[str] = None
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
    time: Optional[str] = None
    day_of_week: Optional[str] = None
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
    time: Optional[str] = None
    day_of_week: Optional[str] = None
    is_active: bool
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    added_by_name: Optional[str] = None
    added_by_email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

