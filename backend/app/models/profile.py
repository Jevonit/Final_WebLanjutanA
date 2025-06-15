from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from app.models.base import MongoBaseModel

# Enum untuk gender
class Gender(str, Enum):
    MALE = "Male"
    FEMALE = "Female"

class ProfileBase(BaseModel):
    user_id: int
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    age: int = Field(..., ge=18, le=100)
    gender: Gender
    description: Optional[str] = Field(None, max_length=1000)
    skills: List[str] = Field(default=[])  # Array of skills
    experience: Optional[str] = Field(None, max_length=2000)  # Work experience
    education: Optional[str] = Field(None, max_length=1000)  # Educational background

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    age: Optional[int] = Field(None, ge=18, le=100)
    gender: Optional[Gender] = None
    description: Optional[str] = Field(None, max_length=1000)
    skills: Optional[List[str]] = None
    experience: Optional[str] = Field(None, max_length=2000)
    education: Optional[str] = Field(None, max_length=1000)

class Profile(ProfileBase, MongoBaseModel):
    class Config:
        schema_extra = {
            "example": {
                "_id": 1,
                "user_id": 1,
                "full_name": "John Doe",
                "phone": "081234567890",
                "age": 25,
                "gender": "Male",
                "description": "Experienced software developer",
                "skills": ["Python", "JavaScript", "React"],
                "experience": "3 years as full-stack developer at Tech Company",
                "education": "Bachelor's degree in Computer Science",
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-01T00:00:00"
            }
        }