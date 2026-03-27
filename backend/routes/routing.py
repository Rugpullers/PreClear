from fastapi import APIRouter, HTTPException, Query
from typing import List
from schemas.traffic_schema import APIResponse
from services.routing_service import get_optimal_route, get_available_junctions

router = APIRouter()


@router.get("/optimal-route", response_model=APIResponse)
async def optimal_route(
    source: str = Query(..., description="Source junction name"),
    destination: str = Query(..., description="Destination junction name"),
):
    """
    Calculate the optimal route between two junctions using A* algorithm.
    Edge weights are dynamically adjusted based on predicted congestion levels.
    """
    try:
        result = await get_optimal_route(source, destination)
        return APIResponse(
            success=True,
            data=result,
            message="Optimal route calculated successfully",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/junctions", response_model=APIResponse[List[str]])
async def list_junctions():
    """Return the list of available junction names in the routing graph."""
    junctions = get_available_junctions()
    return APIResponse(
        success=True,
        data=junctions,
        message=f"{len(junctions)} junctions available",
    )
