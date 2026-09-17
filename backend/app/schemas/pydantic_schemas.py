import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict

# Auth Schemas
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: Optional[str] = "FARMER"
    district: Optional[str] = "Pune"
    taluka: Optional[str] = "Baramati"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    full_name: str
    email: str
    role: str
    district: Optional[str]
    taluka: Optional[str]

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    phone: Optional[str]
    role: str
    district: Optional[str]
    taluka: Optional[str]
    created_at: datetime.datetime

# Farm Schemas
class FarmCreate(BaseModel):
    farm_name: str
    district: str
    taluka: str
    crop: str
    variety: Optional[str] = None
    soil_type: Optional[str] = "Black Soil"
    area_acres: Optional[float] = 1.0
    latitude: float
    longitude: float

class FarmOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    farm_name: str
    district: str
    taluka: str
    crop: str
    variety: Optional[str]
    soil_type: Optional[str]
    area_acres: float
    latitude: float
    longitude: float
    created_at: datetime.datetime

# Scan & Analysis Schemas
class ScanAnalyzeRequest(BaseModel):
    farm_id: Optional[int] = None
    crop: str
    image_base64: str

class ScanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farmer_id: int
    farm_id: Optional[int]
    image_url: str
    iqa_status: str
    iqa_score: float
    crop: str
    predicted_disease: str
    confidence: float
    ood_distance: float
    is_ood: bool
    safety_gate_action: str
    severity: str
    affected_area_percent: float
    created_at: datetime.datetime

# Case & Officer Review Schemas
class OfficerReviewCreate(BaseModel):
    case_id: int
    verified_diagnosis: str
    severity_adjusted: str
    review_notes: Optional[str] = ""
    status: Optional[str] = "VERIFIED"

class DiseaseCaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scan_id: int
    farmer_id: int
    officer_id: Optional[int]
    district: str
    taluka: str
    crop: str
    predicted_disease: str
    verified_disease: Optional[str]
    severity: str
    status: str
    escalation_reason: Optional[str]
    officer_notes: Optional[str]
    image_url: Optional[str] = None
    scan: Optional[ScanOut] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

# IPM Advisory Schema
class AdvisoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    crop: str
    disease_name: str
    cultural_control: str
    biological_control: str
    approved_chemical_control: str
    safety_warning: str

# Weather & Analytics Schemas
class WeatherOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    district: str
    taluka: str
    temp_c: float
    humidity_percent: float
    rainfall_mm: float
    wind_speed_kmph: float
    weather_condition: str
    recorded_at: datetime.datetime

class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    type: str
    case_id: Optional[int]
    created_at: datetime.datetime
