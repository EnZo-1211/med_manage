from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.medicines import schemas, service
from app.medicines.provider import MedicineCandidate

router = APIRouter(prefix="/medicines", tags=["medicines"])

@router.get("/search", response_model=List[MedicineCandidate])
def search_medicines(q: str):
    return service.search_medicines(query=q)

@router.post("/", response_model=schemas.MedicineResponse)
def create_medicine(medicine: schemas.MedicineCreate, db: Session = Depends(get_db)):
    # This endpoint is called when a user confirms a medicine from the search results
    # or manually enters a new one. It saves it to the local Postgres DB.
    return service.create_medicine(db=db, medicine=medicine)
