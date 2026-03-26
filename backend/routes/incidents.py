"""
Incident reporting routes:
  POST /report-incident — log incidents and optionally override signal timing
"""
import logging
from datetime import datetime
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from backend.db.connection import incidents_collection, predictions_collection
from backend.services.decision import apply_emergency_override, get_green_time
from backend.routes.websocket import manager

logger = logging.getLogger(__name__)
router = APIRouter()


class IncidentInput(BaseModel):
    location_id: str
    type: str = Field(..., description="e.g., accident, roadwork, emergency_vehicle")
    severity: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    description: str = ""


@router.post("/report-incident")
async def report_incident(incident: IncidentInput):
    """Store incident and apply emergency override if severity is high."""
    try:
        now = datetime.utcnow()

        # Store incident
        incident_doc = {
            **incident.model_dump(),
            "timestamp": now,
        }

        # Check if emergency override is needed
        latest_pred = await predictions_collection().find_one(
            {"location_id": incident.location_id},
            sort=[("timestamp", -1)],
        )
        current_green = get_green_time(latest_pred["traffic_level"]) if latest_pred else 60

        override_info = apply_emergency_override(incident.severity, current_green)
        incident_doc["override_signal"] = override_info

        await incidents_collection().insert_one(incident_doc)
        logger.info(f"Incident reported at {incident.location_id}: {incident.type} ({incident.severity})")

        # If override is active, broadcast it
        if override_info["override_active"]:
            broadcast_data = {
                "type": "emergency_override",
                "location_id": incident.location_id,
                "incident_type": incident.type,
                "severity": incident.severity,
                "signal_mode": override_info["signal_mode"],
                "green_time": override_info["green_time"],
                "message": override_info["message"],
                "timestamp": now.isoformat(),
            }
            await manager.broadcast(broadcast_data)

        return {
            "status": "recorded",
            "location_id": incident.location_id,
            "override": override_info,
            "timestamp": now.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error reporting incident: {e}")
        raise HTTPException(status_code=500, detail=str(e))
