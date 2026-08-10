import uuid
from sqlalchemy import Column, String, DateTime, Text, func
from sqlalchemy import Uuid as UUID
from app.core.database import Base

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, index=True)
    generic_name = Column(String, nullable=True)
    brand_name = Column(String, nullable=True)
    strength = Column(String, nullable=True)
    form = Column(String, nullable=True)
    manufacturer = Column(String, nullable=True)
    primary_image_url = Column(Text, nullable=True)
    external_source = Column(String, nullable=True)
    external_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
