from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class AccessCreate(BaseModel):
    patient_id: UUID
    access_code: str

class AccessResponse(BaseModel):
    id: UUID
    patient_id: UUID
    status: str
    created_at: datetime
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    patient_code: str
    access_code: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    patient_id: UUID
