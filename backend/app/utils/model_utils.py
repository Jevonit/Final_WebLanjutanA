from bson import ObjectId
from datetime import datetime

def model_to_dict(obj):
    """Convert Pydantic model to dictionary for MongoDB."""
    if isinstance(obj, dict):
        for key, value in obj.items():
            if isinstance(value, ObjectId):
                obj[key] = str(value)
            elif isinstance(value, datetime):
                obj[key] = value.isoformat()
            elif isinstance(value, (list, tuple)):
                obj[key] = [model_to_dict(item) if hasattr(item, "dict") else item for item in value]
            elif hasattr(value, "dict"):
                obj[key] = model_to_dict(value.dict())
        return obj
    elif hasattr(obj, "dict"):
        return model_to_dict(obj.dict())
    else:
        return obj
