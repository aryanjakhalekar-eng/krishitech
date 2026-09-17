"""
Cross-Crop Protection Tests
============================
Verifies that crop identity comes from the IMAGE, not from the user selection.

CRITICAL CRITERIA:
  - Rice image + Tomato selected  → CROP_MISMATCH (never Tomato disease)
  - Tomato image + Rice selected  → CROP_MISMATCH (never Rice disease)
  - Rice image + Rice selected    → Rice disease (correct)
  - Tomato image + Tomato selected → Tomato disease (correct)
  - Non-plant image               → OOD_DOMAIN rejection

Tests FAIL if a cross-crop prediction leaks through as a disease result.
"""
import sys
from pathlib import Path
import pytest

# Allow running from project root
PROJECT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT))

from backend.app.ml.image_ai import MobileNetV3SmallClassifier

DATASET = Path(r"D:\crop images dataset")

@pytest.fixture(scope="module")
def clf():
    c = MobileNetV3SmallClassifier()
    assert c.is_trained, "All five models must be loaded for cross-crop tests."
    return c


def _load_image(path: Path) -> bytes:
    assert path.exists(), f"Test image not found: {path}"
    return path.read_bytes()


# ─── CORRECT-CROP TESTS ───────────────────────────────────────────────────────

def test_tomato_image_tomato_selected_predicts_tomato_disease(clf):
    """TEST 1: Correct crop — Tomato image + Tomato selected → Tomato disease."""
    img = _load_image(DATASET / "tomato" / "early_blight" / "early_blight_01.jpg")
    result = clf.predict(img, target_crop="Tomato")
    assert result["response_type"] == "DISEASE_PREDICTION", \
        f"Expected DISEASE_PREDICTION, got {result['response_type']}"
    assert result["crop"] == "Tomato", \
        f"Expected crop=Tomato, got {result['crop']}"
    assert result["disease_code"].startswith("TOM_"), \
        f"Expected Tomato disease code, got {result['disease_code']}"


def test_rice_image_rice_selected_predicts_rice_disease(clf):
    """TEST 2: Correct crop — Rice image + Rice selected → Rice disease."""
    img = _load_image(DATASET / "rice" / "tungro" / "tungro_01.jpg")
    result = clf.predict(img, target_crop="Rice")
    assert result["response_type"] == "DISEASE_PREDICTION", \
        f"Expected DISEASE_PREDICTION, got {result['response_type']}"
    assert result["crop"] == "Rice", \
        f"Expected crop=Rice, got {result['crop']}"
    assert result["disease_code"].startswith("RIC_"), \
        f"Expected Rice disease code, got {result['disease_code']}"


def test_tomato_healthy_tomato_selected(clf):
    """TEST 5: Healthy Tomato → Healthy Crop (Tomato)."""
    img = _load_image(DATASET / "tomato" / "healthy" / "healthy_01.jpg")
    result = clf.predict(img, target_crop="Tomato")
    assert result["response_type"] == "DISEASE_PREDICTION"
    assert result["crop"] == "Tomato"
    assert result["disease_code"].startswith("TOM_"), \
        f"Expected TOM_ code, got {result['disease_code']}"


def test_rice_healthy_rice_selected(clf):
    """TEST 6: Healthy Rice → Healthy Crop (Rice)."""
    img = _load_image(DATASET / "rice" / "healthy" / "healthy_01.jpg")
    result = clf.predict(img, target_crop="Rice")
    assert result["response_type"] == "DISEASE_PREDICTION"
    assert result["crop"] == "Rice"
    assert result["disease_code"].startswith("RIC_"), \
        f"Expected RIC_ code, got {result['disease_code']}"


def test_soybean_healthy_soybean_selected(clf):
    """TEST 7: Healthy Soybean → Healthy Crop (Soybean)."""
    img = _load_image(DATASET / "soybean" / "healthy" / "healthy_01.jpg")
    result = clf.predict(img, target_crop="Soybean")
    assert result["response_type"] == "DISEASE_PREDICTION"
    assert result["crop"] == "Soybean"
    assert result["disease_code"] == "SOY_HLT", \
        f"Expected SOY_HLT, got {result['disease_code']}"


def test_grape_healthy_grape_selected(clf):
    """TEST 8: Healthy Grape → Healthy Crop (Grape)."""
    img = _load_image(DATASET / "grape" / "healthy" / "healthy_01.jpg")
    result = clf.predict(img, target_crop="Grape")
    assert result["response_type"] == "DISEASE_PREDICTION"
    assert result["crop"] == "Grape"
    assert result["disease_code"] == "GRP_HLT", \
        f"Expected GRP_HLT, got {result['disease_code']}"


def test_grape_black_rot_grape_selected(clf):
    """TEST 9: Grape Black Rot → Black Rot (Grape)."""
    img = _load_image(DATASET / "grape" / "black_rot" / "black_rot_01.jpg")
    result = clf.predict(img, target_crop="Grape")
    assert result["response_type"] == "DISEASE_PREDICTION"
    assert result["crop"] == "Grape"
    assert result["disease_code"] == "GRP_BR", \
        f"Expected GRP_BR, got {result['disease_code']}"


def test_grape_esca_grape_selected(clf):
    """TEST 10: Grape Esca → Esca (Black Measles) (Grape)."""
    img = _load_image(DATASET / "grape" / "esca_black_measles" / "esca_black_measles_01.jpg")
    result = clf.predict(img, target_crop="Grape")
    assert result["response_type"] == "DISEASE_PREDICTION"
    assert result["crop"] == "Grape"
    assert result["disease_code"] == "GRP_ESC", \
        f"Expected GRP_ESC, got {result['disease_code']}"


def test_grape_leaf_blight_grape_selected(clf):
    """TEST 11: Grape Leaf Blight → Leaf Blight (Grape)."""
    img = _load_image(DATASET / "grape" / "leaf_blight" / "leaf_blight_01.jpg")
    result = clf.predict(img, target_crop="Grape")
    assert result["response_type"] == "DISEASE_PREDICTION"
    assert result["crop"] == "Grape"
    assert result["disease_code"] == "GRP_LB", \
        f"Expected GRP_LB, got {result['disease_code']}"


# ─── CROSS-CROP MISMATCH TESTS ────────────────────────────────────────────────

def test_rice_image_tomato_selected_returns_mismatch(clf):
    """
    TEST: Rice image + Tomato selected → MUST return CROP_MISMATCH.
    MUST NOT return any Tomato disease prediction.
    """
    img = _load_image(DATASET / "rice" / "tungro" / "tungro_01.jpg")
    result = clf.predict(img, target_crop="Tomato")
    assert result["response_type"] == "CROP_MISMATCH", (
        f"CRITICAL FAILURE: Rice image with Tomato selected returned "
        f"response_type={result['response_type']} "
        f"disease={result.get('disease_name')} "
        f"code={result.get('disease_code')} "
        f"— Rice image MUST NEVER produce a Tomato disease prediction."
    )
    assert result.get("disease_code") != "TOM_EB"
    assert result.get("disease_code") != "TOM_LB"
    assert result.get("disease_code") != "TOM_LM"
    assert result.get("disease_code") != "TOM_HLT"


def test_tomato_image_rice_selected_returns_mismatch(clf):
    """
    TEST: Tomato image + Rice selected → MUST return CROP_MISMATCH.
    MUST NOT return any Rice disease prediction.
    """
    img = _load_image(DATASET / "tomato" / "early_blight" / "early_blight_01.jpg")
    result = clf.predict(img, target_crop="Rice")
    assert result["response_type"] == "CROP_MISMATCH", (
        f"CRITICAL FAILURE: Tomato image with Rice selected returned "
        f"response_type={result['response_type']} "
        f"disease={result.get('disease_name')} "
        f"code={result.get('disease_code')} "
        f"— Tomato image MUST NEVER produce a Rice disease prediction."
    )
    assert result.get("disease_code") != "RIC_BLB"
    assert result.get("disease_code") != "RIC_BS"
    assert result.get("disease_code") != "RIC_BL"
    assert result.get("disease_code") != "RIC_HLT"


