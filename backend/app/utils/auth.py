from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import os
from dotenv import load_dotenv

from app.models.user import User, UserInDB
from app.models.base import convert_object_id
from app.utils.security import verify_password
from database import db, get_db

# Load environment variables
load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# OAuth2 password bearer for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def authenticate_user(email: str, password: str, db = Depends(get_db)):
    """Authenticate a user by email and password."""
    print(f"🔍 Authenticating user: {email}")  # Debug log
    
    user = await db.users.find_one({"email": email})
    if not user:
        print(f"❌ User not found: {email}")  # Debug log
        return False
    
    print(f"✅ User found: {user.get('name')} (ID: {user.get('_id')})")  # Debug log
    
    # Check if hashed_password exists
    if "hashed_password" not in user:
        print(f"❌ No hashed_password field for user: {email}")  # Debug log
        return False
    
    # Verify password
    if not verify_password(password, user["hashed_password"]):
        print(f"❌ Password verification failed for user: {email}")  # Debug log
        return False
    
    print(f"✅ Password verified for user: {email}")  # Debug log
    
    # Convert and return User object
    user = convert_object_id(user)
    return User(**user)

async def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)):
    """Get the current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        # Convert user_id to integer
        user_id = int(user_id)
    except (JWTError, ValueError):
        raise credentials_exception
    
    # Get user from database
    user = await db.users.find_one({"_id": user_id})
    if user is None:
        raise credentials_exception
    
    user = convert_object_id(user)
    return User(**user)

# Check if user is an admin
async def get_current_admin(current_user: User = Depends(get_current_user)):
    """Check if current user is an admin."""
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# Check if user is an employer
async def get_current_employer(current_user: User = Depends(get_current_user)):
    """Check if current user is an employer."""
    if current_user.role != "Employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can perform this action"
        )
    return current_user

# Check if user is a job seeker
async def get_current_job_seeker(current_user: User = Depends(get_current_user)):
    """Check if current user is a job seeker."""
    if current_user.role != "Job Seeker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only job seekers can perform this action"
        )
    return current_user
