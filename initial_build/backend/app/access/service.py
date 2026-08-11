from sqlalchemy.orm import Session
from app.access.models import PatientAccess
from app.patients.models import Patient
from app.access.schemas import AccessCreate
from app.core.security import hash_access_code, verify_access_code
import datetime
import uuid

def create_patient_access(db: Session, access: AccessCreate) -> PatientAccess:
    hashed_code = hash_access_code(access.access_code)
    db_access = PatientAccess(
        patient_id=access.patient_id,
        access_code_hash=hashed_code,
        status="ACTIVE"
    )
    db.add(db_access)
    db.commit()
    db.refresh(db_access)
    return db_access

def verify_login(db: Session, patient_code: str, access_code: str) -> tuple[uuid.UUID, str] | None:
    patient = db.query(Patient).filter(Patient.patient_code == patient_code, Patient.is_active == True).first()
    if not patient:
        return None
    
    # Get active access codes for this patient
    access_records = db.query(PatientAccess).filter(
        PatientAccess.patient_id == patient.id,
        PatientAccess.status == "ACTIVE"
    ).all()
    
    for record in access_records:
        if verify_access_code(access_code, record.access_code_hash):
            # Update last used
            record.last_used_at = datetime.datetime.now(datetime.timezone.utc)
            db.commit()
            return patient.id, record.role
            
    return None
