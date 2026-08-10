import os
import uuid
import shutil
from fastapi import UploadFile

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def save_upload_file(upload_file: UploadFile, prefix: str = "") -> str:
    """
    Saves an uploaded file to the local filesystem and returns the URL/path.
    In V1, this returns a local path. In V2 (S3), this will return an S3 URL.
    """
    file_ext = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{prefix}{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return f"/{file_path}"
