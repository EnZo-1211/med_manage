import os
import sys

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.patients.models import Patient
from app.access.models import PatientAccess
from app.core.security import hash_access_code
import uuid
from datetime import date

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if patient exists
        existing = db.query(Patient).filter(Patient.patient_code == "100").first()
        if not existing:
            print("Creating test patient with ID '100'...")
            # Create patient 100
            patient_id = uuid.uuid4()
            test_patient = Patient(
                id=patient_id,
                patient_code="100",
                name="Test Patient",
                date_of_birth=date(1950, 1, 1),
                gender="O",
            )
            db.add(test_patient)
            
            # Create access code 'bou'
            print("Creating access code 'bou'...")
            hashed_code = hash_access_code("bou")
            test_access = PatientAccess(
                patient_id=patient_id,
                access_code_hash=hashed_code,
                status="ACTIVE"
            )
            db.add(test_access)
            db.commit()
            print("Test data seeded successfully!")
        else:
            print("Test patient '100' already exists.")
            
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
