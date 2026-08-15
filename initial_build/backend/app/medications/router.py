from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.auth.routes import get_current_user
from app.auth.models import User
from app.medications import schemas, service

router = APIRouter(prefix="/medications", tags=["medications"])

@router.get("/patient/{patient_id}", response_model=List[schemas.DashboardMedicationResponse])
def get_patient_medications(patient_id: uuid.UUID, db: Session = Depends(get_db)):
    # This also acts as the Dashboard API aggregation endpoint
    return service.get_patient_medications(db, patient_id)

@router.get("/{medication_id}", response_model=schemas.DashboardMedicationResponse)
def get_medication(medication_id: uuid.UUID, db: Session = Depends(get_db)):
    from app.medications.models import PatientMedication
    from app.medicines.models import Medicine
    
    result = db.query(PatientMedication, Medicine).join(
        Medicine, PatientMedication.medicine_id == Medicine.id
    ).filter(PatientMedication.id == medication_id).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Medication not found")
        
    pm, med = result
    return schemas.DashboardMedicationResponse(
        id=pm.id,
        patient_id=pm.patient_id,
        medicine_id=pm.medicine_id,
        medicine_name=med.name,
        medicine_image=med.primary_image_url,
        dose=pm.dose,
        frequency=pm.frequency,
        time=pm.time,
        day_of_week=pm.day_of_week,
        notes=pm.notes,
        is_active=pm.is_active
    )

@router.post("/", response_model=schemas.PatientMedicationResponse)
def add_medication(medication: schemas.PatientMedicationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return service.add_medication(db=db, medication=medication, user_id=current_user.id)

@router.patch("/{medication_id}", response_model=schemas.PatientMedicationResponse)
def update_medication(medication_id: uuid.UUID, update_data: schemas.PatientMedicationUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_med = service.update_medication(db, medication_id, update_data, user_id=current_user.id)
    if not new_med:
        raise HTTPException(status_code=404, detail="Active medication not found")
    return new_med

@router.delete("/{medication_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_medication(medication_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = service.remove_medication(db, medication_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Medication not found")
    return
