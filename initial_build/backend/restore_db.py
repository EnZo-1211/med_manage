import json
import sqlite3
import uuid
from datetime import datetime
from sqlalchemy import create_engine
from app.core.database import Base, engine
from app.main import app  # this ensures all models are imported and create_all is called

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def main():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    print("Loading db_dump.json...")
    with open("db_dump.json", "r") as f:
        dump = json.load(f)

    conn = sqlite3.connect('medmanage.db')
    cursor = conn.cursor()

    # Function to parse hex strings back to bytes if the column is UUID (SQLite sometimes stores UUIDs as BLOB)
    # But wait, SQLAlchemy using `Uuid` stores it as 32-char hex string by default in SQLite.
    # Let's just insert the exact string we pulled out since we used hex() for bytes, but wait - if the original was hex string, it wasn't bytes.
    # Actually, SQLAlchemy 2.0 with Uuid stores UUIDs as hex strings (CHAR(32)) in SQLite. Let's just insert directly.
    # Let's check how the original data was stored. If our dump_db script hit bytes, it converted them to hex strings.

    for table_name, rows in dump.items():
        if table_name == 'patient_access':
            # Migrate patient_access to patient_users
            print("Migrating patient_access...")
            for row in rows:
                pu_id = str(uuid.uuid4()).replace("-", "")
                patient_id = row['patient_id']
                # old schema had role = "viewer" or "editor". New schema has "owner", "caregiver", "viewer".
                # Map "editor" -> "caregiver"
                role = "caregiver" if row.get('role') == 'editor' else row.get('role', 'viewer')
                
                # generate dummy email
                dummy_email = f"legacy-user-{patient_id[:8]}@medmanage.local"
                
                cursor.execute(
                    "INSERT INTO patient_users (id, patient_id, invited_email, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    (pu_id, patient_id, dummy_email, role, 'invited', row.get('created_at', datetime.utcnow().isoformat()))
                )
        elif table_name not in ['users', 'patient_users', 'patient_activity', 'alembic_version']:
            print(f"Restoring table {table_name}...")
            for row in rows:
                # Some tables may have new columns (e.g. created_by, updated_by in patient_medications)
                # But inserting with named columns handles defaults.
                columns = ", ".join(row.keys())
                placeholders = ", ".join("?" for _ in row)
                values = tuple(row.values())
                
                cursor.execute(
                    f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})",
                    values
                )

    conn.commit()
    conn.close()
    print("Database restored successfully.")

if __name__ == "__main__":
    main()
