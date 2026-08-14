from sqlalchemy.orm import Session
from sqlalchemy import func
from app.medications.models import PatientMedication, PatientMedicationHistory
from app.medications.schemas import PatientMedicationCreate, PatientMedicationUpdate
import uuid
from typing import List

from app.medicines.models import Medicine
from app.medications.schemas import DashboardMedicationResponse

def get_patient_medications(db: Session, patient_id: uuid.UUID) -> List[DashboardMedicationResponse]:
    results = db.query(PatientMedication, Medicine).join(
        Medicine, PatientMedication.medicine_id == Medicine.id
    ).filter(
        PatientMedication.patient_id == patient_id
    ).order_by(PatientMedication.created_at.desc()).all()
    
    dashboard_items = []
    for pm, med in results:
        dashboard_items.append(DashboardMedicationResponse(
            id=pm.id,
            patient_id=pm.patient_id,
            medicine_id=pm.medicine_id,
            medicine_name=med.name,
            medicine_image=med.primary_image_url,
            dose=pm.dose,
            frequency=pm.frequency,
            notes=pm.notes,
            is_active=pm.is_active
        ))
    return dashboard_items

def add_medication(db: Session, medication: PatientMedicationCreate) -> PatientMedication:
    db_med = PatientMedication(**medication.model_dump())
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    
    # Create initial history record
    history = PatientMedicationHistory(
        patient_medication_id=db_med.id,
        dose=db_med.dose
    )
    db.add(history)
    db.commit()
    
    return db_med

def remove_medication(db: Session, medication_id: uuid.UUID) -> bool:
    # Hard delete
    db_med = db.query(PatientMedication).filter(PatientMedication.id == medication_id).first()
    if not db_med:
        return False
    db.delete(db_med)
    db.commit()
    return True

def update_medication(db: Session, medication_id: uuid.UUID, update_data: PatientMedicationUpdate) -> PatientMedication | None:
    """
    Updates the medication record in-place.
    """
    med = db.query(PatientMedication).filter(PatientMedication.id == medication_id).first()
    if not med:
        return None

    old_dose = med.dose
    old_is_active = med.is_active

    # Update existing record
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(med, key, value)

    # Handle history updates
    dose_changed = old_dose != med.dose
    deactivated = (old_is_active is True and med.is_active is False)
    reactivated = (old_is_active is False and med.is_active is True)

    if dose_changed or deactivated or reactivated:
        current_history = db.query(PatientMedicationHistory).filter(
            PatientMedicationHistory.patient_medication_id == medication_id,
            PatientMedicationHistory.end_date.is_(None)
        ).first()
        if current_history:
            current_history.end_date = func.now()
            
    if dose_changed or reactivated:
        new_history = PatientMedicationHistory(
            patient_medication_id=medication_id,
            dose=med.dose
        )
        db.add(new_history)

    db.commit()
    db.refresh(med)
    return med
