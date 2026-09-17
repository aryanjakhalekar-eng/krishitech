import base64
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.domain import User, Farm, CropScan, DiseaseCase, Notification
from backend.app.schemas.pydantic_schemas import ScanAnalyzeRequest, ScanOut
from backend.app.auth.security import get_current_user
from backend.app.utils.iqa import ImageQualityAnalyzer
from backend.app.utils.ood import OutOfDistributionDetector
from backend.app.utils.severity import DamageSeverityEstimator
from backend.app.ml.image_ai import MobileNetV3SmallClassifier
from backend.app.ml.safety_gate import AISafetyGate
from backend.app.services.ipm_service import get_ipm_advisory

router = APIRouter(prefix="/api/scans", tags=["Crop Scans & AI Inference"])

iqa_analyzer        = ImageQualityAnalyzer()
mobilenet_classifier = MobileNetV3SmallClassifier()
ood_detector        = OutOfDistributionDetector()
severity_estimator  = DamageSeverityEstimator()
safety_gate         = AISafetyGate()


@router.post("/analyze")
def analyze_crop_image(
    req: ScanAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ── Decode image ──────────────────────────────────────────────────────────
    try:
        image_data = req.image_base64
        if "," in image_data:
            image_data = image_data.split(",")[1]
        img_bytes = base64.b64decode(image_data)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image encoding.")

    # ── 1. Image Quality Assessment (IQA first) ───────────────────────────────
    iqa_res = iqa_analyzer.analyze_image_bytes(img_bytes)
    if not iqa_res["is_usable"]:
        gate_res = safety_gate.evaluate(
            iqa_res,
            {"confidence": 0.0, "crop": req.crop, "domain_verification": {"is_supported_domain": True}},
            {"mahalanobis_distance": 0.0}
        )
        return {
            "scan_id":                    0,
            "crop_mismatch":              False,
            "selected_crop":              req.crop,
            "detected_crop":              req.crop,
            "crop":                       req.crop,
            "predicted_disease":          "Poor Image Quality",
            "confidence":                 0.0,
            "confidence_percentage":       0.0,
            "advisory_status":            "RETRY_PHOTO_REQUIRED",
            "iqa":                        iqa_res,
            "ood":                        {"mahalanobis_distance": 0.0, "ood_threshold": 4.50, "is_ood": False, "status": "IN_DISTRIBUTION", "message": "IQA check failed"},
            "severity":                   {"affected_area_percent": 0.0, "severity_level": "None", "message": "IQA check failed"},
            "safety_gate":                gate_res,
            "advisory": {
                "crop": req.crop,
                "disease_name": "Poor Image Quality",
                "cultural_control": "Please retake photograph in good natural lighting with camera focused on the leaf.",
                "biological_control": "No action until clear photo is provided.",
                "approved_chemical_control": "Chemical advisory held: photo quality insufficient.",
                "safety_warning": "Do not apply chemical pesticides without a clear diagnosis."
            },
            "escalated_case_id":          None,
            "inference_note":             "IQA Check Failed: Photo too blurry or dark. Please retake photo.",
        }

    # ── 2. THREE-STAGE AI prediction ──────────────────────────────────────────
    #   target_crop=req.crop is passed as the USER'S SELECTION HINT only.
    #   The model detects the actual crop from the image internally.
    ai_res = mobilenet_classifier.predict(img_bytes, target_crop=req.crop)

    response_type = ai_res.get("response_type", "DISEASE_PREDICTION")
    is_mismatch = (response_type == "CROP_MISMATCH")
    detected_crop = ai_res.get("detected_crop", ai_res.get("crop", "Unknown"))
    selected_crop = req.crop
    mismatch_msg = ai_res.get("mismatch_message") if is_mismatch else None

    # ── 3. Normal & Auto-Corrected Disease Evaluation Path ───────────────────
    ood_res      = ood_detector.evaluate_ood(ai_res["feature_vector"], crop=ai_res.get("crop"))
    severity_res = severity_estimator.estimate_damage(img_bytes)
    gate_res     = safety_gate.evaluate(iqa_res, ai_res, ood_res)

    advisory_res = (
        get_ipm_advisory(ai_res["crop"], ai_res["disease_name"])
        if gate_res["gate_passed"]
        else {
            "crop": ai_res["crop"],
            "disease_name": ai_res["disease_name"],
            "cultural_control": "Hold chemical applications until physical verification.",
            "biological_control": "Inspect field margins and isolate suspicious plants.",
            "approved_chemical_control": "Chemical advisory held pending expert verification.",
            "safety_warning": "Do not apply chemical pesticides without confirmed diagnosis.",
        }
    )

    district = current_user.district or "Pune"
    taluka   = current_user.taluka   or "Baramati"
    if req.farm_id:
        farm = db.query(Farm).filter(Farm.id == req.farm_id).first()
        if farm:
            district = farm.district; taluka = farm.taluka

    import uuid
    from pathlib import Path
    uploads_dir = Path(__file__).resolve().parent.parent / "static" / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    filename = f"scan_{uuid.uuid4().hex[:12]}.jpg"
    try:
        (uploads_dir / filename).write_bytes(img_bytes)
        stored_image_url = f"/static/uploads/{filename}"
    except Exception:
        stored_image_url = "/static/demo_crops/tomato/healthy/healthy_01.jpg"

    scan = CropScan(
        farmer_id=current_user.id,
        farm_id=req.farm_id,
        image_url=stored_image_url,
        iqa_status=iqa_res["status"],
        iqa_score=iqa_res["iqa_score"],
        crop=ai_res["crop"],
        predicted_disease=ai_res["disease_name"],
        confidence=ai_res["confidence"],
        ood_distance=ood_res["mahalanobis_distance"],
        is_ood=ood_res["is_ood"],
        safety_gate_action=gate_res["action"],
        severity=severity_res["severity_level"],
        affected_area_percent=severity_res["affected_area_percent"],
    )
    db.add(scan); db.commit(); db.refresh(scan)

    disease_case_id = None
    if gate_res["escalate_to_officer"]:
        disease_case = DiseaseCase(
            scan_id=scan.id, farmer_id=current_user.id,
            district=district, taluka=taluka,
            crop=ai_res["crop"], predicted_disease=ai_res["disease_name"],
            severity=severity_res["severity_level"],
            status="PENDING", escalation_reason=gate_res["reason"],
        )
        db.add(disease_case); db.commit(); db.refresh(disease_case)
        disease_case_id = disease_case.id
        notif = Notification(
            user_id=current_user.id,
            title="Scan Escalated to Agricultural Extension Officer",
            message=f"Your {ai_res['crop']} scan has been routed to the officer queue. Case ID: #{disease_case.id}.",
            type="CASE_UPDATE",
            case_id=disease_case.id,
        )
    elif is_mismatch:
        notif = Notification(
            user_id=current_user.id,
            title="Crop Mismatch Auto-Corrected",
            message=mismatch_msg or f"You selected {selected_crop}, but AI verified {detected_crop} ({ai_res['disease_name']}).",
            type="INFO",
        )
    else:
        notif = Notification(
            user_id=current_user.id,
            title="Crop Scan Analysed Successfully",
            message=f"Diagnosis: {ai_res['disease_name']} ({ai_res['confidence']*100:.0f}% confidence). AI Safety: PASSED.",
            type="INFO",
        )
    db.add(notif); db.commit()

    return {
        "scan_id":                    scan.id,
        "crop_mismatch":              is_mismatch,
        "selected_crop":              selected_crop,
        "detected_crop":              detected_crop,
        "crop":                       ai_res["crop"],
        "mismatch_message":           mismatch_msg,
        "predicted_disease":          ai_res["disease_name"],
        "confidence":                 ai_res["confidence"],
        "confidence_percentage":       round(ai_res["confidence"] * 100, 1),
        "domain_status":              (
            f"CROP_MISMATCH_{detected_crop.upper()}_DETECTED"
            if is_mismatch
            else ai_res.get("domain_verification", {}).get("domain_status", "UNKNOWN")
        ),
        "advisory_status":            "AUTOMATED_ADVISORY_APPROVED" if gate_res["gate_passed"] else "CHEMICAL_ADVISORY_WITHHELD",
        "iqa":                        iqa_res,
        "ood":                        ood_res,
        "severity":                   severity_res,
        "safety_gate":                gate_res,
        "advisory":                   advisory_res,
        "escalated_case_id":          disease_case_id,
        "inference_note":             ai_res["inference_mode"],
        "crop_classifier_confidence": ai_res.get("crop_classifier_confidence", 1.0),
    }


@router.get("", response_model=List[ScanOut])
def get_scans(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role in ["ADMIN", "OFFICER"]:
        return db.query(CropScan).order_by(CropScan.created_at.desc()).all()
    return (db.query(CropScan)
              .filter(CropScan.farmer_id == current_user.id)
              .order_by(CropScan.created_at.desc()).all())


@router.get("/{scan_id}")
def get_scan_details(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = db.query(CropScan).filter(CropScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")
    if current_user.role == "FARMER" and scan.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this scan record.")
    advisory = get_ipm_advisory(scan.crop, scan.predicted_disease)
    return {"scan": scan, "advisory": advisory}
