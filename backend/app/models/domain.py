import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="FARMER", index=True) # FARMER, OFFICER, ADMIN
    district = Column(String, nullable=True)
    taluka = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    farms = relationship("Farm", back_populates="owner", cascade="all, delete-orphan")
    scans = relationship("CropScan", back_populates="farmer", cascade="all, delete-orphan")
    cases = relationship("DiseaseCase", back_populates="farmer", foreign_keys="DiseaseCase.farmer_id")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    taluka = Column(String, nullable=False)
    crop = Column(String, nullable=False)
    variety = Column(String, nullable=True)
    soil_type = Column(String, nullable=True)
    area_acres = Column(Float, default=1.0)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    owner = relationship("User", back_populates="farms")
    scans = relationship("CropScan", back_populates="farm", cascade="all, delete-orphan")

class CropScan(Base):
    __tablename__ = "crop_scans"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)
    image_url = Column(String, nullable=False)
    iqa_status = Column(String, default="GOOD")
    iqa_score = Column(Float, default=0.95)
    crop = Column(String, nullable=False)
    predicted_disease = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    ood_distance = Column(Float, nullable=False)
    is_ood = Column(Boolean, default=False)
    safety_gate_action = Column(String, nullable=False) # AUTOMATED_ADVISORY, HUMAN_ESCALATION, RETRY_PHOTO
    severity = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH
    affected_area_percent = Column(Float, default=15.0)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    farmer = relationship("User", back_populates="scans")
    farm = relationship("Farm", back_populates="scans")
    case = relationship("DiseaseCase", back_populates="scan", uselist=False)

class DiseaseCase(Base):
    __tablename__ = "disease_cases"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("crop_scans.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    district = Column(String, nullable=False)
    taluka = Column(String, nullable=False)
    crop = Column(String, nullable=False)
    predicted_disease = Column(String, nullable=False)
    verified_disease = Column(String, nullable=True)
    severity = Column(String, default="MEDIUM")
    status = Column(String, default="PENDING", index=True) # PENDING, UNDER_REVIEW, VERIFIED, REJECTED, RESOLVED
    escalation_reason = Column(String, nullable=True)
    officer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    scan = relationship("CropScan", back_populates="case")
    farmer = relationship("User", back_populates="cases", foreign_keys=[farmer_id])
    reviews = relationship("OfficerReview", back_populates="case", cascade="all, delete-orphan")

    @property
    def image_url(self):
        return self.scan.image_url if self.scan else None

class OfficerReview(Base):
    __tablename__ = "officer_reviews"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("disease_cases.id"), nullable=False)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    original_diagnosis = Column(String, nullable=False)
    verified_diagnosis = Column(String, nullable=False)
    severity_adjusted = Column(String, nullable=False)
    review_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    case = relationship("DiseaseCase", back_populates="reviews")

class Advisory(Base):
    __tablename__ = "advisories"

    id = Column(Integer, primary_key=True, index=True)
    crop = Column(String, nullable=False, index=True)
    disease_name = Column(String, nullable=False, index=True)
    cultural_control = Column(Text, nullable=False)
    biological_control = Column(Text, nullable=False)
    approved_chemical_control = Column(Text, nullable=False)
    safety_warning = Column(Text, nullable=False)

class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)
    district = Column(String, nullable=False, index=True)
    taluka = Column(String, nullable=False)
    temp_c = Column(Float, nullable=False)
    humidity_percent = Column(Float, nullable=False)
    rainfall_mm = Column(Float, nullable=False)
    wind_speed_kmph = Column(Float, default=10.0)
    weather_condition = Column(String, default="Partly Cloudy")
    recorded_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    type = Column(String, default="INFO") # INFO, CASE_UPDATE, OUTBREAK_ALERT
    case_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    user = relationship("User", back_populates="notifications")
