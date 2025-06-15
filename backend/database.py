import motor.motor_asyncio
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from fastapi import HTTPException, status

# Load environment variables
load_dotenv()

# MongoDB connection string
MONGO_URI = os.getenv("MONGO_URI")

# Create a client instance
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)

# Get database instance (specify database name explicitly)
db = client.jobseeker  # Use 'jobseeker' to match Atlas database name

# Function to check database connection
async def check_connection():
    try:
        # The ismaster command is cheap and does not require auth
        await client.admin.command('ismaster')
        return True
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        return False

# Dependency to check database connection
async def get_db():
    is_connected = await check_connection()
    if not is_connected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not connect to the database",
        )
    return db
