from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime

from app.models.profile import Profile, ProfileCreate, ProfileUpdate
from app.models.base import convert_object_id
from app.utils.pagination import PaginatedResponse
from app.utils.sequences import get_next_sequence_value
from app.models.user import User
from app.utils.auth import get_current_user
from database import db, get_db

router = APIRouter(
    prefix="/profiles",
    tags=["profiles"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Profile, status_code=status.HTTP_201_CREATED)
async def create_profile(profile: ProfileCreate, db = Depends(get_db)):
    """Create a new profile."""
    # Check if user exists
    user = await db.users.find_one({"_id": profile.user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {profile.user_id} not found"
        )
    
    # Check if profile already exists for user
    if await db.profiles.find_one({"user_id": profile.user_id}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Profile already exists for user {profile.user_id}"
        )
    
    # Get next ID for the profile
    next_id = await get_next_sequence_value("profiles")
    
    # Create profile
    profile_data = profile.dict(by_alias=True)
    profile_data["_id"] = next_id
    profile_data["created_at"] = datetime.utcnow()
    
    # Insert into database
    await db.profiles.insert_one(profile_data)
    
    # Retrieve and return the created profile
    created_profile = await db.profiles.find_one({"_id": next_id})
    
    return Profile(**convert_object_id(created_profile))

@router.get("/", response_model=PaginatedResponse[Profile])
async def read_profiles(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db = Depends(get_db)
):
    """Get a paginated list of profiles."""
    # Get total count for pagination
    total = await db.profiles.count_documents({})
    
    # Get paginated profiles
    cursor = db.profiles.find().skip(skip).limit(limit)
    profiles = await cursor.to_list(length=limit)
    
    # Return paginated response
    return PaginatedResponse.create(
        items=[Profile(**convert_object_id(profile)) for profile in profiles],
        total=total,
        page=(skip // limit) + 1,
        limit=limit
    )

@router.get("/{profile_id}", response_model=Profile)
async def read_profile(profile_id: int, db = Depends(get_db)):
    """Get a specific profile by ID."""
    profile = await db.profiles.find_one({"_id": profile_id})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile with ID {profile_id} not found"
        )
    
    return Profile(**convert_object_id(profile))

@router.get("/user/{user_id}", response_model=Profile)
async def read_profile_by_user(user_id: int, db = Depends(get_db)):
    """Get profile by user ID."""
    profile = await db.profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user {user_id}"
        )
    
    return Profile(**convert_object_id(profile))

@router.put("/{profile_id}", response_model=Profile)
async def update_profile(
    profile_id: int,
    profile: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update a profile."""
    # Check if profile exists
    existing_profile = await db.profiles.find_one({"_id": profile_id})
    if not existing_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile with ID {profile_id} not found"
        )
    if current_user.role != "Admin" and existing_profile["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this profile"
        )
    
    # Update profile
    update_data = profile.dict(exclude_unset=True, by_alias=True)
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.profiles.update_one(
            {"_id": profile_id},
            {"$set": update_data}
        )
    
    # Return updated profile
    updated_profile = await db.profiles.find_one({"_id": profile_id})
    return Profile(**convert_object_id(updated_profile))

@router.put("/user/{user_id}", response_model=Profile)
async def update_profile_by_user(
    user_id: int,
    profile: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update profile by user ID."""
    # Check if profile exists
    existing_profile = await db.profiles.find_one({"user_id": user_id})
    if not existing_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user {user_id}"
        )
    if current_user.role != "Admin" and user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this profile"
        )
    
    # Update profile
    update_data = profile.dict(exclude_unset=True, by_alias=True)
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.profiles.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
    
    # Return updated profile
    updated_profile = await db.profiles.find_one({"user_id": user_id})
    return Profile(**convert_object_id(updated_profile))

@router.delete("/{profile_id}")
async def delete_profile(profile_id: int, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Delete a profile."""
    # Check if profile exists
    profile = await db.profiles.find_one({"_id": profile_id})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile with ID {profile_id} not found"
        )
    if current_user.role != "Admin" and profile["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this profile"
        )
    
    # Delete the profile
    await db.profiles.delete_one({"_id": profile_id})
    
    return {"message": f"Profile {profile_id} deleted successfully"}

@router.delete("/user/{user_id}")
async def delete_profile_by_user(user_id: int, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Delete profile by user ID."""
    # Check if profile exists
    profile = await db.profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile not found for user {user_id}"
        )
    if current_user.role != "Admin" and user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this profile"
        )
    
    # Delete the profile
    await db.profiles.delete_one({"user_id": user_id})
    
    return {"message": f"Profile for user {user_id} deleted successfully"}
