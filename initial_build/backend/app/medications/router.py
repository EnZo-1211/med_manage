from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.medications import schemas, service

router = APIRouter(prefix="/medications", tags=["medications"])

@router.get("/patient/{patient_id}", response_model=List[schemas.DashboardMedicationResponse])
def get_patient_medications(patient_id: uuid.UUID, db: Session = Depends(get_db)):
    # This also acts as the Dashboard API aggregation endpoint
    return service.get_active_medications(db, patient_id)

@router.post("/", response_model=schemas.PatientMedicationResponse)
def add_medication(medication: schemas.PatientMedicationCreate, db: Session = Depends(get_db)):
    return service.add_medication(db=db, medication=medication)

@router.patch("/{medication_id}", response_model=schemas.PatientMedicationResponse)
def update_medication(medication_id: uuid.UUID, update_data: schemas.PatientMedicationUpdate, db: Session = Depends(get_db)):
    new_med = service.update_medication(db, medication_id, update_data)
    if not new_med:
        raise HTTPException(status_code=404, detail="Active medication not found")
    return new_med

@router.delete("/{medication_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_medication(medication_id: uuid.UUID, db: Session = Depends(get_db)):
    success = service.remove_medication(db, medication_id)
    if not success:
        raise HTTPException(status_code=404, detail="Medication not found")
    return
