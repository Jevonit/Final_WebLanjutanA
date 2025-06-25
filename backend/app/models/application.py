from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from app.models.base import MongoBaseModel

# Enum untuk status aplikasi
class ApplicationStatus(str, Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"

class ApplicationBase(BaseModel):
    user_id: int
    job_post_id: int
    status: ApplicationStatus = ApplicationStatus.PENDING
    cv_data: str  # Base64 encoded CV data
    cv_filename: str  # Original filename
    cv_content_type: str = "application/pdf"

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    cv_data: Optional[str] = None
    cv_filename: Optional[str] = None
    cv_content_type: Optional[str] = None

class Application(ApplicationBase, MongoBaseModel):
    class Config:
        schema_extra = {
            "example": {
                "_id": 1,
                "user_id": 1,
                "job_post_id": 1,
                "status": "Pending",
                "cv_data": "base64encodedcvdata...",
                "cv_filename": "john_doe_cv.pdf",
                "cv_content_type": "application/pdf",
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-01T00:00:00"
            }
        }