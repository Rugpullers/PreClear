from datetime import datetime
from typing import Optional, Annotated
from pydantic import BaseModel, Field, BeforeValidator

PyObjectId = Annotated[str, BeforeValidator(str)]

class TrafficModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    junction_id: str = Field(...)
    vehicle_count: int = Field(...)
    congestion_level: str = Field(...)
    timestamp: datetime = Field(...)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }
