import logging
from typing import List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query

from backend.services.routing import get_optimal_route, ROUTING_GRAPH

logger = logging.getLogger(__name__)
router = APIRouter()

class RouteResponse(BaseModel):
    source: str
    destination: str
    path: List[str]
    total_estimated_time_mins: float
    route_segments: List[Dict[str, Any]]

@router.get("/calculate-route", response_model=RouteResponse)
async def calculate_route(
    source: str = Query(..., description="Starting junction"),
    destination: str = Query(..., description="Destination junction")
):
    """
    Calculate the optimal route using A* based on XGBoost traffic predictions.
    Edge weights are dynamically penalized based on predicted congestion labels.
    """
    try:
        route_data = await get_optimal_route(source, destination)
        return RouteResponse(**route_data)
    except ValueError as e:
        logger.error(f"Routing Value Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Routing Server Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate route.")

@router.get("/routing/nodes")
async def get_routing_nodes():
    """Returns the list of valid node names in the routing graph."""
    return {"nodes": list(ROUTING_GRAPH.nodes)}
