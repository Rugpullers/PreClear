from pydantic import BaseModel, ConfigDict
from typing import Any, Generic, TypeVar, Optional, List
from datetime import datetime

T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    message: Optional[str] = None

class TrafficCreate(BaseModel):
    junction_id: str
    vehicle_count: int
    congestion_level: str
    timestamp: datetime

class TrafficResponse(TrafficCreate):
    id: str

    model_config = ConfigDict(from_attributes=True)

class TrafficStatusResponse(BaseModel):
    junction_id: str
    dynamic_congestion_level: str
    last_update: datetime
    
class TrafficHeatmapResponse(BaseModel):
    junction_id: str
    total_vehicles: int
    avg_vehicles: float
    record_count: int
