from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class PatientBase(BaseModel):
    name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    profile_image_url: Optional[str] = None
    notes: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    profile_image_url: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class PatientResponse(PatientBase):
    id: UUID
    patient_code: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    added_by_name: Optional[str] = None
    added_by_email: Optional[str] = None
    last_updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
