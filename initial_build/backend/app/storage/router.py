from fastapi import APIRouter, UploadFile, File
from app.storage import service
from pydantic import BaseModel

router = APIRouter(prefix="/storage", tags=["storage"])

class UploadResponse(BaseModel):
    url: str

@router.post("/upload", response_model=UploadResponse)
async def upload_image(file: UploadFile = File(...)):
    # Validate file type if necessary, here we accept images
    url = service.save_upload_file(file, prefix="img_")
    return {"url": url}
