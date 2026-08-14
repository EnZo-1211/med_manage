from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.reports.models import PatientReport
from app.reports.schemas import PatientReportResponse
from app.storage.service import save_upload_file

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/patient/{patient_id}", response_model=PatientReportResponse)
async def upload_report(
    patient_id: UUID,
    file: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    try:
        url = save_upload_file(file, prefix="report_")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File upload failed: {str(e)}")

    new_report = PatientReport(
        patient_id=patient_id,
        file_path=url,
        file_name=file.filename,
        notes=notes
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@router.get("/patient/{patient_id}", response_model=List[PatientReportResponse])
def get_patient_reports(patient_id: UUID, db: Session = Depends(get_db)):
    return db.query(PatientReport).filter(PatientReport.patient_id == patient_id).order_by(PatientReport.created_at.desc()).all()

@router.delete("/{report_id}")
def delete_report(report_id: UUID, db: Session = Depends(get_db)):
    report = db.query(PatientReport).filter(PatientReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}
