# Medication Management App — V1 Architecture (Updated)

This document outlines the implemented V1 architecture of the Medication Management App, including the deviations and updates made from the original design.

## 1. Core Architecture
The core architectural principle of a **modular monolith** was successfully implemented. The backend is a single FastAPI application organized into distinct domain modules:
- `patients` (Patient CRUD)
- `access` (Patient Access & Verification)
- `medicines` (Medicine reference and search)
- `medications` (PatientMedication CRUD and dashboard aggregation)
- `storage` (Object Storage handling)

## 2. Updates & Deviations from Original Plan

### 2.1 Database Swap (PostgreSQL to SQLite)
- **Original Plan:** PostgreSQL using Docker Compose.
- **Implemented Update:** **SQLite** was used as the primary database for V1 to drastically accelerate the prototyping phase and remove immediate infrastructure overhead. Because SQLAlchemy is used as the ORM, the transition to PostgreSQL for production will require virtually no code changes (primarily just updating the connection string in the configuration).

### 2.2 Identification/OCR Module Deferred
- **Original Plan:** An `identification` module pipeline using OCR to extract information from uploaded images as a fallback for medicine search.
- **Implemented Update:** The `identification` OCR module was **deferred**. Currently, the system relies on text search and manual entry fallbacks. The image upload functionality is correctly handled via the `storage` module, but automated OCR processing will be slated for a future release (V2/V3) to reduce V1 complexity.

### 2.3 Storage Implementation
- **Original Plan:** MinIO for local dev, S3 for prod.
- **Implemented Update:** The `storage` module handles basic local file uploads and serving. This keeps the prototype completely self-contained without needing external cloud bucket provisioning for the time being.

## 3. Technology Stack (Actual)
- **Frontend:** Next.js (React), TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI, SQLAlchemy, Alembic
- **Database:** SQLite (prototype environment)
- **Storage:** Local filesystem via FastAPI endpoints

## 4. Next Steps & Production Readiness
Before this application handles real PHI (Protected Health Information) in production, the following architectural updates must occur:
1. **Migrate to PostgreSQL:** Update the `DATABASE_URL` and spin up a managed Postgres instance.
2. **Secure Access Codes:** Transition from plain-text access codes in the `patient_access` table to securely hashed codes.
3. **Implement S3 Storage:** Replace the local storage adapter with an AWS S3/MinIO compatible client to handle images scalably.
4. **Rate Limiting & Auditing:** Add middleware for rate-limiting access attempts and logging all access to patient data for compliance auditing.
