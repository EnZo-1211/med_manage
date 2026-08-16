# MediCare: Medication Management App

This repository contains the full build of the MediCare Medication Management application.

## Live Deployment Links
* **Frontend (Vercel):** [https://med-manage-gules.vercel.app](https://med-manage-gules.vercel.app)
* **Backend API (Render):** [https://med-manage-api.onrender.com](https://med-manage-api.onrender.com)

## What this App Does

MediCare is a comprehensive dashboard designed to help medical professionals (or caretakers) seamlessly manage patients, track their medication history, and securely store medical records. 

### Key Features
- **Google OAuth Login:** Secure authentication using Google accounts without needing to manage passwords.
- **Patient Management:** Add, edit, and track patient demographic details (Age, Gender, Patient ID).
- **Medication Tracking:** 
  - Track **Active** and **Inactive** medications for each patient.
  - Deactivate a medication when a course finishes (moving it to the history list).
  - Reactivate an old medication with the option to keep the previous dosage or change it.
  - Create and edit specific dosage schedules and frequencies.
- **Prescriptions & Reports Storage:** A dedicated, mobile-friendly section to upload, store, and view physical prescription images and PDF reports tied to a specific patient.
- **Cloud Infrastructure:**
  - **Database:** Fully hosted PostgreSQL database via Supabase.
  - **File Storage:** Secure cloud bucket storage for all uploaded prescriptions and reports via Supabase Storage.
- **Dynamic UI:** A modern, responsive dashboard with a dynamic sidebar navigation system built using Next.js.

## Contents
* **`initial_build/backend/`** - FastAPI backend application handling business logic, database migrations (Alembic), Supabase Storage uploads, and OAuth verification.
* **`initial_build/frontend/`** - Next.js frontend application styled with Tailwind CSS.
* **`initial_build/medication_management_app_architecture_v1.md`** - Original architecture document.
* **`initial_build/update_v1.md`** - Summary of architecture implemented and updates.
* **`deployment_guide_render_supabase_vercel.md`** - The deployment guide used to host the application.

## Local Development Setup

### Backend Setup
Ensure you have the required environment variables (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_KEY`, `GOOGLE_CLIENT_ID`, `JWT_SECRET`) in a `.env` file inside the `backend` folder.
```bash
cd initial_build/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
set PYTHONPATH=.
python -m uvicorn app.main:app --reload
```

### Frontend Setup
Ensure you have the required environment variables (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`) in a `.env.local` file inside the `frontend` folder.
```bash
cd initial_build/frontend
npm install
npm run dev
```
