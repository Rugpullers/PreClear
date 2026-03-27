from fastapi import APIRouter, HTTPException
from typing import Any, Dict
from schemas.traffic_schema import APIResponse
from services.ml_service import predict_traffic

router = APIRouter()

@router.post("/predict", response_model=APIResponse[Dict[str, Any]])
async def get_prediction(data: Dict[str, Any]):
    try:
        result = await predict_traffic(data)
        # Ensure we always return the same schema
        return APIResponse(success=True, data=result, message="Prediction completed successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
