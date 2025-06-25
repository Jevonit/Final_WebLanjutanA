from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime

from app.models.application import Application, ApplicationCreate, ApplicationUpdate
from app.models.base import convert_object_id
from app.utils.pagination import PaginatedResponse
from app.utils.sequences import get_next_sequence_value
from database import db, get_db
from app.models.user import User
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/applications",
    tags=["applications"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Application, status_code=status.HTTP_201_CREATED)
async def create_application(application: ApplicationCreate, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Create a new job application."""
    if current_user.role != "Job Seeker":
        raise HTTPException(status_code=403, detail="Only job seekers can apply for jobs")
    if application.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only apply as yourself")
    # Check if user exists
    user = await db.users.find_one({"_id": application.user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {application.user_id} not found"
        )
    
    # Check if job post exists
    job_post = await db.job_posts.find_one({"_id": application.job_post_id})
    if not job_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job post with ID {application.job_post_id} not found"
        )
    
    # Check if application already exists
    existing_application = await db.applications.find_one({
        "user_id": application.user_id,
        "job_post_id": application.job_post_id
    })
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You have already applied for this job"
        )
    
    # Get next ID for the application
    next_id = await get_next_sequence_value("applications")
    
    # Create application
    application_data = application.dict(by_alias=True)
    application_data["_id"] = next_id
    application_data["created_at"] = datetime.utcnow()
    
    # Insert into database
    await db.applications.insert_one(application_data)
    
    # Retrieve and return the created application
    created_application = await db.applications.find_one({"_id": next_id})
    
    return Application(**convert_object_id(created_application))

@router.get("/", response_model=PaginatedResponse[Application])
async def read_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    db = Depends(get_db)
):
    """Get a paginated list of applications with optional filtering."""
    # Build filter
    filter_query = {}
    if status:
        filter_query["status"] = status
    
    # Get total count for pagination
    total = await db.applications.count_documents(filter_query)
    
    # Get paginated applications
    cursor = db.applications.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
    applications = await cursor.to_list(length=limit)
    
    # Return paginated response
    return PaginatedResponse.create(
        items=[Application(**convert_object_id(application)) for application in applications],
        total=total,
        page=(skip // limit) + 1,
        limit=limit
    )

@router.get("/{application_id}", response_model=Application)
async def read_application(application_id: int, db = Depends(get_db)):
    """Get a specific application by ID."""
    application = await db.applications.find_one({"_id": application_id})
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found"
        )
    
    return Application(**convert_object_id(application))

@router.get("/user/{user_id}", response_model=PaginatedResponse[Application])
async def read_applications_by_user(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db = Depends(get_db)
):
    """Get applications by user ID."""
    # Get total count for pagination
    total = await db.applications.count_documents({"user_id": user_id})
    
    # Get paginated applications
    cursor = db.applications.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
    applications = await cursor.to_list(length=limit)
    
    # Return paginated response
    return PaginatedResponse.create(
        items=[Application(**convert_object_id(application)) for application in applications],
        total=total,
        page=(skip // limit) + 1,
        limit=limit
    )

@router.get("/job/{job_post_id}", response_model=PaginatedResponse[Application])
async def read_applications_by_job_post(
    job_post_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db = Depends(get_db)
):
    """Get applications by job post ID."""
    # Get total count for pagination
    total = await db.applications.count_documents({"job_post_id": job_post_id})
    
    # Get paginated applications
    cursor = db.applications.find({"job_post_id": job_post_id}).sort("created_at", -1).skip(skip).limit(limit)
    applications = await cursor.to_list(length=limit)
    
    # Return paginated response
    return PaginatedResponse.create(
        items=[Application(**convert_object_id(application)) for application in applications],
        total=total,
        page=(skip // limit) + 1,
        limit=limit
    )

@router.put("/{application_id}", response_model=Application)
async def update_application(
    application_id: int,
    application: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update an application."""
    # Check if application exists
    existing_application = await db.applications.find_one({"_id": application_id})
    if not existing_application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found"
        )
    
    # Job Seeker hanya boleh update application miliknya sendiri
    # Employer hanya boleh update status application untuk jobpost miliknya
    # Admin boleh update semua
    if current_user.role == "Job Seeker" and existing_application["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this application")
    if current_user.role == "Employer":
        job_post = await db.job_posts.find_one({"_id": existing_application["job_post_id"]})
        if not job_post or job_post["user_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this application")
    if current_user.role not in ["Admin", "Employer", "Job Seeker"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update application
    update_data = application.dict(exclude_unset=True, by_alias=True)
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.applications.update_one(
            {"_id": application_id},
            {"$set": update_data}
        )
    
    # Return updated application
    updated_application = await db.applications.find_one({"_id": application_id})
    return Application(**convert_object_id(updated_application))

@router.delete("/{application_id}")
async def delete_application(application_id: int, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Delete an application."""
    # Check if application exists
    application = await db.applications.find_one({"_id": application_id})
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found"
        )
    if current_user.role != "Admin" and application["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this application")
    
    # Delete the application
    await db.applications.delete_one({"_id": application_id})
    
    return {"message": f"Application {application_id} deleted successfully"}
