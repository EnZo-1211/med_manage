from sqlalchemy.orm import Session
from app.medicines.models import Medicine
from app.medicines.schemas import MedicineCreate
from app.medicines.provider import get_medicine_provider, MedicineCandidate
from typing import List

def search_medicines(query: str) -> List[MedicineCandidate]:
    provider = get_medicine_provider()
    return provider.search(query)

def create_medicine(db: Session, medicine: MedicineCreate) -> Medicine:
    # Check if we already have it by external_id and source to avoid duplicates
    if medicine.external_id and medicine.external_source:
        existing = db.query(Medicine).filter(
            Medicine.external_id == medicine.external_id,
            Medicine.external_source == medicine.external_source
        ).first()
        if existing:
            return existing

    db_medicine = Medicine(**medicine.model_dump())
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine
