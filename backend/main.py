from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
import os
from dotenv import load_dotenv
from database import db, check_connection
from app.routes.users import router as users_router
from app.routes.profiles import router as profiles_router
from app.routes.job_posts import router as job_posts_router
from app.routes.applications import router as applications_router
from app.routes.auth import router as auth_router
from app.utils.json_encoder import JSONEncoder
from datetime import datetime

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title=os.getenv("APP_NAME", "Final_WebLanjutanA"))

# Configure CORS
origins = [
    "http://localhost:3000",  # React default port
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to check database connection
async def get_db():
    is_connected = await check_connection()
    if not is_connected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not connect to the database",
        )
    return db

# Root endpoint
@app.get("/")
async def root():
    return {"message": f"Welcome to {os.getenv('APP_NAME', 'Final_WebLanjutanA')} API"}

# Health check endpoint
@app.get("/health")
async def health_check(db = Depends(get_db)):
    return {"status": "ok", "database": "connected"}

@app.get("/db-info")
async def get_database_info():
    """Get database information"""
    try:
        collections = await db.list_collection_names()
        info = {
            "database_name": db.name,
            "collections": collections,
            "collection_counts": {}
        }
        
        for collection_name in collections:
            count = await db[collection_name].count_documents({})
            info["collection_counts"][collection_name] = count
            
        return info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get database info: {str(e)}"
        )

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(profiles_router)
app.include_router(job_posts_router)
app.include_router(applications_router)
