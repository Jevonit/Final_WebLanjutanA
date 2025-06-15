from typing import TypeVar, Generic, List, Optional, Any
from pydantic import BaseModel, Field
from pydantic.generics import GenericModel

T = TypeVar('T')

class PaginatedResponse(GenericModel, Generic[T]):
    """Generic paginated response model."""
    data: List[T]
    total: int
    page: int
    limit: int
    pages: int
    
    @classmethod
    def create(cls, items: List[T], total: int, page: int, limit: int):
        """Create a paginated response."""
        pages = (total + limit - 1) // limit if limit else 1
        return cls(
            data=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )
