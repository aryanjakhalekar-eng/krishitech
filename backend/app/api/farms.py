from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.domain import User, Farm
from backend.app.schemas.pydantic_schemas import FarmCreate, FarmOut
from backend.app.auth.security import get_current_user

router = APIRouter(prefix="/api/farms", tags=["Farms"])

@router.get("", response_model=List[FarmOut])
def get_farms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role in ["ADMIN", "OFFICER"]:
        return db.query(Farm).all()
    return db.query(Farm).filter(Farm.owner_id == current_user.id).all()

@router.post("", response_model=FarmOut, status_code=status.HTTP_201_CREATED)
def create_farm(farm_in: FarmCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = Farm(
        owner_id=current_user.id,
        farm_name=farm_in.farm_name,
        district=farm_in.district,
        taluka=farm_in.taluka,
        crop=farm_in.crop,
        variety=farm_in.variety,
        soil_type=farm_in.soil_type or "Black Soil",
        area_acres=farm_in.area_acres or 1.0,
        latitude=farm_in.latitude,
        longitude=farm_in.longitude
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm

@router.get("/{farm_id}", response_model=FarmOut)
def get_farm(farm_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found.")
    if current_user.role == "FARMER" and farm.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this farm.")
    return farm
