from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Dict
from datetime import datetime, timedelta

from app.models.user import User, UserCreate, UserRole
from app.utils.security import get_password_hash
from app.utils.auth import (
    authenticate_user, create_access_token, 
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.models.base import convert_object_id
from app.utils.sequences import get_next_sequence_value
from database import db, get_db

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    responses={401: {"description": "Unauthorized"}},
)

@router.post("/token", response_model=Dict[str, str])
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_db)
):
    """Generate an access token for a valid user."""
    user = await authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db = Depends(get_db)):
    """Register a new user (job seeker or employer)."""
    # Check if email already exists
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email {user.email} already registered"
        )
    
    # Get next ID for the user
    next_id = await get_next_sequence_value("users")
      # Create user with hashed password
    hashed_password = get_password_hash(user.password)
    user_data = user.dict(exclude={"password"})  # Exclude the original password
    user_data["_id"] = next_id
    user_data["hashed_password"] = hashed_password
    user_data["created_at"] = datetime.utcnow()
    
    # Insert into database
    await db.users.insert_one(user_data)
    
    # Return created user
    created_user = await db.users.find_one({"_id": next_id})
    created_user = convert_object_id(created_user)
    return User(**created_user)

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's information."""
    return current_user

@router.post("/verify-password", response_model=Dict[str, bool])
async def verify_user_password(
    credentials: Dict[str, str],
    db = Depends(get_db)
):
    """Verify a user's password without actually logging them in."""
    email = credentials.get("email")
    password = credentials.get("password")
    
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required",
        )
    
    # Find the user
    user = await db.users.find_one({"email": email})
    if not user:
        return {"verified": False}
    
    # Verify password
    from app.utils.security import verify_password
    if not verify_password(password, user["hashed_password"]):
        return {"verified": False}
    
    return {"verified": True}
