from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from enum import Enum
from app.models.base import MongoBaseModel

# Enum untuk role user
class UserRole(str, Enum):
    ADMIN = "Admin"
    EMPLOYER = "Employer"
    JOB_SEEKER = "Job Seeker"

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: UserRole

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    password: Optional[str] = Field(None, min_length=6)

class UserInDB(UserBase, MongoBaseModel):
    hashed_password: str
    
    class Config:
        schema_extra = {
            "example": {
                "_id": 1,
                "name": "John Doe",
                "email": "john@example.com",
                "role": "Job Seeker",
                "hashed_password": "$2b$12$...",
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-01T00:00:00"
            }
        }

class User(UserBase, MongoBaseModel):
    class Config:
        schema_extra = {
            "example": {
                "_id": 1,
                "name": "John Doe",
                "email": "john@example.com",
                "role": "Job Seeker",
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-01T00:00:00"
            }
        }
