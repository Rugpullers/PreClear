from fastapi import APIRouter, HTTPException, Query
from typing import List
from schemas.traffic_schema import APIResponse, TrafficCreate, TrafficResponse, TrafficStatusResponse, TrafficHeatmapResponse
from services.traffic_service import insert_traffic_data, get_all_traffic_data, get_traffic_status, get_traffic_heatmap

router = APIRouter()

@router.post("/traffic-data", response_model=APIResponse[TrafficResponse])
async def create_traffic_data(data: TrafficCreate):
    try:
        result = await insert_traffic_data(data)
        return APIResponse(success=True, data=result, message="Traffic data inserted successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/traffic-data", response_model=APIResponse[List[TrafficResponse]])
async def fetch_all_traffic_data(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=1000)):
    try:
        results = await get_all_traffic_data(skip=skip, limit=limit)
        return APIResponse(success=True, data=results, message="Traffic data fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/traffic-status", response_model=APIResponse[TrafficStatusResponse])
async def fetch_traffic_status(junction_id: str = Query(..., description="The ID of the junction")):
    try:
        result = await get_traffic_status(junction_id)
        return APIResponse(success=True, data=TrafficStatusResponse(**result), message="Traffic status fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/traffic-heatmap", response_model=APIResponse[List[TrafficHeatmapResponse]])
async def fetch_traffic_heatmap():
    try:
        results = await get_traffic_heatmap()
        return APIResponse(success=True, data=results, message="Heatmap data fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
