from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.core.database import get_db
from app.access import schemas, service

router = APIRouter(prefix="/access", tags=["access"])

@router.post("/create", response_model=schemas.AccessResponse)
def create_access(access: schemas.AccessCreate, db: Session = Depends(get_db)):
    return service.create_patient_access(db=db, access=access)

@router.post("/login", response_model=schemas.LoginResponse)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    patient_id = service.verify_login(db, request.patient_code, request.access_code)
    if not patient_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect patient code or access code",
        )
    # For V1 prototype, returning patient_id as the token representation.
    # In V2, replace with a real JWT encoding the patient_id and roles.
    return {"access_token": str(patient_id), "patient_id": patient_id}
