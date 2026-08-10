from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.patients import schemas, service

router = APIRouter(prefix="/patients", tags=["patients"])

@router.post("/", response_model=schemas.PatientResponse)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    return service.create_patient(db=db, patient=patient)

@router.get("/", response_model=List[schemas.PatientResponse])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return service.get_patients(db, skip=skip, limit=limit)

@router.get("/{patient_id}", response_model=schemas.PatientResponse)
def read_patient(patient_id: uuid.UUID, db: Session = Depends(get_db)):
    db_patient = service.get_patient(db, patient_id=patient_id)
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient

@router.patch("/{patient_id}", response_model=schemas.PatientResponse)
def update_patient(patient_id: uuid.UUID, patient: schemas.PatientUpdate, db: Session = Depends(get_db)):
    db_patient = service.update_patient(db, patient_id=patient_id, patient_update=patient)
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient
