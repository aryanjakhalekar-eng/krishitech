"""
KrishiRakshak AI — Demo Case Image Attachment & Verification Script

1. Backs up database to backend/krishirakshak_before_demo_images.db.
2. Iterates over all DiseaseCase & CropScan records.
3. Attaches authentic local image paths under /static/demo_crops/ matching crop & disease.
4. Distributes unique images across cases so cases don't all look identical.
5. Verifies all cases have valid images on disk.
6. Prints a detailed audit report.
"""

import os
import sys
import shutil
from pathlib import Path
from collections import defaultdict

# Setup paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.database.session import SessionLocal
from backend.app.models.domain import DiseaseCase, CropScan

DB_FILE = PROJECT_ROOT / "backend" / "krishirakshak.db"
BACKUP_FILE = PROJECT_ROOT / "backend" / "krishirakshak_before_demo_images.db"
STATIC_DIR = PROJECT_ROOT / "backend" / "app" / "static" / "demo_crops"

def backup_database():
    print("=" * 60)
    print("STEP 1: DATABASE BACKUP")
    print("=" * 60)
    if DB_FILE.exists():
        shutil.copy2(DB_FILE, BACKUP_FILE)
        print(f"Backed up {DB_FILE} -> {BACKUP_FILE} ({BACKUP_FILE.stat().st_size} bytes)")
    else:
        print(f"Database {DB_FILE} does not exist yet.")

def index_available_images():
    """Index all available images on disk grouped by category."""
    images = defaultdict(list)
    for crop_dir in STATIC_DIR.iterdir():
        if crop_dir.is_dir():
            for disease_dir in crop_dir.iterdir():
                if disease_dir.is_dir():
                    key = f"{crop_dir.name}/{disease_dir.name}"
                    img_files = sorted(list(disease_dir.glob("*.jpg")) + list(disease_dir.glob("*.png")))
                    # Store web-accessible paths
                    for img in img_files:
                        rel_path = img.relative_to(PROJECT_ROOT / "backend" / "app")
                        web_path = "/" + str(rel_path).replace("\\", "/")
                        images[key].append(web_path)
    return images

def map_case_to_image_category(crop: str, disease: str) -> str:
    """Determine the best demo image folder for a given crop and predicted/verified disease."""
    c = (crop or "").strip().lower()
    d = (disease or "").strip().lower()

    if "tomato" in c:
        if "healthy" in d:
            return "tomato/healthy"
        elif "early" in d:
            return "tomato/early_blight"
        elif "late" in d:
            return "tomato/late_blight"
        elif "mold" in d or "spot" in d:
            return "tomato/leaf_mold"
        else:
            # Fallback rotation across tomato diseases
            return "tomato/early_blight"
    elif "rice" in c or "paddy" in c:
        if "healthy" in d:
            return "rice/healthy"
        elif "blast" in d:
            return "rice/leaf_blast"
        elif "brown" in d:
            return "rice/brown_spot"
        elif "bacterial" in d or "blight" in d:
            return "rice/bacterial_leaf_blight"
        elif "tungro" in d:
            return "rice/tungro"
        else:
            # Fallback rotation across rice diseases
            return "rice/leaf_blast"
    else:
        # Non-agricultural / unknown
        return "general/non_plant"

def attach_images():
    print("\n" + "=" * 60)
    print("STEP 2: ATTACHING IMAGES TO DISEASE CASES & SCANS")
    print("=" * 60)

    db = SessionLocal()
    available_images = index_available_images()

    print(f"Available Image Categories & Pool Sizes:")
    for cat, pool in sorted(available_images.items()):
        print(f"  - {cat}: {len(pool)} images")

    # Track usage pointers for even distribution
    category_indices = defaultdict(int)

    cases = db.query(DiseaseCase).order_by(DiseaseCase.id.asc()).all()
    print(f"\nProcessing {len(cases)} Disease Cases in database...")

    updated_cases = 0
    updated_scans = 0

    # Tomato general fallback cycling
    tomato_pool = [
        "tomato/early_blight",
        "tomato/late_blight",
        "tomato/leaf_mold",
        "tomato/healthy"
    ]
    tomato_cycle_idx = 0

    # Rice general fallback cycling
    rice_pool = [
        "rice/bacterial_leaf_blight",
        "rice/brown_spot",
        "rice/leaf_blast",
        "rice/tungro",
        "rice/healthy"
    ]
    rice_cycle_idx = 0

    case_image_audit = []

    for case in cases:
        scan = db.query(CropScan).filter(CropScan.id == case.scan_id).first() if case.scan_id else None

        c_lower = (case.crop or "").lower()
        d_lower = (case.predicted_disease or "").lower()

        if "tomato" in c_lower and ("unsupported" in d_lower or "unknown" in d_lower):
            target_cat = tomato_pool[tomato_cycle_idx % len(tomato_pool)]
            tomato_cycle_idx += 1
        elif "rice" in c_lower and ("unsupported" in d_lower or "unknown" in d_lower):
            target_cat = rice_pool[rice_cycle_idx % len(rice_pool)]
            rice_cycle_idx += 1
        else:
            target_cat = map_case_to_image_category(case.crop, case.predicted_disease)

        pool = available_images.get(target_cat, [])
        if not pool:
            # Fallback to any available tomato or general image
            pool = available_images.get("tomato/early_blight") or available_images.get("general/non_plant") or []

        if pool:
            idx = category_indices[target_cat] % len(pool)
            chosen_img_url = pool[idx]
            category_indices[target_cat] += 1
        else:
            chosen_img_url = "/static/demo_crops/tomato/early_blight/early_blight_01.jpg"

        # Update Scan
        if scan:
            scan.image_url = chosen_img_url
            updated_scans += 1
        else:
            # If scan doesn't exist, create a corresponding CropScan
            new_scan = CropScan(
                farmer_id=case.farmer_id,
                farm_id=None,
                image_url=chosen_img_url,
                iqa_status="GOOD",
                iqa_score=0.92,
                crop=case.crop,
                predicted_disease=case.predicted_disease,
                confidence=0.88,
                ood_distance=2.1,
                is_ood=False,
                safety_gate_action="AUTO_APPROVED",
                severity=case.severity or "MEDIUM",
                affected_area_percent=25.0
            )
            db.add(new_scan)
            db.flush()
            case.scan_id = new_scan.id
            updated_scans += 1

        updated_cases += 1
        case_image_audit.append((case.id, case.crop, case.predicted_disease, case.status, chosen_img_url))

    # Also update any orphan CropScans without cases
    all_scans = db.query(CropScan).all()
    for sc in all_scans:
        if not sc.image_url or sc.image_url.startswith("data:") or "unsplash" in sc.image_url:
            cat = map_case_to_image_category(sc.crop, sc.predicted_disease)
            pool = available_images.get(cat, available_images.get("tomato/healthy", []))
            if pool:
                idx = category_indices[cat] % len(pool)
                sc.image_url = pool[idx]
                category_indices[cat] += 1

    db.commit()

    print("\n" + "=" * 60)
    print("STEP 3: AUDIT & VERIFICATION REPORT")
    print("=" * 60)
    print(f"Total Cases: {len(cases)}")
    print(f"Cases with Image URL: {updated_cases}")
    print(f"Cases without Image URL: 0")

    # Verify physical file existence
    missing_files = 0
    for case_id, crop, disease, status, img_url in case_image_audit:
        phys_path = PROJECT_ROOT / "backend" / "app" / img_url.lstrip("/")
        if not phys_path.exists():
            print(f"  ERROR: Case #{case_id} points to missing file: {phys_path}")
            missing_files += 1

    if missing_files == 0:
        print("ALL case image URLs resolve to existing physical files on disk!")
    else:
        print(f"WARNING: {missing_files} files were not found on disk!")

    # Summary by crop & disease
    print("\nBreakdown by Crop & Disease:")
    breakdown = defaultdict(int)
    for _, crop, disease, _, img_url in case_image_audit:
        breakdown[f"{crop} | {disease}"] += 1

    for k, cnt in sorted(breakdown.items()):
        print(f"  {k:<45}: {cnt} cases")

    print("\nFirst 10 Cases Sample:")
    for case_id, crop, disease, status, img_url in case_image_audit[:10]:
        print(f"  Case #{case_id:<3} [{status:<10}] {crop} - {disease}: {img_url}")

    db.close()
    print("\nImage attachment completed successfully!")

if __name__ == "__main__":
    backup_database()
    attach_images()
