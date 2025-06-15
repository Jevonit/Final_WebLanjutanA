from bson import ObjectId
from datetime import datetime
from typing import Any
import json

class JSONEncoder(json.JSONEncoder):
    """Custom JSON encoder for MongoDB objects."""
    
    def default(self, obj: Any) -> Any:
        if isinstance(obj, ObjectId):
            return str(obj)
        elif isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

def jsonable_encoder(obj: Any) -> Any:
    """Convert object to JSON-serializable format."""
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {key: jsonable_encoder(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [jsonable_encoder(item) for item in obj]
    elif hasattr(obj, 'dict'):
        # For Pydantic models
        return jsonable_encoder(obj.dict())
    else:
        return obj
