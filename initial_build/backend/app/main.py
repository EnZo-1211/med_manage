from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.patients.router import router as patients_router
from app.auth.routes import router as auth_router
from app.storage.router import router as storage_router
from app.medicines.router import router as medicines_router
from app.medications.router import router as medications_router
from app.reports.router import router as reports_router
from app.core.database import Base, engine

# Import all models to ensure create_all works
from app.auth.models import User, PatientUser
from app.activity.models import PatientActivity

# Create tables for SQLite if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients_router)
app.include_router(auth_router)
app.include_router(storage_router)
app.include_router(medicines_router)
app.include_router(medications_router)
app.include_router(reports_router)

if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Medication Management API"}

@app.get("/health")
def health():
    return {"status": "ok"}