def test_rice_healthy_tomato_selected_returns_mismatch(clf):
    """Healthy Rice + Tomato selected → Mismatch (not Tomato healthy)."""
    img = _load_image(DATASET / "rice" / "healthy" / "healthy_01.jpg")
    result = clf.predict(img, target_crop="Tomato")
    assert result["response_type"] == "CROP_MISMATCH", \
        f"Healthy Rice leaf MUST NOT be classified as Tomato. Got: {result['response_type']} {result.get('disease_code')}"


def test_tomato_healthy_rice_selected_returns_mismatch(clf):
    """Healthy Tomato + Rice selected → Mismatch (not Rice healthy)."""
    img = _load_image(DATASET / "tomato" / "healthy" / "healthy_01.jpg")
    result = clf.predict(img, target_crop="Rice")
    assert result["response_type"] == "CROP_MISMATCH", \
        f"Healthy Tomato leaf MUST NOT be classified as Rice. Got: {result['response_type']} {result.get('disease_code')}"


def test_soybean_image_tomato_selected_returns_mismatch(clf):
    """Soybean image + Tomato selected → Mismatch."""
    img = _load_image(DATASET / "soybean" / "healthy" / "healthy_01.jpg")
    result = clf.predict(img, target_crop="Tomato")
    assert result["response_type"] == "CROP_MISMATCH"
    assert result["detected_crop"] == "Soybean"
    assert result["crop"] == "Soybean"
    assert not result["disease_code"].startswith("TOM_")


def test_grape_image_tomato_selected_returns_mismatch(clf):
    """Grape image + Tomato selected → Mismatch."""
    img = _load_image(DATASET / "grape" / "black_rot" / "black_rot_01.jpg")
    result = clf.predict(img, target_crop="Tomato")
    assert result["response_type"] == "CROP_MISMATCH"
    assert result["detected_crop"] == "Grape"
    assert result["crop"] == "Grape"
    assert not result["disease_code"].startswith("TOM_")


def test_grape_image_rice_selected_returns_mismatch(clf):
    """Grape image + Rice selected → Mismatch."""
    img = _load_image(DATASET / "grape" / "leaf_blight" / "leaf_blight_01.jpg")
    result = clf.predict(img, target_crop="Rice")
    assert result["response_type"] == "CROP_MISMATCH"
    assert result["detected_crop"] == "Grape"
    assert result["crop"] == "Grape"
    assert not result["disease_code"].startswith("RIC_")


def test_grape_image_soybean_selected_returns_mismatch(clf):
    """Grape image + Soybean selected → Mismatch."""
    img = _load_image(DATASET / "grape" / "healthy" / "healthy_01.jpg")
    result = clf.predict(img, target_crop="Soybean")
    assert result["response_type"] == "CROP_MISMATCH"
    assert result["detected_crop"] == "Grape"
    assert result["crop"] == "Grape"
    assert result["disease_code"] == "GRP_HLT"


def test_tomato_image_grape_selected_returns_mismatch(clf):
    """Tomato image + Grape selected → Mismatch."""
    img = _load_image(DATASET / "tomato" / "early_blight" / "early_blight_01.jpg")
    result = clf.predict(img, target_crop="Grape")
    assert result["response_type"] == "CROP_MISMATCH"
    assert result["detected_crop"] == "Tomato"
    assert result["crop"] == "Tomato"
    assert result["disease_code"].startswith("TOM_")


# ─── OOD / NON-PLANT TESTS ────────────────────────────────────────────────────

