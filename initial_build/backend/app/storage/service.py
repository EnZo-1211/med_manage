import os
import uuid
import shutil
from fastapi import UploadFile
from app.core.config import settings

# Initialize Supabase client if configured
supabase_client = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        from supabase import create_client, Client
        supabase_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except ImportError:
        print("Warning: supabase package not installed but SUPABASE_URL is set.")
        supabase_client = None

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def save_upload_file(upload_file: UploadFile, prefix: str = "") -> str:
    """
    Saves an uploaded file to Supabase if configured, otherwise local filesystem.
    """
    file_ext = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{prefix}{uuid.uuid4()}{file_ext}"
    
    # Upload to Supabase if client is initialized
    if supabase_client:
        # Determine bucket based on prefix as per deployment guide
        bucket_name = "medicine-images" if prefix == "img_" else "prescription-uploads"
        
        try:
            # Read file content
            file_content = upload_file.file.read()
            # Upload to Supabase Storage
            response = supabase_client.storage.from_(bucket_name).upload(
                file=file_content,
                path=unique_filename,
                file_options={"content-type": upload_file.content_type}
            )
            
            # Get public URL
            public_url = supabase_client.storage.from_(bucket_name).get_public_url(unique_filename)
            return public_url
            
        except Exception as e:
            print(f"Error uploading to Supabase: {e}")
            # Reset file pointer if we fall back to local upload
            upload_file.file.seek(0)
    
    # Fallback / Local upload
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    url_path = file_path.replace("\\", "/")
    return f"/{url_path}"

