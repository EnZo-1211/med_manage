from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class PatientReportBase(BaseModel):
    notes: Optional[str] = None
    file_name: Optional[str] = None

class PatientReportUpdate(BaseModel):
    file_name: Optional[str] = None
    notes: Optional[str] = None

class PatientReportResponse(PatientReportBase):
    id: UUID
    patient_id: UUID
    file_path: str
    created_at: datetime

    class Config:
        orm_mode = True
