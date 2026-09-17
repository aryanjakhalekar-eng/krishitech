from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.domain import Farm, DiseaseCase, CropScan, User
from backend.app.auth.security import require_admin

router = APIRouter(prefix="/api/outbreaks", tags=["GIS Outbreak Map & Hotspots"])

# Coordinates for Maharashtra Districts
DISTRICT_COORDS = {
    "Solapur": {"lat": 17.6599, "lng": 75.9064},
    "Pune": {"lat": 18.5204, "lng": 73.8567},
    "Satara": {"lat": 17.6805, "lng": 74.0183},
    "Nashik": {"lat": 19.9975, "lng": 73.7898},
    "Kolhapur": {"lat": 16.7050, "lng": 74.2433},
    "Sangli": {"lat": 16.8524, "lng": 74.5815},
    "Ahmednagar": {"lat": 19.0948, "lng": 74.7480},
    "Nanded": {"lat": 19.1383, "lng": 77.3210}
}

@router.get("/hotspots")
def get_outbreak_hotspots(
    crop: Optional[str] = None,
    district: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(DiseaseCase)
    if crop:
        query = query.filter(DiseaseCase.crop == crop)
    if district:
        query = query.filter(DiseaseCase.district == district)
    if severity:
        query = query.filter(DiseaseCase.severity == severity.upper())

    cases = query.all()

    # Aggregate hotspots by District + Taluka + Crop + Disease
    hotspots_dict = {}
    for c in cases:
        key = (c.district, c.taluka, c.crop, c.verified_disease or c.predicted_disease)
        if key not in hotspots_dict:
            base_coord = DISTRICT_COORDS.get(c.district, {"lat": 18.5, "lng": 75.5})
            hotspots_dict[key] = {
                "district": c.district,
                "taluka": c.taluka,
                "crop": c.crop,
                "disease": c.verified_disease or c.predicted_disease,
                "severity": c.severity,
                "cases_count": 0,
                "lat": base_coord["lat"],
                "lng": base_coord["lng"],
                "risk_level": "High" if c.severity == "HIGH" or len(cases) > 5 else "Medium"
            }
        hotspots_dict[key]["cases_count"] += 1

    return list(hotspots_dict.values())
