# MediCare: Medication Management App

This repository contains the V1 build of the MediCare Medication Management application. 

The codebase and documentation for this initial prototype have been moved to the `initial_build/` directory.

## What this App Does

MediCare is a comprehensive dashboard designed to help medical professionals (or caretakers) seamlessly manage patients, track their medication history, and securely store medical records. 

### Key Features
- **Patient Management:** Add, edit, and track patient demographic details (Age, Gender, Patient ID).
- **Medication Tracking:** 
  - Track **Active** and **Inactive** medications for each patient.
  - Deactivate a medication when a course finishes (moving it to the history list).
  - Reactivate an old medication with the option to keep the previous dosage or change it.
- **Prescriptions & Reports Storage:** A dedicated section to upload, store, and view physical prescription images and PDF reports tied to a specific patient.
- **Dynamic UI:** A modern, responsive dashboard with a dynamic sidebar navigation system built using Next.js.

## Contents
* **`initial_build/backend/`** - FastAPI backend application (using SQLite for V1 and Alembic for migrations). Includes a Python multipart file upload service.
* **`initial_build/frontend/`** - Next.js frontend application styled with Tailwind CSS.
* **`initial_build/medication_management_app_architecture_v1.md`** - Original architecture document.
* **`initial_build/update_v1.md`** - Summary of architecture implemented and updates.

## Getting Started
Please navigate to the `initial_build` directory to see the setup instructions for the respective modules.

### Backend Setup
```bash
cd initial_build/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
set PYTHONPATH=.
python -m uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd initial_build/frontend
npm install
npm run dev
```
