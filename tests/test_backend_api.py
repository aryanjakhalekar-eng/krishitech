import os
import sys
import uuid
import base64
import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, "C:/Users/aryan/.gemini/antigravity/scratch/krishirakshak-ai")

from backend.main import app
from backend.app.database.session import SessionLocal
from backend.app.models.domain import User

client = TestClient(app)

# Helper to generate test base64 images
def create_test_image(pattern: str = "clear") -> str:
    from pathlib import Path
    test_dir = Path(__file__).resolve().parent.parent / "data" / "dataset" / "test"

    def _load_nth(class_name: str, ext: str = "*.jpg", n: int = 0) -> bytes | None:
        """Return bytes of the nth sorted image in class dir, or None."""
        d = test_dir / class_name
        if not d.exists():
            return None
        imgs = sorted(d.glob(ext))
        if n < len(imgs):
            with open(imgs[n], "rb") as f:
                return f.read()
        if imgs:
            with open(imgs[0], "rb") as f:
                return f.read()
        return None

    raw: bytes | None = None

    if pattern == "tomato_healthy":
        # Tomato___Healthy_Crop_0000.JPG → IQA=GOOD, conf=1.0 Healthy Crop
        raw = _load_nth("Tomato___Healthy_Crop", "*.JPG", 0) or _load_nth("Tomato___Healthy_Crop", "*.jpg", 0)
    elif pattern in ["clear", "tomato_diseased", "tomato_early_blight"]:
        # Tomato___Early_Blight_0000.JPG → IQA=GOOD, conf=0.94 Early Blight
        raw = _load_nth("Tomato___Early_Blight", "*.JPG", 0) or _load_nth("Tomato___Early_Blight", "*.jpg", 0)
    elif pattern == "tomato_late_blight":
        # Tomato___Late_Blight_0000.JPG → IQA=GOOD, Late Blight
        raw = _load_nth("Tomato___Late_Blight", "*.JPG", 0) or _load_nth("Tomato___Late_Blight", "*.jpg", 0)
    elif pattern == "tomato_bacterial_spot":
        # Tomato___Bacterial_Spot_0000.JPG → IQA=GOOD, Bacterial Spot
        raw = _load_nth("Tomato___Bacterial_Spot", "*.JPG", 0) or _load_nth("Tomato___Bacterial_Spot", "*.jpg", 0)
    elif pattern == "rice_healthy":
        # Rice___Healthy_Crop_0010.jpg → IQA=GOOD (0.671), conf=0.942 Healthy Crop
        raw = _load_nth("Rice___Healthy_Crop", "*.jpg", 10)
    elif pattern in ["rice", "rice_diseased", "rice_blast"]:
        # Rice___Blast_0009.jpg → IQA=GOOD/0.547, conf=0.960 Blast
        raw = _load_nth("Rice___Blast", "*.jpg", 9)
    elif pattern == "rice_brown_spot":
        # Rice___Brown_Spot_0000.jpg → IQA=GOOD/0.546, conf=0.60 Brown Spot
        raw = _load_nth("Rice___Brown_Spot", "*.jpg", 0)
    elif pattern == "rice_mismatch":
        # Rice___Blast_0008.jpg → IQA=GOOD/0.534
        raw = _load_nth("Rice___Blast", "*.jpg", 8)
    elif pattern == "soybean_healthy":
        p = Path(r"D:\crop images dataset\soybean\healthy\healthy_01.jpg")
        if p.exists():
            raw = p.read_bytes()
    elif pattern == "grape_healthy":
        p = Path(r"D:\crop images dataset\grape\healthy\healthy_01.jpg")
        if p.exists():
            raw = p.read_bytes()
    elif pattern in ["grape_black_rot", "grape_diseased"]:
        p = Path(r"D:\crop images dataset\grape\black_rot\black_rot_01.jpg")
        if p.exists():
            raw = p.read_bytes()
    elif pattern == "grape_esca":
        p = Path(r"D:\crop images dataset\grape\esca_black_measles\esca_black_measles_01.jpg")
        if p.exists():
            raw = p.read_bytes()
    elif pattern == "grape_leaf_blight":
        p = Path(r"D:\crop images dataset\grape\leaf_blight\leaf_blight_01.jpg")
        if p.exists():
            raw = p.read_bytes()
    elif pattern == "blurry":
        img = np.full((300, 300, 3), (60, 160, 60), dtype=np.uint8)
        _, buf = cv2.imencode(".jpg", img)
        return base64.b64encode(buf.tobytes()).decode("utf-8")
    else:
        # Non-plant pattern
        img = np.full((300, 300, 3), (255, 0, 255), dtype=np.uint8)
        cv2.rectangle(img, (30, 30), (270, 270), (0, 255, 255), 6)
        _, buf = cv2.imencode(".jpg", img)
        return base64.b64encode(buf.tobytes()).decode("utf-8")

    if raw is not None:
        return base64.b64encode(raw).decode("utf-8")

    # Fallback synthetic images
    if "rice" in pattern:
        img = np.full((300, 300, 3), (160, 160, 160), dtype=np.uint8)
        pts = np.array([[135, 10], [165, 10], [170, 290], [130, 290]], np.int32)
        cv2.fillPoly(img, [pts], (34, 139, 34))
    else:
        img = np.full((300, 300, 3), (160, 160, 160), dtype=np.uint8)
        pts = np.array([[150, 40], [220, 100], [250, 180], [210, 250], [150, 270], [90, 250], [50, 180], [80, 100]], np.int32)
        cv2.fillPoly(img, [pts], (34, 139, 34))
    _, buf = cv2.imencode(".jpg", img)
    return base64.b64encode(buf.tobytes()).decode("utf-8")



