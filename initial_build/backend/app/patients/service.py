from sqlalchemy.orm import Session
from app.patients.models import Patient
from app.patients.schemas import PatientCreate, PatientUpdate
import uuid

def generate_patient_code(db: Session) -> str:
    # A simple generator for prototype: P-XXXX
    # In production, this would be more robust to prevent collisions
    import random
    while True:
        code = f"P-{random.randint(10000, 99999)}"
        exists = db.query(Patient).filter(Patient.patient_code == code).first()
        if not exists:
            return code

def create_patient(db: Session, patient: PatientCreate) -> Patient:
    patient_code = generate_patient_code(db)
    db_patient = Patient(**patient.model_dump(), patient_code=patient_code)
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def get_patient(db: Session, patient_id: uuid.UUID) -> Patient:
    return db.query(Patient).filter(Patient.id == patient_id).first()

def get_patients(db: Session, skip: int = 0, limit: int = 100) -> list[Patient]:
    return db.query(Patient).offset(skip).limit(limit).all()

def update_patient(db: Session, patient_id: uuid.UUID, patient_update: PatientUpdate) -> Patient:
    db_patient = get_patient(db, patient_id)
    if db_patient:
        update_data = patient_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_patient, key, value)
        db.commit()
        db.refresh(db_patient)
    return db_patient
