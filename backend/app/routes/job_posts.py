from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime

from app.models.job_post import JobPost, JobPostCreate, JobPostUpdate
from app.models.user import User
from app.models.base import convert_object_id
from app.utils.pagination import PaginatedResponse
from app.utils.auth import get_current_user
from app.utils.sequences import get_next_sequence_value
from database import db, get_db

router = APIRouter(
    prefix="/job-posts",
    tags=["job posts"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=JobPost, status_code=status.HTTP_201_CREATED)
async def create_job_post(
    job_post: JobPostCreate, 
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create a new job post."""
    # Check if user is an employer
    if current_user.role != "Employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can create job posts"
        )
    
    # Get next ID for the job post
    next_id = await get_next_sequence_value("job_posts")
    
    # Create job post with current user's ID
    job_post_data = job_post.dict(by_alias=True)
    job_post_data["_id"] = next_id
    job_post_data["user_id"] = current_user.id
    job_post_data["created_at"] = datetime.utcnow()
    
    # Insert into database
    await db.job_posts.insert_one(job_post_data)
      
    # Retrieve and return the created job post
    created_job_post = await db.job_posts.find_one({"_id": next_id})
    
    return JobPost(**convert_object_id(created_job_post))

async def enrich_job_post_with_user(job_post, db):
    user = await db.users.find_one({"_.id": job_post.get("user_id")})
    if user:
        job_post["user_name"] = user.get("name")
        job_post["user_email"] = user.get("email")
    else:
        job_post["user_name"] = None
        job_post["user_email"] = None
    return job_post

@router.get("/", response_model=PaginatedResponse[JobPost])
async def read_job_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    job_type: Optional[str] = None,
    title: Optional[str] = None,
    min_salary: Optional[int] = Query(None, ge=0),
    max_salary: Optional[int] = Query(None, ge=0),
    db = Depends(get_db)
):
    """Get a paginated list of job posts with optional filtering."""
    # Build filter
    filter_query = {}
    if job_type:
        filter_query["job_type"] = job_type
    if title:
        filter_query["title"] = {"$regex": title, "$options": "i"}
    if min_salary is not None:
        filter_query["salary_min"] = {"$gte": min_salary}
    if max_salary is not None:
        # If both min and max are provided, we can use $and or combine them
        if "salary_min" in filter_query:
            filter_query["$and"] = [
                {"salary_min": filter_query.pop("salary_min")},
                {"salary_max": {"$lte": max_salary}}
            ]
        else:
            filter_query["salary_max"] = {"$lte": max_salary}
    
    # Get total count for pagination
    total = await db.job_posts.count_documents(filter_query)
    
    # Get paginated job posts with sorting (newest first)
    cursor = db.job_posts.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
    job_posts = await cursor.to_list(length=limit)
    # Enrich each job post with user info
    job_posts = [await enrich_job_post_with_user(job_post, db) for job_post in job_posts]
    # Return paginated response
    return PaginatedResponse.create(
        items=[JobPost(**convert_object_id(job_post)) for job_post in job_posts],
        total=total,
        page=(skip // limit) + 1,
        limit=limit
    )

@router.get("/{job_post_id}", response_model=JobPost)
async def read_job_post(job_post_id: int, db = Depends(get_db)):
    """Get a specific job post by ID."""
    job_post = await db.job_posts.find_one({"_id": job_post_id})
    if not job_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job post with ID {job_post_id} not found"
        )
    job_post = await enrich_job_post_with_user(job_post, db)
    return JobPost(**convert_object_id(job_post))

@router.get("/user/{user_id}", response_model=PaginatedResponse[JobPost])
async def read_job_posts_by_user(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db = Depends(get_db)
):
    """Get job posts by user ID."""
    # Get total count for pagination
    total = await db.job_posts.count_documents({"user_id": user_id})
      
    # Get paginated job posts with sorting (newest first)
    cursor = db.job_posts.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
    job_posts = await cursor.to_list(length=limit)
    # Enrich each job post with user info
    job_posts = [await enrich_job_post_with_user(job_post, db) for job_post in job_posts]
    # Return paginated response
    return PaginatedResponse.create(
        items=[JobPost(**convert_object_id(job_post)) for job_post in job_posts],
        total=total,
        page=(skip // limit) + 1,
        limit=limit
    )

@router.put("/{job_post_id}", response_model=JobPost)
async def update_job_post(
    job_post_id: int,
    job_post: JobPostUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update a job post."""
    # Check if job post exists
    existing_job_post = await db.job_posts.find_one({"_id": job_post_id})
    if not existing_job_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job post with ID {job_post_id} not found"
        )
    # Authorization: Only Admin or owner (Employer) can edit
    if current_user.role != "Admin" and existing_job_post["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this job post")
    # Update job post
    update_data = job_post.dict(exclude_unset=True, by_alias=True)
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.job_posts.update_one(
            {"_id": job_post_id},
            {"$set": update_data}
        )
    # Return updated job post
    updated_job_post = await db.job_posts.find_one({"_id": job_post_id})
    return JobPost(**convert_object_id(updated_job_post))

@router.delete("/{job_post_id}")
async def delete_job_post(job_post_id: int, current_user: User = Depends(get_current_user), db = Depends(get_db)):
    """Delete a job post."""
    # Check if job post exists
    job_post = await db.job_posts.find_one({"_id": job_post_id})
    if not job_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job post with ID {job_post_id} not found"
        )
    # Authorization: Only Admin or owner (Employer) can delete
    if current_user.role != "Admin" and job_post["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this job post")
    # Delete the job post
    await db.job_posts.delete_one({"_id": job_post_id})
    # Delete all applications for this job post
    await db.applications.delete_many({"job_post_id": job_post_id})
    return {"message": f"Job post {job_post_id} deleted successfully"}
