from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.patients.router import router as patients_router
from app.access.router import router as access_router
from app.storage.router import router as storage_router
from app.medicines.router import router as medicines_router
from app.medications.router import router as medications_router
from app.core.database import Base, engine

# Create tables for SQLite if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients_router)
app.include_router(access_router)
app.include_router(storage_router)
app.include_router(medicines_router)
app.include_router(medications_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Medication Management API"}
