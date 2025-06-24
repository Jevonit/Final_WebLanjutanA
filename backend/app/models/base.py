from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
import json

def convert_object_id(obj: Any) -> Any:
    """Convert any object recursively for JSON serialization."""
    if isinstance(obj, dict):
        return {key: convert_object_id(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_object_id(item) for item in obj]
    return obj

# Base model with simple integer id field
class MongoBaseModel(BaseModel):
    id: Optional[int] = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    
    def dict(self, **kwargs):
        """Override dict method to convert ObjectIds to strings."""
        data = super().dict(**kwargs)
        return convert_object_id(data)
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat(),
        }
