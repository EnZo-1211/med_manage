from sqlalchemy.orm import Session
from app.medications.models import PatientMedication
from app.medications.schemas import PatientMedicationCreate, PatientMedicationUpdate
import uuid
from typing import List

from app.medicines.models import Medicine
from app.medications.schemas import DashboardMedicationResponse

def get_active_medications(db: Session, patient_id: uuid.UUID) -> List[DashboardMedicationResponse]:
    results = db.query(PatientMedication, Medicine).join(
        Medicine, PatientMedication.medicine_id == Medicine.id
    ).filter(
        PatientMedication.patient_id == patient_id,
        PatientMedication.is_active == True
    ).all()
    
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
            notes=pm.notes
        ))
    return dashboard_items

def add_medication(db: Session, medication: PatientMedicationCreate) -> PatientMedication:
    db_med = PatientMedication(**medication.model_dump())
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    return db_med

def remove_medication(db: Session, medication_id: uuid.UUID) -> bool:
    # Soft delete
    db_med = db.query(PatientMedication).filter(PatientMedication.id == medication_id).first()
    if not db_med:
        return False
    db_med.is_active = False
    db.commit()
    return True

def update_medication(db: Session, medication_id: uuid.UUID, update_data: PatientMedicationUpdate) -> PatientMedication | None:
    """
    To keep dosage history, we soft-delete the old medication record and 
    create a new active one with the updated values.
    """
    old_med = db.query(PatientMedication).filter(PatientMedication.id == medication_id, PatientMedication.is_active == True).first()
    if not old_med:
        return None

    # Soft delete the old record
    old_med.is_active = False

    # Create new record starting from the old data
    new_data = {
        "patient_id": old_med.patient_id,
        "medicine_id": old_med.medicine_id,
        "dose": old_med.dose,
        "frequency": old_med.frequency,
        "route": old_med.route,
        "instructions": old_med.instructions,
        "start_date": old_med.start_date,
        "end_date": old_med.end_date,
        "notes": old_med.notes
    }

    # Override with new values
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        new_data[key] = value

    new_med = PatientMedication(**new_data)
    db.add(new_med)
    db.commit()
    db.refresh(new_med)
    return new_med