def test_non_plant_image_rejected(clf):
    """TEST: Non-plant image → OOD_DOMAIN rejection."""
    non_plant_dir = DATASET / "general" / "non_plant"
    imgs = list(non_plant_dir.glob("*.jpg")) + list(non_plant_dir.glob("*.png"))
    assert imgs, f"No non-plant images found in {non_plant_dir}"
    img = imgs[0].read_bytes()
    result = clf.predict(img, target_crop="Tomato")
    assert result["response_type"] in ("OOD_DOMAIN", "CROP_MISMATCH"), \
        f"Non-plant image must be rejected, got: {result['response_type']} {result.get('disease_code')}"
    assert result.get("disease_code") not in ("TOM_EB", "TOM_LB", "TOM_LM", "TOM_HLT",
                                               "RIC_BLB", "RIC_BS", "RIC_BL", "RIC_HLT", "RIC_TG",
                                               "SOY_HLT", "GRP_HLT", "GRP_BR", "GRP_ESC", "GRP_LB"), \
        f"Non-plant image must never produce a disease code, got: {result.get('disease_code')}"


# ─── MULTIPLE DISEASE CLASS TESTS ─────────────────────────────────────────────

@pytest.mark.parametrize("disease_class", [
    "early_blight", "healthy", "late_blight", "leaf_mold"
])
def test_all_tomato_classes_correct(clf, disease_class):
    """All Tomato disease classes predict as Tomato when Tomato is selected."""
    img_dir = DATASET / "tomato" / disease_class
    imgs = list(img_dir.glob("*.jpg"))
    assert imgs, f"No images for {disease_class}"
    result = clf.predict(imgs[0].read_bytes(), target_crop="Tomato")
    assert result["response_type"] == "DISEASE_PREDICTION", \
        f"{disease_class}: expected DISEASE_PREDICTION, got {result['response_type']}"
    assert result["disease_code"].startswith("TOM_"), \
        f"{disease_class}: expected TOM_ code, got {result['disease_code']}"


@pytest.mark.parametrize("disease_class", [
    "bacterial_leaf_blight", "brown_spot", "healthy", "leaf_blast", "tungro"
])
def test_all_rice_classes_correct(clf, disease_class):
    """All Rice disease classes predict as Rice when Rice is selected."""
    img_dir = DATASET / "rice" / disease_class
    imgs = list(img_dir.glob("*.jpg"))
    assert imgs, f"No images for {disease_class}"
    result = clf.predict(imgs[0].read_bytes(), target_crop="Rice")
    assert result["response_type"] == "DISEASE_PREDICTION", \
        f"{disease_class}: expected DISEASE_PREDICTION, got {result['response_type']}"
    assert result["disease_code"].startswith("RIC_"), \
        f"{disease_class}: expected RIC_ code, got {result['disease_code']}"


@pytest.mark.parametrize("disease_class", [
    "black_rot", "esca_black_measles", "healthy", "leaf_blight"
])
def test_all_grape_classes_correct(clf, disease_class):
    """All Grape disease classes predict as Grape when Grape is selected."""
    img_dir = DATASET / "grape" / disease_class
    imgs = list(img_dir.glob("*.jpg"))
    assert imgs, f"No images for {disease_class}"
    result = clf.predict(imgs[0].read_bytes(), target_crop="Grape")
    assert result["response_type"] == "DISEASE_PREDICTION", \
        f"{disease_class}: expected DISEASE_PREDICTION, got {result['response_type']}"
    assert result["disease_code"].startswith("GRP_"), \
        f"{disease_class}: expected GRP_ code, got {result['disease_code']}"



@pytest.mark.parametrize("disease_class", [
    "healthy"
])
def test_all_soybean_classes_correct(clf, disease_class):
    """All Soybean classes predict as Soybean when Soybean is selected."""
    img_dir = DATASET / "soybean" / disease_class
    imgs = list(img_dir.glob("*.jpg"))
    assert imgs, f"No images for {disease_class}"
    result = clf.predict(imgs[0].read_bytes(), target_crop="Soybean")
    assert result["response_type"] == "DISEASE_PREDICTION", \
        f"{disease_class}: expected DISEASE_PREDICTION, got {result['response_type']}"
    assert result["disease_code"] == "SOY_HLT", \
        f"{disease_class}: expected SOY_HLT, got {result['disease_code']}"

