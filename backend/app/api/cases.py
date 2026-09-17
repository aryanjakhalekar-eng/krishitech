from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.domain import User, DiseaseCase, Notification
from backend.app.schemas.pydantic_schemas import DiseaseCaseOut
from backend.app.auth.security import get_current_user

router = APIRouter(prefix="/api/cases", tags=["Disease Cases"])

@router.get("", response_model=List[DiseaseCaseOut])
def get_cases(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DiseaseCase)
    if current_user.role == "FARMER":
        query = query.filter(DiseaseCase.farmer_id == current_user.id)
    elif current_user.role == "OFFICER":
        # Officers see cases in their district or all pending
        if current_user.district:
            query = query.filter((DiseaseCase.district == current_user.district) | (DiseaseCase.status == "PENDING"))
            
    if status_filter:
        query = query.filter(DiseaseCase.status == status_filter.upper())
        
    return query.order_by(DiseaseCase.created_at.desc()).all()

@router.get("/{case_id}", response_model=DiseaseCaseOut)
def get_case_detail(case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case_item = db.query(DiseaseCase).filter(DiseaseCase.id == case_id).first()
    if not case_item:
        raise HTTPException(status_code=404, detail="Disease case not found.")
    if current_user.role == "FARMER" and case_item.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this disease case.")
    return case_item