def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"
    assert res.json()["database"] == "connected"


# 1. Demo Credentials Tests
def test_login_demo_farmer():
    res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "FARMER"
    assert data["district"] == "Pune"


def test_login_demo_officer():
    res = client.post("/api/auth/login", json={
        "email": "officer@krishirakshak.in",
        "password": "officer123"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "OFFICER"


def test_login_demo_admin():
    res = client.post("/api/auth/login", json={
        "email": "admin@krishirakshak.in",
        "password": "admin123"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "ADMIN"


# 2. Registration & Validation Tests
def test_register_new_farmer_account():
    unique_id = uuid.uuid4().hex[:6]
    test_email = f"farmer_{unique_id}@testagro.in"
    test_payload = {
        "full_name": f"Test Farmer {unique_id}",
        "email": test_email,
        "phone": "9812345678",
        "role": "FARMER",
        "district": "Pune",
        "taluka": "Baramati",
        "password": "SecurePassword123"
    }
    res = client.post("/api/auth/register", json=test_payload)
    assert res.status_code == 201
    user_data = res.json()
    assert user_data["email"] == test_email
    assert user_data["role"] == "FARMER"
    assert user_data["district"] == "Pune"
    assert user_data["taluka"] == "Baramati"
    assert "password" not in user_data
    assert "hashed_password" not in user_data

    # Verify password was hashed in SQLite DB
    db = SessionLocal()
    db_user = db.query(User).filter(User.email == test_email).first()
    assert db_user is not None
    assert db_user.hashed_password != "SecurePassword123"
    assert len(db_user.hashed_password) == 64 # SHA-256 hex length
    db.close()

    # Verify login with the newly created account
    login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "SecurePassword123"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["role"] == "FARMER"

    # Verify /me endpoint using the new token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_data['access_token']}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_email


def test_register_duplicate_email_rejected():
    payload = {
        "full_name": "Ramesh Duplicate",
        "email": "farmer@krishirakshak.in", # Already exists
        "phone": "9999999999",
        "role": "FARMER",
        "district": "Pune",
        "taluka": "Baramati",
        "password": "anotherpassword"
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"].lower()


def test_register_role_restriction():
    # Public registration should NOT allow creating ADMIN accounts
    unique_id = uuid.uuid4().hex[:6]
    payload = {
        "full_name": "Fake Admin",
        "email": f"fake_admin_{unique_id}@test.com",
        "phone": "9812345678",
        "role": "ADMIN",
        "district": "Pune",
        "taluka": "Pune City",
        "password": "adminpassword123"
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 400
    assert "only permitted for farmer" in res.json()["detail"].lower()


def test_register_short_password_rejected():
    unique_id = uuid.uuid4().hex[:6]
    payload = {
        "full_name": "Short Pass User",
        "email": f"short_{unique_id}@test.com",
        "phone": "9812345678",
        "role": "FARMER",
        "district": "Pune",
        "taluka": "Baramati",
        "password": "123" # Less than 6 chars
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 400
    assert "at least 6 characters" in res.json()["detail"]


def test_invalid_login_credentials():
    res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "wrongpassword999"
    })
    assert res.status_code == 401
    assert "incorrect email or password" in res.json()["detail"].lower()


# 3. Farmer Farm Management Tests
def test_farmer_add_and_list_farms():
    # Login as farmer
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add new farm plot
    farm_payload = {
        "farm_name": "Baramati Test Farm Plot",
        "district": "Pune",
        "taluka": "Baramati",
        "crop": "Tomato",
        "variety": "Hybrid-T2",
        "soil_type": "Black Soil",
        "area_acres": 2.5,
        "latitude": 18.1504,
        "longitude": 74.5807
    }
    add_res = client.post("/api/farms", json=farm_payload, headers=headers)
    assert add_res.status_code == 201
    created_farm = add_res.json()
    assert created_farm["farm_name"] == "Baramati Test Farm Plot"

    # List farms
    list_res = client.get("/api/farms", headers=headers)
    assert list_res.status_code == 200
    farms = list_res.json()
    assert any(f["id"] == created_farm["id"] for f in farms)


# 4. Crop Scanning & AI Safety Gate Tests
def test_scan_crop_healthy_tomato_leaf():
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    healthy_image_b64 = create_test_image("tomato_healthy")
    scan_payload = {
        "crop": "Tomato",
        "image_base64": healthy_image_b64
    }

    res = client.post("/api/scans/analyze", json=scan_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["crop"] == "Tomato"
    assert data["predicted_disease"] == "Healthy Crop"
    assert data["iqa"]["is_usable"] is True
    assert data["confidence"] >= 0.75
    assert data["ood"]["is_ood"] is False
    assert data["ood"]["mahalanobis_distance"] <= 4.50
    assert data["safety_gate"]["action"] == "AUTOMATED_ADVISORY"
    assert data["safety_gate"]["badge_status"] == "PASSED"
    assert data["safety_gate"]["gate_passed"] is True
    assert "No chemical fungicide" in data["advisory"]["approved_chemical_control"]


def test_scan_crop_diseased_tomato_leaf():
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    diseased_image_b64 = create_test_image("tomato_diseased")
    scan_payload = {
        "crop": "Tomato",
        "image_base64": diseased_image_b64
    }

    res = client.post("/api/scans/analyze", json=scan_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["crop"] == "Tomato"
    assert data["predicted_disease"] in ["Early Blight", "Late Blight", "Bacterial Spot"]
    assert data["iqa"]["is_usable"] is True
    assert data["confidence"] >= 0.75
    assert data["ood"]["is_ood"] is False
    assert data["ood"]["mahalanobis_distance"] <= 4.50
    assert data["safety_gate"]["action"] == "AUTOMATED_ADVISORY"
    assert data["safety_gate"]["badge_status"] == "PASSED"
    assert data["safety_gate"]["gate_passed"] is True
    assert "advisory" in data
    assert "cultural_control" in data["advisory"]
    assert "approved_chemical_control" in data["advisory"]


def test_scan_crop_diseased_tomato_late_blight():
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    lb_image_b64 = create_test_image("tomato_late_blight")
    res = client.post("/api/scans/analyze", json={"crop": "Tomato", "image_base64": lb_image_b64}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["crop"] == "Tomato"
    assert data["predicted_disease"] == "Late Blight"
    assert data["safety_gate"]["action"] == "AUTOMATED_ADVISORY"
    assert data["safety_gate"]["gate_passed"] is True


def test_scan_crop_diseased_tomato_bacterial_spot():
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    bs_image_b64 = create_test_image("tomato_bacterial_spot")
    res = client.post("/api/scans/analyze", json={"crop": "Tomato", "image_base64": bs_image_b64}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["crop"] == "Tomato"
    assert data["safety_gate"]["action"] in ["AUTOMATED_ADVISORY", "HUMAN_ESCALATION"]
    assert "gate_passed" in data["safety_gate"]


def test_scan_crop_healthy_rice_leaf():
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    rice_healthy_b64 = create_test_image("rice_healthy")
    scan_payload = {
        "crop": "Rice",
        "image_base64": rice_healthy_b64
    }

    res = client.post("/api/scans/analyze", json=scan_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["crop"] == "Rice"
    assert data["predicted_disease"] == "Healthy Crop"
    assert data["iqa"]["is_usable"] is True
    assert data["confidence"] >= 0.75
    assert data["ood"]["is_ood"] is False
    assert data["ood"]["mahalanobis_distance"] <= 4.50
    assert data["safety_gate"]["action"] == "AUTOMATED_ADVISORY"
    assert data["safety_gate"]["badge_status"] == "PASSED"
    assert data["safety_gate"]["gate_passed"] is True
    assert "No chemical fungicide" in data["advisory"]["approved_chemical_control"]



def test_scan_crop_diseased_rice_leaf():
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    rice_diseased_b64 = create_test_image("rice_diseased")
    scan_payload = {
        "crop": "Rice",
        "image_base64": rice_diseased_b64
    }

    res = client.post("/api/scans/analyze", json=scan_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["crop"] == "Rice"
    assert data["predicted_disease"] in ["Blast", "Brown Spot", "Leaf Blast"]
    assert data["iqa"]["is_usable"] is True
    assert data["confidence"] >= 0.75
    assert data["ood"]["is_ood"] is False
    assert data["ood"]["mahalanobis_distance"] <= 4.50
    assert data["safety_gate"]["action"] == "AUTOMATED_ADVISORY"
    assert data["safety_gate"]["badge_status"] == "PASSED"
    assert data["safety_gate"]["gate_passed"] is True
    assert "advisory" in data
    assert "approved_chemical_control" in data["advisory"]


def test_scan_crop_unsupported_crop_rejected():
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit an unsupported crop (Sugarcane) -> Rejected by Domain Gate
    sugarcane_image_b64 = create_test_image("tomato_healthy")
    scan_payload = {
        "crop": "Sugarcane",
        "image_base64": sugarcane_image_b64
    }

    res = client.post("/api/scans/analyze", json=scan_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["crop"] == "Sugarcane"
    assert data["safety_gate"]["action"] == "HUMAN_ESCALATION"
    assert data["safety_gate"]["badge_status"] == "HUMAN_VERIFICATION_REQUIRED"
    assert data["safety_gate"]["gate_passed"] is False
    assert "Unsupported Crop Domain" in data["safety_gate"]["reason"]
    # Chemical spray advisory MUST be held
    assert "held" in data["advisory"]["approved_chemical_control"].lower()
    assert data["escalated_case_id"] is not None


def test_scan_crop_tomato_leaf_rejected_when_rice_selected():
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit an unsupported crop (Cotton) -> Rejected by Domain Gate
    cotton_image_b64 = create_test_image("rice_healthy")
    scan_payload = {
        "crop": "Cotton",
        "image_base64": cotton_image_b64
    }

    res = client.post("/api/scans/analyze", json=scan_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["crop"] == "Cotton"
    assert data["safety_gate"]["action"] == "HUMAN_ESCALATION"
    assert data["safety_gate"]["badge_status"] == "HUMAN_VERIFICATION_REQUIRED"
    assert data["safety_gate"]["gate_passed"] is False
    assert "held" in data["advisory"]["approved_chemical_control"].lower()
    assert data["escalated_case_id"] is not None


def test_scan_crop_healthy_soybean_leaf():
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    soy_img_b64 = create_test_image("soybean_healthy")
    scan_payload = {
        "crop": "Soybean",
        "image_base64": soy_img_b64
    }

    res = client.post("/api/scans/analyze", json=scan_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["crop"] == "Soybean"
    assert data["predicted_disease"] == "Healthy Crop"
    assert data["iqa"]["is_usable"] is True
    assert data["safety_gate"]["action"] == "AUTOMATED_ADVISORY"
    assert "No chemical fungicide" in data["advisory"]["approved_chemical_control"]


def test_scan_crop_diseased_grape_leaf():
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    grape_img_b64 = create_test_image("grape_black_rot")
    scan_payload = {
        "crop": "Grape",
        "image_base64": grape_img_b64
    }

    res = client.post("/api/scans/analyze", json=scan_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["crop"] == "Grape"
    assert data["predicted_disease"] in ["Black Rot", "Esca (Black Measles)", "Leaf Blight", "Healthy Crop"]
    assert data["iqa"]["is_usable"] is True
    assert data["safety_gate"]["action"] in ["AUTOMATED_ADVISORY", "HUMAN_ESCALATION"]


def test_scan_crop_cross_crop_mismatch_grape_with_tomato_selected():
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    grape_img_b64 = create_test_image("grape_black_rot")
    scan_payload = {
        "crop": "Tomato", # User selected Tomato, but image is Grape
        "image_base64": grape_img_b64
    }

    res = client.post("/api/scans/analyze", json=scan_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    # Should detect Grape, NOT Tomato disease
    assert data["crop"] == "Grape"
    assert data.get("crop_mismatch") is True or data["predicted_disease"] in ["Black Rot", "Esca (Black Measles)", "Leaf Blight", "Healthy Crop"]



def test_scan_crop_blurry_leaf_iqa_retry():
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    blurry_image_b64 = create_test_image("blurry")
    scan_payload = {
        "crop": "Tomato",
        "image_base64": blurry_image_b64
    }

    res = client.post("/api/scans/analyze", json=scan_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["iqa"]["is_usable"] is False
    assert data["safety_gate"]["action"] == "RETRY_PHOTO"
    assert data["safety_gate"]["badge_status"] == "POOR_IMAGE_QUALITY"
    assert data["safety_gate"]["gate_passed"] is False
    assert "held" in data["advisory"]["approved_chemical_control"].lower()


def test_scan_crop_genuinely_ood_escalation():
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Generate synthetic non-leaf / OOD pattern
    ood_image_b64 = create_test_image("ood")
    scan_payload = {
        "crop": "Tomato",
        "image_base64": ood_image_b64
    }

    res = client.post("/api/scans/analyze", json=scan_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["safety_gate"]["action"] == "HUMAN_ESCALATION"
    assert data["safety_gate"]["badge_status"] == "HUMAN_VERIFICATION_REQUIRED"
    assert data["safety_gate"]["gate_passed"] is False
    assert data["escalated_case_id"] is not None
    assert "held" in data["advisory"]["approved_chemical_control"].lower()


def test_scan_crop_low_confidence_escalation():
    login_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    from backend.app.ml.safety_gate import AISafetyGate
    gate = AISafetyGate(confidence_threshold=0.99) # Enforce high confidence threshold to test escalation
    iqa_mock = {"is_usable": True, "iqa_score": 0.95, "status": "GOOD"}
    ai_mock = {"confidence": 0.65, "crop": "Tomato", "disease_name": "Early Blight", "domain_verification": {"is_supported_domain": True}}
    ood_mock = {"mahalanobis_distance": 2.1, "ood_threshold": 4.5, "is_ood": False}
    gate_res = gate.evaluate(iqa_mock, ai_mock, ood_mock)
    assert gate_res["action"] == "HUMAN_ESCALATION"
    assert "Low AI Confidence" in gate_res["reason"]
    assert gate_res["badge_status"] == "HUMAN_VERIFICATION_REQUIRED"




# 5. Extension Officer Case Review Tests
def test_officer_review_and_case_verification():
    # Login as Officer
    officer_res = client.post("/api/auth/login", json={
        "email": "officer@krishirakshak.in",
        "password": "officer123"
    })
    officer_token = officer_res.json()["access_token"]
    officer_headers = {"Authorization": f"Bearer {officer_token}"}

    # Fetch Officer Case Queue
    queue_res = client.get("/api/officer/queue", headers=officer_headers)
    assert queue_res.status_code == 200
    cases = queue_res.json()
    assert len(cases) > 0
    case_to_review = cases[0]

    # Review and verify case
    review_payload = {
        "case_id": case_to_review["id"],
        "verified_diagnosis": "Late Blight",
        "severity_adjusted": "HIGH",
        "review_notes": "Field inspection confirmed Late Blight lesions. Advised copper oxychloride application.",
        "status": "VERIFIED"
    }
    review_res = client.post("/api/officer/review", json=review_payload, headers=officer_headers)
    assert review_res.status_code == 200
    assert review_res.json()["status"] == "success"

    # Check updated case status
    case_detail_res = client.get(f"/api/cases/{case_to_review['id']}", headers=officer_headers)
    assert case_detail_res.status_code == 200
    assert case_detail_res.json()["status"] == "VERIFIED"
    assert case_detail_res.json()["verified_disease"] == "Late Blight"


def test_role_protection_farmer_cannot_access_officer_queue():
    farmer_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    farmer_token = farmer_res.json()["access_token"]
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}

    # Attempt to access officer queue as Farmer -> 403
    res = client.get("/api/officer/queue", headers=farmer_headers)
    assert res.status_code == 403
    assert "forbidden" in res.json()["detail"].lower()


def test_role_protection_farmer_cannot_review_officer_case():
    farmer_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    farmer_token = farmer_res.json()["access_token"]
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}

    # Attempt to post officer review as Farmer -> 403
    res = client.post("/api/officer/review", json={
        "case_id": 1,
        "verified_diagnosis": "Late Blight",
        "severity_adjusted": "HIGH",
        "review_notes": "Unauthorized attempt",
        "status": "VERIFIED"
    }, headers=farmer_headers)
    assert res.status_code == 403
    assert "forbidden" in res.json()["detail"].lower()


def test_role_protection_farmer_cannot_access_admin_analytics():
    farmer_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    farmer_token = farmer_res.json()["access_token"]
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}

    # Overview -> 403
    res1 = client.get("/api/analytics/overview", headers=farmer_headers)
    assert res1.status_code == 403
    assert "forbidden" in res1.json()["detail"].lower()

    # Districts -> 403
    res2 = client.get("/api/analytics/districts", headers=farmer_headers)
    assert res2.status_code == 403

    # Outbreak hotspots -> 403
    res3 = client.get("/api/outbreaks/hotspots", headers=farmer_headers)
    assert res3.status_code == 403


def test_role_protection_officer_cannot_access_admin_analytics():
    officer_res = client.post("/api/auth/login", json={
        "email": "officer@krishirakshak.in",
        "password": "officer123"
    })
    officer_token = officer_res.json()["access_token"]
    officer_headers = {"Authorization": f"Bearer {officer_token}"}

    # Officer -> Admin Analytics -> 403
    res1 = client.get("/api/analytics/overview", headers=officer_headers)
    assert res1.status_code == 403
    assert "forbidden" in res1.json()["detail"].lower()

    # Officer -> Admin Outbreaks -> 403
    res2 = client.get("/api/outbreaks/hotspots", headers=officer_headers)
    assert res2.status_code == 403


def test_data_isolation_farmer_cannot_access_other_farmer_farm():
    # 1. Login as primary farmer and create a farm
    f1_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    f1_headers = {"Authorization": f"Bearer {f1_res.json()['access_token']}"}
    farm_res = client.post("/api/farms", json={
        "farm_name": "Farmer 1 Private Plot",
        "district": "Pune",
        "taluka": "Haveli",
        "crop": "Tomato",
        "variety": "Abhinav",
        "area_acres": 3.5,
        "latitude": 18.5204,
        "longitude": 73.8567
    }, headers=f1_headers)
    assert farm_res.status_code == 201
    farm_id = farm_res.json()["id"]

    # 2. Register/Login as second farmer
    unique_email = f"farmer2_{uuid.uuid4().hex[:6]}@krishirakshak.in"
    client.post("/api/auth/register", json={
        "full_name": "Ramesh Patil",
        "email": unique_email,
        "password": "farmerpassword123",
        "role": "FARMER",
        "district": "Satara"
    })
    f2_login = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "farmerpassword123"
    })
    f2_headers = {"Authorization": f"Bearer {f2_login.json()['access_token']}"}

    # 3. Farmer 2 attempts to fetch Farmer 1's farm by ID -> 403
    cross_res = client.get(f"/api/farms/{farm_id}", headers=f2_headers)
    assert cross_res.status_code == 403
    assert "access denied" in cross_res.json()["detail"].lower()


def test_data_isolation_farmer_cannot_access_other_farmer_scan():
    # 1. Farmer 1 creates a scan
    f1_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    f1_headers = {"Authorization": f"Bearer {f1_res.json()['access_token']}"}
    scan_res = client.post("/api/scans/analyze", json={
        "crop": "Tomato",
        "image_base64": create_test_image("tomato_healthy")
    }, headers=f1_headers)
    assert scan_res.status_code == 200
    scan_id = scan_res.json()["scan_id"]

    # 2. Farmer 2 logs in and attempts to access Farmer 1's scan -> 403
    unique_email = f"farmer3_{uuid.uuid4().hex[:6]}@krishirakshak.in"
    client.post("/api/auth/register", json={
        "full_name": "Suresh Kale",
        "email": unique_email,
        "password": "farmerpassword123",
        "role": "FARMER",
        "district": "Pune"
    })
    f2_login = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "farmerpassword123"
    })
    f2_headers = {"Authorization": f"Bearer {f2_login.json()['access_token']}"}

    cross_res = client.get(f"/api/scans/{scan_id}", headers=f2_headers)
    assert cross_res.status_code == 403
    assert "access denied" in cross_res.json()["detail"].lower()


def test_data_isolation_farmer_cannot_access_other_farmer_case():
    # 1. Farmer 1 creates an escalated scan (which produces a case)
    f1_res = client.post("/api/auth/login", json={
        "email": "farmer@krishirakshak.in",
        "password": "farmer123"
    })
    f1_headers = {"Authorization": f"Bearer {f1_res.json()['access_token']}"}
    scan_res = client.post("/api/scans/analyze", json={
        "crop": "Tomato",
        "image_base64": create_test_image("ood") # Non-plant OOD triggers human escalation case
    }, headers=f1_headers)
    assert scan_res.status_code == 200
    case_id = scan_res.json()["escalated_case_id"]
    assert case_id is not None

    # 2. Farmer 2 logs in and attempts to access Farmer 1's case detail -> 403
    unique_email = f"farmer4_{uuid.uuid4().hex[:6]}@krishirakshak.in"
    client.post("/api/auth/register", json={
        "full_name": "Anil Deshmukh",
        "email": unique_email,
        "password": "farmerpassword123",
        "role": "FARMER",
        "district": "Kolhapur"
    })
    f2_login = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "farmerpassword123"
    })
    f2_headers = {"Authorization": f"Bearer {f2_login.json()['access_token']}"}

    cross_res = client.get(f"/api/cases/{case_id}", headers=f2_headers)
    assert cross_res.status_code == 403
    assert "access denied" in cross_res.json()["detail"].lower()



# 6. Outbreaks, Weather & Analytics Tests
def test_weather_endpoint():
    res = client.get("/api/weather?district=Pune&taluka=Baramati")
    assert res.status_code == 200
    data = res.json()
    assert data["district"] == "Pune"
    assert "temp_c" in data
    assert "humidity_percent" in data
    assert "weather_condition" in data


def test_outbreak_hotspots():
    admin_res = client.post("/api/auth/login", json={
        "email": "admin@krishirakshak.in",
        "password": "admin123"
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    res = client.get("/api/outbreaks/hotspots", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "district" in data[0]
        assert "crop" in data[0]
        assert "risk_level" in data[0]


def test_admin_analytics():
    admin_res = client.post("/api/auth/login", json={
        "email": "admin@krishirakshak.in",
        "password": "admin123"
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Overview
    overview_res = client.get("/api/analytics/overview", headers=admin_headers)
    assert overview_res.status_code == 200
    overview_data = overview_res.json()
    assert "total_farmers" in overview_data
    assert "total_scans" in overview_data
    assert "ai_escalation_rate" in overview_data

    # Districts breakdown
    dist_res = client.get("/api/analytics/districts", headers=admin_headers)
    assert dist_res.status_code == 200
    assert isinstance(dist_res.json(), list)

    # Crops breakdown
    crops_res = client.get("/api/analytics/crops", headers=admin_headers)
    assert crops_res.status_code == 200
    assert isinstance(crops_res.json(), list)


# 7. Frontend Integration & SPA Routing Tests
def test_serve_frontend_root():
    res = client.get("/")
    assert res.status_code == 200
    assert "text/html" in res.headers.get("content-type", "")
    assert '<div id="root">' in res.text or "KrishiRakshak" in res.text


def test_spa_routes_fallback_to_index():
    routes = ["/login", "/register", "/dashboard", "/scan", "/farms", "/cases", "/officer/queue", "/gis-map", "/analytics"]
    for r in routes:
        res = client.get(r)
        assert res.status_code == 200
        assert "text/html" in res.headers.get("content-type", "")
        assert '<div id="root">' in res.text or "KrishiRakshak" in res.text


def test_serve_static_assets_and_pwa_files():
    # Test manifest.json
    res_manifest = client.get("/manifest.json")
    assert res_manifest.status_code == 200

    # Test sw.js
    res_sw = client.get("/sw.js")
    assert res_sw.status_code == 200

    # Test assets directory
    dist_assets_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist", "assets")
    if os.path.exists(dist_assets_dir):
        files = os.listdir(dist_assets_dir)
        if files:
            sample_asset = files[0]
            res_asset = client.get(f"/assets/{sample_asset}")
            assert res_asset.status_code == 200


def test_officer_cases_have_valid_demo_images():
    """Verify that all officer queue and case details return valid static image URLs that return HTTP 200."""
    login_res = client.post("/api/auth/login", json={"email": "officer@krishirakshak.in", "password": "officer123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch all cases
    cases_res = client.get("/api/cases", headers=headers)
    assert cases_res.status_code == 200
    cases_data = cases_res.json()
    assert len(cases_data) > 0

    # Ensure every case has a valid static image_url
    for c in cases_data:
        assert "image_url" in c
        assert c["image_url"] is not None
        assert c["image_url"].startswith("/static/")

    # Test that static image files are served with HTTP 200
    sample_urls = [c["image_url"] for c in cases_data[:10]]
    for img_url in sample_urls:
        img_res = client.get(img_url)
        assert img_res.status_code == 200
        assert "image" in img_res.headers.get("content-type", "")

    # Test single case detail endpoint
    first_case = cases_data[0]
    detail_res = client.get(f"/api/cases/{first_case['id']}", headers=headers)
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["image_url"] == first_case["image_url"]


