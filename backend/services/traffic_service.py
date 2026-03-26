from datetime import datetime, timezone
from typing import List, Optional
from db.mongo import get_database
from models.traffic_model import TrafficModel
from schemas.traffic_schema import TrafficCreate, TrafficResponse, TrafficHeatmapResponse
from cachetools import TTLCache
import logging

logger = logging.getLogger(__name__)

# Cache for heatmap data (TTL 60 seconds)
heatmap_cache = TTLCache(maxsize=100, ttl=60)

async def insert_traffic_data(data: TrafficCreate) -> TrafficResponse:
    db = get_database()
    traffic_collection = db["traffic_data"]
    
    traffic_dict = data.model_dump()
    # ensure timestamp is datetime object (pydantic usually does this)
    
    result = await traffic_collection.insert_one(traffic_dict)
    
    # Return as response
    created_doc = await traffic_collection.find_one({"_id": result.inserted_id})
    created_doc["id"] = str(created_doc["_id"])
    return TrafficResponse(**created_doc)

async def get_all_traffic_data(skip: int = 0, limit: int = 100) -> List[TrafficResponse]:
    db = get_database()
    traffic_collection = db["traffic_data"]
    
    cursor = traffic_collection.find().sort("timestamp", -1).skip(skip).limit(limit)
    results = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        results.append(TrafficResponse(**doc))
    return results

async def get_traffic_status(junction_id: str) -> dict:
    db = get_database()
    traffic_collection = db["traffic_data"]
    
    # Get the latest entry for this junction
    latest = await traffic_collection.find_one(
        {"junction_id": junction_id},
        sort=[("timestamp", -1)]
    )
    
    if not latest:
        return {"junction_id": junction_id, "dynamic_congestion_level": "Unknown", "last_update": datetime.now(timezone.utc)}
        
    # Dynamic calculation (mock logic: > 50 vehicles -> High, > 20 -> Medium, else Low)
    count = latest.get("vehicle_count", 0)
    if count > 50:
        level = "High"
    elif count > 20:
        level = "Medium"
    else:
        level = "Low"
        
    return {
        "junction_id": junction_id,
        "dynamic_congestion_level": level,
        "last_update": latest.get("timestamp", datetime.now(timezone.utc))
    }

async def get_traffic_heatmap() -> List[TrafficHeatmapResponse]:
    # Check cache
    if "heatmap" in heatmap_cache:
        return heatmap_cache["heatmap"]
        
    db = get_database()
    traffic_collection = db["traffic_data"]
    
    pipeline = [
        {
            "$group": {
                "_id": "$junction_id",
                "total_vehicles": {"$sum": "$vehicle_count"},
                "avg_vehicles": {"$avg": "$vehicle_count"},
                "record_count": {"$sum": 1}
            }
        }
    ]
    
    cursor = traffic_collection.aggregate(pipeline)
    results = []
    async for doc in cursor:
        results.append(TrafficHeatmapResponse(
            junction_id=doc["_id"],
            total_vehicles=doc["total_vehicles"],
            avg_vehicles=doc["avg_vehicles"],
            record_count=doc["record_count"]
        ))
        
    heatmap_cache["heatmap"] = results
    return results
