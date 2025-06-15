from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from app.models.base import MongoBaseModel

# Enum untuk jenis pekerjaan
class JobType(str, Enum):
    FULL_TIME = "Full-time"
    PART_TIME = "Part-time"
    FREELANCE = "Freelance"
    OTHER = "Other"

class JobPostBase(BaseModel):
    user_id: int
    title: str = Field(..., min_length=5, max_length=200)
    company: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=2, max_length=100)
    job_type: JobType
    description: str = Field(..., min_length=10)
    requirements: List[str] = Field(..., min_items=1)
    salary_min: int = Field(..., ge=0)
    salary_max: int = Field(..., ge=0)

class JobPostCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    company: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=2, max_length=100)
    job_type: JobType
    description: str = Field(..., min_length=10)
    requirements: List[str] = Field(..., min_items=1)
    salary_min: int = Field(..., ge=0)
    salary_max: int = Field(..., ge=0)

class JobPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    company: Optional[str] = Field(None, min_length=2, max_length=100)
    location: Optional[str] = Field(None, min_length=2, max_length=100)
    job_type: Optional[JobType] = None
    description: Optional[str] = Field(None, min_length=10)
    requirements: Optional[List[str]] = None
    salary_min: Optional[int] = Field(None, ge=0)
    salary_max: Optional[int] = Field(None, ge=0)

class JobPost(JobPostBase, MongoBaseModel):
    class Config:
        schema_extra = {
            "example": {
                "_id": 1,
                "user_id": 1,
                "title": "Senior Python Developer",
                "company": "Tech Solutions Inc",
                "location": "Jakarta, Indonesia",
                "job_type": "Full-time",
                "description": "We are looking for an experienced Python developer to join our team...",
                "requirements": ["3+ years Python experience", "Knowledge of Django/FastAPI", "Database experience"],
                "salary_min": 8000000,
                "salary_max": 12000000,
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-01T00:00:00"
            }
        }
