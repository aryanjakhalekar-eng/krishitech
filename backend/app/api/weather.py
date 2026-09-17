from fastapi import APIRouter, Query
from backend.app.services.weather_service import get_current_weather

router = APIRouter(prefix="/api/weather", tags=["Weather & Micro-Climate Intelligence"])

@router.get("")
def get_weather(district: str = Query("Pune"), taluka: str = Query("Baramati")):
    return get_current_weather(district, taluka)
