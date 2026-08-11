from sqlalchemy.orm import Session
from app.medications.models import PatientMedication
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

    # Update existing record
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(med, key, value)

    db.commit()
    db.refresh(med)
    return med
