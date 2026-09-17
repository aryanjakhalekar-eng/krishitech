import os
import sys

# Ensure backend path is importable
sys.path.insert(0, "C:/Users/aryan/.gemini/antigravity/scratch/krishirakshak-ai")

from backend.app.database.session import engine, SessionLocal, Base
from backend.app.models.domain import User, Farm, CropScan, DiseaseCase, OfficerReview, Advisory, WeatherRecord, Notification
from backend.app.auth.security import hash_password
from backend.app.services.ipm_service import IPM_DATABASE

def seed_database():
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Checking/Seeding Demo Users...")
        farmer = db.query(User).filter(User.email == "farmer@krishirakshak.in").first()
        if not farmer:
            farmer = User(
                full_name="Ramesh Patil",
                email="farmer@krishirakshak.in",
                phone="9876543210",
                hashed_password=hash_password("farmer123"),
                role="FARMER",
                district="Pune",
                taluka="Baramati"
            )
            db.add(farmer)
            db.commit()
            db.refresh(farmer)
            print("  Created demo farmer: farmer@krishirakshak.in")

        officer = db.query(User).filter(User.email == "officer@krishirakshak.in").first()
        if not officer:
            officer = User(
                full_name="Gram Sevak Suresh Kulkarni",
                email="officer@krishirakshak.in",
                phone="9822012345",
                hashed_password=hash_password("officer123"),
                role="OFFICER",
                district="Pune",
                taluka="Baramati"
            )
            db.add(officer)
            db.commit()
            db.refresh(officer)
            print("  Created demo officer: officer@krishirakshak.in")

        admin = db.query(User).filter(User.email == "admin@krishirakshak.in").first()
        if not admin:
            admin = User(
                full_name="Dr. Ananya Deshmukh",
                email="admin@krishirakshak.in",
                phone="9422099999",
                hashed_password=hash_password("admin123"),
                role="ADMIN",
                district="Pune",
                taluka="Pune City"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("  Created demo admin: admin@krishirakshak.in")

        print("Checking/Seeding Farms...")
        existing_farms = db.query(Farm).filter(Farm.owner_id == farmer.id).count()
        if existing_farms == 0:
            farm1 = Farm(
                owner_id=farmer.id,
                farm_name="Patil Tomato & Soybean Estate",
                district="Pune",
                taluka="Baramati",
                crop="Tomato",
                variety="Hybrid-T1",
                soil_type="Black Soil",
                area_acres=3.5,
                latitude=18.1504,
                longitude=74.5807
            )
            farm2 = Farm(
                owner_id=farmer.id,
                farm_name="Baramati Grape Orchard",
                district="Pune",
                taluka="Baramati",
                crop="Grapes",
                variety="Thompson Seedless",
                soil_type="Loamy",
                area_acres=2.0,
                latitude=18.1620,
                longitude=74.5910
            )
            db.add_all([farm1, farm2])
            db.commit()
            db.refresh(farm1)
            db.refresh(farm2)
            print("  Created demo farms for farmer")
        else:
            farm1 = db.query(Farm).filter(Farm.owner_id == farmer.id).first()

        print("Checking/Seeding Crop Scans & AI Safety Gate Cases...")
        existing_scans = db.query(CropScan).filter(CropScan.farmer_id == farmer.id).count()
        if existing_scans == 0:
            # Scan 1: High Confidence PASS
            scan1 = CropScan(
                farmer_id=farmer.id,
                farm_id=farm1.id if farm1 else None,
                image_url="https://images.unsplash.com/photo-1592417817098-8f3d6ef23a6f?w=600",
                iqa_status="GOOD",
                iqa_score=0.92,
                crop="Tomato",
                predicted_disease="Early Blight",
                confidence=0.89,
                ood_distance=2.1,
                is_ood=False,
                safety_gate_action="AUTOMATED_ADVISORY",
                severity="MEDIUM",
                affected_area_percent=18.5
            )

            # Scan 2: Low Confidence FAIL -> Human Escalation
            scan2 = CropScan(
                farmer_id=farmer.id,
                farm_id=farm1.id if farm1 else None,
                image_url="https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=600",
                iqa_status="GOOD",
                iqa_score=0.88,
                crop="Tomato",
                predicted_disease="Late Blight",
                confidence=0.58,
                ood_distance=5.2,
                is_ood=True,
                safety_gate_action="HUMAN_ESCALATION",
                severity="HIGH",
                affected_area_percent=42.0
            )

            db.add_all([scan1, scan2])
            db.commit()
            db.refresh(scan1)
            db.refresh(scan2)

            # Escalated Disease Case
            case1 = DiseaseCase(
                scan_id=scan2.id,
                farmer_id=farmer.id,
                officer_id=officer.id,
                district="Pune",
                taluka="Baramati",
                crop="Tomato",
                predicted_disease="Late Blight",
                verified_disease="Late Blight",
                severity="HIGH",
                status="UNDER_REVIEW",
                escalation_reason="Low AI Confidence (58.0% < 75%) & Out-Of-Distribution Distance (5.20 > 4.50)",
                officer_notes="Inspected lesion pattern. Confirmed Late Blight outbreak risk. Advised immediate fungicide treatment."
            )
            db.add(case1)
            db.commit()
            db.refresh(case1)
            print("  Created demo scans and escalated case")

        print("Checking/Seeding Advisories...")
        if db.query(Advisory).count() == 0:
            for key, data in IPM_DATABASE.items():
                parts = key.split("_")
                crop_name = parts[0]
                disease_name = parts[1] if len(parts) > 1 else "Unknown"
                adv = Advisory(
                    crop=crop_name,
                    disease_name=disease_name,
                    cultural_control=data["cultural"],
                    biological_control=data["biological"],
                    approved_chemical_control=data["approved_chemical"],
                    safety_warning=data["safety_warning"]
                )
                db.add(adv)
            db.commit()
            print("  Seeded IPM advisories")

        print("Checking/Seeding Notifications...")
        if db.query(Notification).filter(Notification.user_id == farmer.id).count() == 0:
            n1 = Notification(
                user_id=farmer.id,
                title="High Disease Risk Alert: Baramati",
                message="High humidity and warm temperature in Pune/Baramati increase risk of Tomato Late Blight.",
                type="OUTBREAK_ALERT"
            )
            db.add(n1)
            db.commit()
            print("  Seeded demo notification")

        print("Database initialization and check completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
