from sqlalchemy.orm import Session
from app.activity.models import PatientActivity


def log_activity(db: Session, patient_id, user_id, action: str,
                  target_type: str | None = None, target_id=None,
                  details: str | None = None) -> None:
    """Call this right after any meaningful write.
    Doesn't commit — the caller's existing commit covers this row too,
    so the action and its log entry always succeed or fail together.
    """
    db.add(PatientActivity(
        patient_id=patient_id, user_id=user_id, action=action,
        target_type=target_type, target_id=target_id, details=details,
    ))
