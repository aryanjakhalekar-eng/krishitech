from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database.session import get_db
from backend.app.models.domain import User, Farm, CropScan, DiseaseCase, OfficerReview
from backend.app.auth.security import get_current_user, require_admin

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Admin Intelligence"])

@router.get("/overview")
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    total_farmers = db.query(User).filter(User.role == "FARMER").count()
    total_farms = db.query(Farm).count()
    total_scans = db.query(CropScan).count()
    
    total_cases = db.query(DiseaseCase).count()
    pending_cases = db.query(DiseaseCase).filter(DiseaseCase.status == "PENDING").count()
    verified_cases = db.query(DiseaseCase).filter(DiseaseCase.status.in_(["VERIFIED", "RESOLVED"])).count()
    
    escalation_rate = round((total_cases / total_scans * 100.0), 1) if total_scans > 0 else 0.0
    verification_rate = round((verified_cases / total_cases * 100.0), 1) if total_cases > 0 else 0.0

    return {
        "total_farmers": total_farmers,
        "total_farms": total_farms,
        "total_scans": total_scans,
        "total_cases": total_cases,
        "pending_cases": pending_cases,
        "verified_cases": verified_cases,
        "ai_escalation_rate": escalation_rate,
        "officer_verification_rate": verification_rate
    }

@router.get("/districts")
def get_district_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    results = db.query(
        DiseaseCase.district,
        func.count(DiseaseCase.id).label("case_count")
    ).group_by(DiseaseCase.district).all()

    return [{"district": r[0], "cases": r[1]} for r in results]

@router.get("/crops")
def get_crop_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    results = db.query(
        CropScan.crop,
        func.count(CropScan.id).label("scan_count")
    ).group_by(CropScan.crop).all()

    return [{"crop": r[0], "scans": r[1]} for r in results]

@router.get("/diseases")
def get_disease_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    results = db.query(
        CropScan.predicted_disease,
        func.count(CropScan.id).label("count")
    ).group_by(CropScan.predicted_disease).all()

    return [{"disease": r[0], "count": r[1]} for r in results]
