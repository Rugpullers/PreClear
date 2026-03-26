"""
Traffic data routes:
  POST /traffic-data      — ingest, predict, broadcast
  GET  /traffic-status/{id} — latest prediction
  GET  /traffic-heatmap   — heatmap data for Leaflet
  GET  /congestion-forecast/{id} — mock congestion prediction
"""
import logging
from datetime import datetime
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from backend.db.connection import traffic_data_collection, predictions_collection
from backend.services.ml_client import get_prediction
from backend.services.decision import get_green_time, get_explainable_reason
from backend.services.congestion import predict_congestion
from backend.routes.websocket import manager

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Pydantic Models ──────────────────────────────────────────

class TrafficDataInput(BaseModel):
    location_id: str
    vehicle_count: int = Field(..., ge=0)
    avg_speed: float = Field(..., ge=0)
    lat: float
    lng: float


class TrafficDataResponse(BaseModel):
    location_id: str
    traffic_level: str
    confidence: float
    green_time: int
    reason: str
    timestamp: str


# ── Routes ───────────────────────────────────────────────────

@router.post("/traffic-data", response_model=TrafficDataResponse)
async def ingest_traffic_data(data: TrafficDataInput):
    """Receive live traffic data, get ML prediction, apply decision logic, broadcast."""
    try:
        now = datetime.utcnow()

        # 1. Store raw traffic data
        traffic_doc = {
            **data.model_dump(),
            "timestamp": now,
        }
        await traffic_data_collection().insert_one(traffic_doc)
        logger.info(f"Stored traffic data for {data.location_id}")

        # 2. Get ML prediction
        prediction = await get_prediction(data.vehicle_count, data.avg_speed)
        traffic_level = prediction["traffic_level"]
        confidence = prediction["confidence"]

        # 3. Apply decision logic
        green_time = get_green_time(traffic_level)
        reason = get_explainable_reason(traffic_level, data.vehicle_count, data.avg_speed)

        # 4. Store prediction result
        prediction_doc = {
            "location_id": data.location_id,
            "traffic_level": traffic_level,
            "confidence": confidence,
            "green_time": green_time,
            "reason": reason,
            "lat": data.lat,
            "lng": data.lng,
            "vehicle_count": data.vehicle_count,
            "avg_speed": data.avg_speed,
            "timestamp": now,
        }
        await predictions_collection().insert_one(prediction_doc)

        # 5. Broadcast via WebSocket
        broadcast_data = {
            "type": "traffic_update",
            "location_id": data.location_id,
            "traffic_level": traffic_level,
            "confidence": confidence,
            "green_time": green_time,
            "reason": reason,
            "lat": data.lat,
            "lng": data.lng,
            "timestamp": now.isoformat(),
        }
        await manager.broadcast(broadcast_data)

        return TrafficDataResponse(
            location_id=data.location_id,
            traffic_level=traffic_level,
            confidence=confidence,
            green_time=green_time,
            reason=reason,
            timestamp=now.isoformat(),
        )

    except Exception as e:
        logger.error(f"Error processing traffic data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/traffic-status/{location_id}")
async def get_traffic_status(location_id: str):
    """Return the latest prediction for a given location."""
    doc = await predictions_collection().find_one(
        {"location_id": location_id},
        sort=[("timestamp", -1)],
    )
    if not doc:
        raise HTTPException(status_code=404, detail=f"No data for location {location_id}")
    doc["_id"] = str(doc["_id"])
    doc["timestamp"] = doc["timestamp"].isoformat() if hasattr(doc["timestamp"], "isoformat") else str(doc["timestamp"])
    return doc


@router.get("/traffic-heatmap")
async def get_traffic_heatmap():
    """
    Return heatmap data for Leaflet.js in format: [[lat, lng, intensity], ...]
    Intensity: HIGH=1.0, MEDIUM=0.6, LOW=0.3
    """
    intensity_map = {"HIGH": 1.0, "MEDIUM": 0.6, "LOW": 0.3}
    heatmap_data = []

    # Get latest prediction per location
    pipeline = [
        {"$sort": {"timestamp": -1}},
        {"$group": {
            "_id": "$location_id",
            "lat": {"$first": "$lat"},
            "lng": {"$first": "$lng"},
            "traffic_level": {"$first": "$traffic_level"},
        }},
    ]
    async for doc in predictions_collection().aggregate(pipeline):
        level = doc.get("traffic_level", "LOW")
        intensity = intensity_map.get(level, 0.3)
        heatmap_data.append([doc["lat"], doc["lng"], intensity])

    return heatmap_data


@router.get("/congestion-forecast/{location_id}")
async def get_congestion_forecast(location_id: str):
    """Get mock congestion prediction for next 5-10 minutes."""
    doc = await predictions_collection().find_one(
        {"location_id": location_id},
        sort=[("timestamp", -1)],
    )
    if not doc:
        raise HTTPException(status_code=404, detail=f"No data for location {location_id}")

    forecast = predict_congestion(
        location_id=location_id,
        current_level=doc["traffic_level"],
        vehicle_count=doc.get("vehicle_count", 50),
        avg_speed=doc.get("avg_speed", 40),
    )
    return forecast
