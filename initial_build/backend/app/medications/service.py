from sqlalchemy.orm import Session
from sqlalchemy import func
from app.medications.models import PatientMedication, PatientMedicationHistory
from app.medications.schemas import PatientMedicationCreate, PatientMedicationUpdate
import uuid
from typing import List

from app.medicines.models import Medicine
from app.medications.schemas import DashboardMedicationResponse

from app.auth.models import User

def get_patient_medications(db: Session, patient_id: uuid.UUID) -> List[DashboardMedicationResponse]:
    results = db.query(PatientMedication, Medicine, User).join(
        Medicine, PatientMedication.medicine_id == Medicine.id
    ).outerjoin(
        User, PatientMedication.created_by == User.id
    ).filter(
        PatientMedication.patient_id == patient_id,
        PatientMedication.is_deleted == False
    ).order_by(PatientMedication.created_at.desc()).all()
    
    dashboard_items = []
    for pm, med, user in results:
        dashboard_items.append(DashboardMedicationResponse(
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
            is_active=pm.is_active,
            added_by_name=user.name if user else None,
            added_by_email=user.email if user else None
        ))
    return dashboard_items

from app.activity.service import log_activity

def add_medication(db: Session, medication: PatientMedicationCreate, user_id: uuid.UUID) -> PatientMedication:
    db_med = PatientMedication(**medication.model_dump())
    db_med.created_by = user_id
    db_med.updated_by = user_id
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    
    # Create initial history record
    history = PatientMedicationHistory(
        patient_medication_id=db_med.id,
        dose=db_med.dose
    )
    db.add(history)
    db.flush()

    med_info = db.query(Medicine).filter(Medicine.id == db_med.medicine_id).first()
    med_name = med_info.name if med_info else str(db_med.medicine_id)
    
    log_activity(
        db, patient_id=db_med.patient_id, user_id=user_id,
        action="medicine_added", target_type="medicine",
        target_id=db_med.id, details=med_name
    )

    db.commit()
    return db_med

def remove_medication(db: Session, medication_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    # Soft delete
    db_med = db.query(PatientMedication).filter(PatientMedication.id == medication_id).first()
    if not db_med:
        return False
        
    med_info = db.query(Medicine).filter(Medicine.id == db_med.medicine_id).first()
    med_name = med_info.name if med_info else str(db_med.medicine_id)
    
    log_activity(
        db, patient_id=db_med.patient_id, user_id=user_id,
        action="medicine_removed", target_type="medicine",
        target_id=db_med.id, details=med_name
    )
    
    db_med.is_deleted = True
    db_med.updated_by = user_id

    current_history = db.query(PatientMedicationHistory).filter(
        PatientMedicationHistory.patient_medication_id == medication_id,
        PatientMedicationHistory.end_date.is_(None)
    ).first()
    if current_history:
        current_history.end_date = func.now()
        
    db.commit()
    return True

def update_medication(db: Session, medication_id: uuid.UUID, update_data: PatientMedicationUpdate, user_id: uuid.UUID) -> PatientMedication | None:
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
        
    med.updated_by = user_id

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

    if dose_changed or deactivated or reactivated:
        action_name = "medicine_updated"
        if deactivated:
            action_name = "medicine_deactivated"
        elif reactivated:
            action_name = "medicine_reactivated"
            
        med_info = db.query(Medicine).filter(Medicine.id == med.medicine_id).first()
        med_name = med_info.name if med_info else str(med.medicine_id)
        
        log_activity(
            db, patient_id=med.patient_id, user_id=user_id,
            action=action_name, target_type="medicine",
            target_id=med.id, details=med_name
        )

    db.commit()
    db.refresh(med)
    return med
