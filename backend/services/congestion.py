"""
Mock congestion prediction for next 5-10 minutes.
"""
import random
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


def predict_congestion(
    location_id: str,
    current_level: str,
    vehicle_count: int,
    avg_speed: float,
) -> dict:
    """
    Mock congestion prediction for the next 5-10 minutes.
    In production, this would use historical data and time-series models.
    """
    # Simple trend logic based on current state
    trend_map = {
        "HIGH": {
            "predicted_level": random.choice(["HIGH", "HIGH", "MEDIUM"]),
            "trend": "stable" if vehicle_count > 100 else "decreasing",
        },
        "MEDIUM": {
            "predicted_level": random.choice(["MEDIUM", "HIGH", "LOW"]),
            "trend": "increasing" if vehicle_count > 80 else "stable",
        },
        "LOW": {
            "predicted_level": random.choice(["LOW", "LOW", "MEDIUM"]),
            "trend": "stable" if avg_speed > 50 else "increasing",
        },
    }

    prediction = trend_map.get(current_level.upper(), trend_map["MEDIUM"])
    now = datetime.utcnow()

    return {
        "location_id": location_id,
        "current_level": current_level,
        "predicted_level_5min": prediction["predicted_level"],
        "predicted_level_10min": random.choice(["LOW", "MEDIUM", "HIGH"]),
        "trend": prediction["trend"],
        "prediction_time": now.isoformat(),
        "valid_until": (now + timedelta(minutes=10)).isoformat(),
        "note": "Mock prediction — replace with time-series model for production",
    }
