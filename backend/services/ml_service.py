import httpx
from core.config import settings
import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)

async def predict_traffic(data: Dict[str, Any]) -> Dict[str, Any]:
    url = f"{settings.ML_SERVICE_URL.rstrip('/')}/predict"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, timeout=10.0)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error from ML service: {e}")
        raise Exception(f"ML Service returned status {e.response.status_code}")
    except httpx.RequestError as e:
        logger.error(f"Failed to connect to ML service: {e}")
        raise Exception("Could not connect to ML Service")
