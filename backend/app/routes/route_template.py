from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

# Import model Anda di sini
# from app.models.model import Model, ModelCreate, ModelUpdate
from app.utils.pagination import PaginatedResponse
from database import db, get_db

router = APIRouter(
    prefix="/items",  # Ganti dengan prefix yang sesuai
    tags=["items"],  # Ganti dengan tag yang sesuai
    responses={404: {"description": "Not found"}},
)

# Implementasikan endpoint CRUD Anda di sini
# Contoh:
# @router.post("/", response_model=Model, status_code=status.HTTP_201_CREATED)
# async def create_item(item: ModelCreate, db = Depends(get_db)):
#     """Create a new item."""
#     # Logika Anda di sini
#     return item
# 
# @router.get("/", response_model=PaginatedResponse[Model])
# async def read_items(
#     skip: int = Query(0, ge=0),
#     limit: int = Query(10, ge=1, le=100),
#     db = Depends(get_db)
# ):
#     """Get a paginated list of items."""
#     # Logika Anda di sini
#     pass
# 
# @router.get("/{item_id}", response_model=Model)
# async def read_item(item_id: str, db = Depends(get_db)):
#     """Get a specific item by ID."""
#     # Logika Anda di sini
#     pass
# 
# @router.put("/{item_id}", response_model=Model)
# async def update_item(
#     item_id: str,
#     item_update: ModelUpdate,
#     db = Depends(get_db)
# ):
#     """Update an item."""
#     # Logika Anda di sini
#     pass
# 
# @router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
# async def delete_item(item_id: str, db = Depends(get_db)):
#     """Delete an item."""
#     # Logika Anda di sini
#     pass
