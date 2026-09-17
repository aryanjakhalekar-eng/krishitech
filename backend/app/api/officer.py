from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.domain import User, DiseaseCase, OfficerReview, Notification
from backend.app.schemas.pydantic_schemas import OfficerReviewCreate, DiseaseCaseOut
from backend.app.auth.security import get_current_user, require_officer

router = APIRouter(prefix="/api/officer", tags=["Extension Officer Queue"])

@router.get("/queue", response_model=List[DiseaseCaseOut])
def get_officer_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer)
):
    query = db.query(DiseaseCase)
    if current_user.role == "OFFICER" and current_user.district:
        query = query.filter((DiseaseCase.district == current_user.district) | (DiseaseCase.status == "PENDING"))
    return query.filter(DiseaseCase.status.in_(["PENDING", "UNDER_REVIEW"])).order_by(DiseaseCase.created_at.asc()).all()

@router.post("/review")
def review_case(
    review_in: OfficerReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_officer)
):
    disease_case = db.query(DiseaseCase).filter(DiseaseCase.id == review_in.case_id).first()
    if not disease_case:
        raise HTTPException(status_code=404, detail="Disease case not found.")

    # Record Officer Review
    review = OfficerReview(
        case_id=disease_case.id,
        officer_id=current_user.id,
        original_diagnosis=disease_case.predicted_disease,
        verified_diagnosis=review_in.verified_diagnosis,
        severity_adjusted=review_in.severity_adjusted,
        review_notes=review_in.review_notes
    )
    db.add(review)

    # Update Disease Case Status
    disease_case.officer_id = current_user.id
    disease_case.verified_disease = review_in.verified_diagnosis
    disease_case.severity = review_in.severity_adjusted
    disease_case.officer_notes = review_in.review_notes
    disease_case.status = review_in.status or "VERIFIED"

    db.commit()

    # Notify Farmer
    notif = Notification(
        user_id=disease_case.farmer_id,
        title=f"Case #{disease_case.id} Verified by Officer",
        message=f"Gram Sevak {current_user.full_name} has verified your diagnosis: {review_in.verified_diagnosis}. Notes: {review_in.review_notes}",
        type="CASE_UPDATE",
        case_id=disease_case.id
    )
    db.add(notif)
    db.commit()

    return {
        "status": "success",
        "message": f"Case #{disease_case.id} successfully reviewed and marked as {disease_case.status}.",
        "case_id": disease_case.id
    }
