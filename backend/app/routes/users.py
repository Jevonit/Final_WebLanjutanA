from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime

from app.models.user import User, UserCreate, UserUpdate, UserInDB, UserRole
from app.utils.security import get_password_hash, verify_password
from app.utils.pagination import PaginatedResponse
from app.models.base import convert_object_id
from app.utils.sequences import get_next_sequence_value
from database import db, get_db
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Create a new user."""
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only admin can create users")
    
    # Check if email already exists
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email {user.email} already registered"
        )
    
    # Get next ID for the user
    next_id = await get_next_sequence_value("users")
    
    # Create user object with hashed password
    user_in_db = UserInDB(
        **user.dict(),
        hashed_password=get_password_hash(user.password),
        created_at=datetime.utcnow(),
    )
    
    # Set the ID and insert into database
    user_data = user_in_db.dict(by_alias=True)
    user_data["_id"] = next_id
    await db.users.insert_one(user_data)
    
    # Retrieve and return the created user
    created_user = await db.users.find_one({"_id": next_id})
    created_user = convert_object_id(created_user)
    
    return User(**created_user)

@router.get("/", response_model=PaginatedResponse[User])
async def read_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db = Depends(get_db)
):
    """Get a paginated list of users."""
    # Get total count for pagination
    total = await db.users.count_documents({})
    
    # Get paginated users
    cursor = db.users.find().skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    
    # Convert ObjectIds to strings
    converted_users = [convert_object_id(user) for user in users]
    
    # Return paginated response
    return PaginatedResponse.create(
        items=[User(**user) for user in converted_users],
        total=total,
        page=(skip // limit) + 1,
        limit=limit
    )

@router.get("/{user_id}", response_model=User)
async def read_user(user_id: int, db = Depends(get_db)):
    """Get a specific user by ID."""
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    user = convert_object_id(user)
    return User(**user)

@router.put("/{user_id}", response_model=User)
async def update_user(user_id: int, user: UserUpdate, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Update a user."""
    if current_user.role != "Admin" and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
    # Check if user exists
    existing_user = await db.users.find_one({"_id": user_id})
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    # Check if new email already exists (if email is being updated)
    if user.email and user.email != existing_user["email"]:
        if await db.users.find_one({"email": user.email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email {user.email} already registered"
            )
    
    # Update user
    update_data = user.dict(exclude_unset=True, by_alias=True)
    if user.password:
        update_data["hashed_password"] = get_password_hash(user.password)
        update_data.pop("password", None)
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.users.update_one(
            {"_id": user_id},
            {"$set": update_data}
        )
    
    # Return updated user
    updated_user = await db.users.find_one({"_id": user_id})
    updated_user = convert_object_id(updated_user)
    return User(**updated_user)

@router.delete("/{user_id}")
async def delete_user(user_id: int, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Delete a user."""
    if current_user.role != "Admin" and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")
    
    # Check if user exists
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    # Delete user
    await db.users.delete_one({"_id": user_id})
    
    # Delete all job posts by this user
    await db.job_posts.delete_many({"user_id": user_id})
    
    # Delete all applications by this user
    await db.applications.delete_many({"user_id": user_id})
    
    return {"message": f"User {user_id} deleted successfully"}

@router.get("/role/{role}", response_model=PaginatedResponse[User])
async def read_users_by_role(
    role: UserRole,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db = Depends(get_db)
):
    """Get users by role."""
    # Get total count for pagination
    total = await db.users.count_documents({"role": role})
    
    # Get paginated users
    cursor = db.users.find({"role": role}).skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    
    # Convert ObjectIds to strings
    converted_users = [convert_object_id(user) for user in users]
    
    # Return paginated response
    return PaginatedResponse.create(
        items=[User(**user) for user in converted_users],
        total=total,
        page=(skip // limit) + 1,
        limit=limit
    )
