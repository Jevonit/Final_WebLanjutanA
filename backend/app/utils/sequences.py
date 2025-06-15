from database import db

async def get_next_sequence_value(sequence_name: str) -> int:
    """Get the next sequence value for auto-incrementing IDs."""
    result = await db.counters.find_one_and_update(
        {"_id": sequence_name},
        {"$inc": {"sequence_value": 1}},
        upsert=True,
        return_document=True
    )
    
    if result:
        return result["sequence_value"]
    else:
        # Initialize counter if not exists
        await db.counters.insert_one({"_id": sequence_name, "sequence_value": 1})
        return 1

async def reset_sequence(sequence_name: str):
    """Reset sequence counter to 0."""
    await db.counters.delete_one({"_id": sequence_name})
