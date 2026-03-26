"""
ML Service REST client.
Calls the ML microservice for predictions.
"""
import os
import logging
import httpx

logger = logging.getLogger(__name__)

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://ml-service:8001")


async def get_prediction(vehicle_count: int, avg_speed: float) -> dict:
    """
    Call ML service /predict endpoint.
    Returns: {"traffic_level": str, "confidence": float}
    Falls back to rule-based prediction if ML service is unavailable.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{ML_SERVICE_URL}/predict",
                json={
                    "vehicle_count": vehicle_count,
                    "avg_speed": avg_speed,
                },
            )
            response.raise_for_status()
            result = response.json()
            logger.info(f"ML prediction: {result}")
            return result
    except Exception as e:
        logger.warning(f"ML service unavailable ({e}), using fallback rule-based prediction")
        return _fallback_prediction(vehicle_count, avg_speed)


def _fallback_prediction(vehicle_count: int, avg_speed: float) -> dict:
    """Rule-based fallback when ML service is down."""
    if vehicle_count > 120 or avg_speed < 20:
        return {"traffic_level": "HIGH", "confidence": 0.7}
    elif vehicle_count > 60 or avg_speed < 40:
        return {"traffic_level": "MEDIUM", "confidence": 0.7}
    else:
        return {"traffic_level": "LOW", "confidence": 0.7}


async def get_debug_prediction(vehicle_count: int, avg_speed: float) -> dict:
    """Call ML service /debug-predict endpoint."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{ML_SERVICE_URL}/debug-predict",
                json={
                    "vehicle_count": vehicle_count,
                    "avg_speed": avg_speed,
                },
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"ML debug-predict failed: {e}")
        return {"error": str(e)}
