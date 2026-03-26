from fastapi import APIRouter
from schemas.traffic_schema import APIResponse

router = APIRouter()

@router.get("/health", response_model=APIResponse[str])
async def health_check():
    return APIResponse(success=True, data="Backend is running normally", message="OK")
