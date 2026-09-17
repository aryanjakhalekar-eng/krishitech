"""
KrishiRakshak AI — Three-Stage Vision Inference Engine
=======================================================
Stage 1: CropClassifier   — detects Tomato / Rice / Unsupported FROM THE IMAGE
Stage 2: Mismatch Guard   — rejects if detected_crop != user-selected crop
Stage 3: DiseaseClassifier — disease-only model for confirmed crop

NEVER trusts req.crop as ground truth for crop identity.
The image itself determines the crop.
"""

import hashlib
from pathlib import Path
from typing import Dict, Any, Optional, Tuple

import cv2
import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms

# ── Paths ─────────────────────────────────────────────────────────────────────
_ML_ROOT = Path(__file__).resolve().parent.parent.parent.parent / "ml"
_CROP_CLASSIFIER_PATH = _ML_ROOT / "models" / "crop_classifier" / "model.pt"
_TOMATO_MODEL_PATH    = _ML_ROOT / "models" / "tomato" / "model.pt"
_RICE_MODEL_PATH      = _ML_ROOT / "models" / "rice"   / "model.pt"
_SOYBEAN_MODEL_PATH   = _ML_ROOT / "models" / "soybean" / "model.pt"
_GRAPE_MODEL_PATH     = _ML_ROOT / "models" / "grape"   / "model.pt"

# ── Constants ─────────────────────────────────────────────────────────────────
SUPPORTED_CROPS = ["Tomato", "Rice", "Soybean", "Grape"]
_EMBED_DIM = 128

DISEASE_CLASSES = [
    {"crop": "Tomato",  "disease": "Healthy Crop",          "code": "TOM_HLT", "category": "None"},
    {"crop": "Tomato",  "disease": "Early Blight",          "code": "TOM_EB",  "category": "Fungal"},
    {"crop": "Tomato",  "disease": "Late Blight",           "code": "TOM_LB",  "category": "Oomycete"},
    {"crop": "Tomato",  "disease": "Leaf Mold",             "code": "TOM_LM",  "category": "Fungal"},
    {"crop": "Tomato",  "disease": "Bacterial Spot",        "code": "TOM_BS",  "category": "Bacterial"},
    {"crop": "Rice",    "disease": "Healthy Crop",          "code": "RIC_HLT", "category": "None"},
    {"crop": "Rice",    "disease": "Bacterial Leaf Blight", "code": "RIC_BLB", "category": "Bacterial"},
    {"crop": "Rice",    "disease": "Brown Spot",            "code": "RIC_BS",  "category": "Fungal"},
    {"crop": "Rice",    "disease": "Leaf Blast",            "code": "RIC_BL",  "category": "Fungal"},
    {"crop": "Rice",    "disease": "Tungro",                "code": "RIC_TG",  "category": "Viral"},
    {"crop": "Soybean", "disease": "Healthy Crop",          "code": "SOY_HLT", "category": "None"},
    {"crop": "Grape",   "disease": "Healthy Crop",          "code": "GRP_HLT", "category": "None"},
    {"crop": "Grape",   "disease": "Black Rot",             "code": "GRP_BR",  "category": "Fungal"},
    {"crop": "Grape",   "disease": "Esca (Black Measles)",  "code": "GRP_ESC", "category": "Fungal"},
    {"crop": "Grape",   "disease": "Leaf Blight",           "code": "GRP_LB",  "category": "Fungal"},
]

# ── Transforms ────────────────────────────────────────────────────────────────
_TRANSFORM = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


# ── Model builder (shared architecture) ──────────────────────────────────────
def _build_model(num_classes: int) -> nn.Module:
    backbone = models.mobilenet_v3_small(weights=None)
    in_feats = backbone.classifier[0].in_features
    backbone.classifier = nn.Sequential(
        nn.Linear(in_feats, _EMBED_DIM),
        nn.Hardswish(),
        nn.Dropout(p=0.2),
        nn.Linear(_EMBED_DIM, num_classes),
    )
    return backbone


class _EmbedWrapper(nn.Module):
    """Returns the 128-dim penultimate embedding."""
    def __init__(self, model: nn.Module):
        super().__init__()
        layers = list(model.classifier.children())
        self.features   = model.features
        self.pool       = model.avgpool
        self.embed_head = nn.Sequential(*layers[:-1])

    def forward(self, x):
        x = self.features(x); x = self.pool(x); x = x.flatten(1)
        return self.embed_head(x)


# ── Generic checkpoint loader ──────────────────────────────────────────────────
class _LoadedModel:
    def __init__(self, label: str, path: Path):
        self.label = label
        self.is_loaded = False
        self.class_names: list = []
        self.centroids: dict = {}
        self.ood_threshold: float = 4.50
        self._model: Optional[nn.Module] = None
        self._embed: Optional[nn.Module] = None

        if not path.exists():
            print(f"[image_ai] WARNING: {label} model not found at {path}")
            return
        try:
            ckpt = torch.load(str(path), map_location="cpu", weights_only=False)
            self.class_names   = ckpt["class_names"]
            self.ood_threshold = float(ckpt.get("ood_threshold", 4.50))
            self._model = _build_model(len(self.class_names))
            state = ckpt.get("model_state_dict") or ckpt.get("model_state")
            self._model.load_state_dict(state)
            self._model.eval()
            self._embed = _EmbedWrapper(self._model)
            self._embed.eval()
            raw = ckpt.get("centroids", {})
            for k, v in raw.items():
                if isinstance(k, int) or (isinstance(k, str) and k.isdigit()):
                    self.centroids[int(k)] = np.array(v, dtype=np.float32)
                elif isinstance(k, str) and k in self.class_names:
                    self.centroids[self.class_names.index(k)] = np.array(v, dtype=np.float32)
                else:
                    self.centroids[len(self.centroids)] = np.array(v, dtype=np.float32)
            self.is_loaded = True
            print(f"[image_ai] Loaded {label}: {len(self.class_names)} classes  OOD={self.ood_threshold}")
        except Exception as e:
            print(f"[image_ai] ERROR loading {label}: {e}")

    def infer(self, tensor: torch.Tensor) -> Tuple[int, float, np.ndarray]:
        """Returns (class_idx, confidence, embedding)."""
        with torch.no_grad():
            logits = self._model(tensor)
            probs  = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()
            emb    = self._embed(tensor).squeeze(0).cpu().numpy()
        idx  = int(np.argmax(probs))
        conf = float(probs[idx])
        return idx, conf, emb


# ── Class-folder → display name mapping ──────────────────────────────────────
_CLASS_FOLDER_MAP = {
    ("tomato", "healthy"):               ("Healthy Crop",          "TOM_HLT"),
    ("tomato", "early_blight"):          ("Early Blight",          "TOM_EB"),
    ("tomato", "late_blight"):           ("Late Blight",           "TOM_LB"),
    ("tomato", "leaf_mold"):             ("Leaf Mold",             "TOM_LM"),
    ("tomato", "bacterial_spot"):        ("Bacterial Spot",        "TOM_BS"),
    ("rice",   "healthy"):               ("Healthy Crop",          "RIC_HLT"),
    ("rice",   "bacterial_leaf_blight"): ("Bacterial Leaf Blight", "RIC_BLB"),
    ("rice",   "brown_spot"):            ("Brown Spot",            "RIC_BS"),
    ("rice",   "leaf_blast"):            ("Leaf Blast",            "RIC_BL"),
    ("rice",   "blast"):                 ("Leaf Blast",            "RIC_BL"),
    ("rice",   "tungro"):                ("Tungro",                "RIC_TG"),
    ("soybean", "healthy"):              ("Healthy Crop",          "SOY_HLT"),
    ("grape",   "healthy"):              ("Healthy Crop",          "GRP_HLT"),
    ("grape",   "black_rot"):            ("Black Rot",             "GRP_BR"),
    ("grape",   "esca_black_measles"):   ("Esca (Black Measles)",  "GRP_ESC"),
    ("grape",   "leaf_blight"):          ("Leaf Blight",           "GRP_LB"),
}


def _folder_to_disease(folder: str, crop: str):
    k = (crop.lower(), folder.lower())
    if k in _CLASS_FOLDER_MAP:
        return _CLASS_FOLDER_MAP[k]
    return folder.replace("_", " ").title(), f"{crop[:3].upper()}_{folder[:2].upper()}"


def _disease_category(name: str) -> str:
    if "Healthy"   in name: return "None"
    if "Bacterial" in name: return "Bacterial"
    if "Late Blight" in name: return "Oomycete"
    if "Tungro" in name: return "Viral"
    return "Fungal"


def _ood_fv(seed: int) -> list:
    rng = np.random.RandomState(seed + 99999)
    fv  = rng.randn(_EMBED_DIM).astype(np.float32)
    fv /= (np.linalg.norm(fv) + 1e-8)
    return fv.tolist()


# ── Main classifier ────────────────────────────────────────────────────────────
class MobileNetV3SmallClassifier:
    """
    Three-stage inference:
      1. Crop domain detection from IMAGE (never from req.crop)
      2. Mismatch guard — if detected != selected → CROP_MISMATCH
      3. Disease classification using the correct domain model only
    """
    model_name = "MobileNetV3-Small-ThreeStage"
    feature_dim = _EMBED_DIM

    def __init__(self):
        self._crop_clf = _LoadedModel("CropClassifier",  _CROP_CLASSIFIER_PATH)
        self._tomato   = _LoadedModel("Tomato-Disease",  _TOMATO_MODEL_PATH)
        self._rice     = _LoadedModel("Rice-Disease",    _RICE_MODEL_PATH)
        self._soybean  = _LoadedModel("Soybean-Disease", _SOYBEAN_MODEL_PATH)
        self._grape    = _LoadedModel("Grape-Disease",   _GRAPE_MODEL_PATH)

    @property
    def is_trained(self) -> bool:
        return (self._crop_clf.is_loaded and
                self._tomato.is_loaded and
                self._rice.is_loaded and
                self._soybean.is_loaded and
                self._grape.is_loaded)

    # ── Stage 1: detect crop from image ──────────────────────────────────────
    def _detect_crop(self, rgb: np.ndarray) -> Tuple[str, float]:
        """Returns (detected_crop_name, confidence)."""
        if not self._crop_clf.is_loaded:
            return "Unknown", 0.0
        tensor = _TRANSFORM(rgb).unsqueeze(0)
        idx, conf, _ = self._crop_clf.infer(tensor)
        detected = self._crop_clf.class_names[idx]  # "Tomato" / "Rice" / "Soybean" / "Grape" / "Unsupported"
        return detected, conf

    # ── Stage 2: disease classification ──────────────────────────────────────
    def _classify_disease(self, rgb: np.ndarray, crop: str, seed: int):
        c = crop.lower()
        if c == "tomato":
            model = self._tomato
        elif c == "rice":
            model = self._rice
        elif c == "soybean":
            model = self._soybean
        elif c == "grape":
            model = self._grape
        else:
            return None

        if not model.is_loaded:
            return None
        tensor = _TRANSFORM(rgb).unsqueeze(0)
        idx, conf, emb = model.infer(tensor)
        class_folder  = model.class_names[idx]
        disease_name, disease_code = _folder_to_disease(class_folder, crop)
        norm_emb = emb / (np.linalg.norm(emb) + 1e-8)
        return {
            "class_folder": class_folder,
            "disease_name": disease_name,
            "disease_code": disease_code,
            "category":     _disease_category(disease_name),
            "confidence":   round(conf, 4),
            "feature_vector": norm_emb.tolist(),
        }

    # ── Public predict() ─────────────────────────────────────────────────────
    def predict(self, image_bytes: bytes, target_crop: str = "Tomato",
                force_low_confidence: bool = False) -> Dict[str, Any]:

        np_arr = np.frombuffer(image_bytes, np.uint8)
        img    = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        seed   = int(hashlib.md5(image_bytes).hexdigest()[:8], 16)
        selected = (target_crop or "Tomato").capitalize()

        if img is None:
            return {
                "response_type": "INVALID_IMAGE",
                "model_architecture": self.model_name,
                "is_demo_mode": not self.is_trained,
                "inference_mode": "Three-Stage MobileNetV3 (Invalid Image)",
                "crop": selected,
                "disease_name": "Unreadable Image",
                "disease_code": "IMG_ERR",
                "category": "Error",
                "confidence": 0.0,
                "feature_vector": _ood_fv(seed),
                "domain_verification": {"is_supported_domain": False,
                                        "reason": "Could not decode image."},
            }

        # Check if requested crop is supported
        if selected not in SUPPORTED_CROPS:
            domain_info = {
                "is_plant": True,
                "is_supported_domain": False,
                "domain_status": "UNSUPPORTED_CROP",
                "detected_crop": selected,
                "reason": f"Unsupported Crop Domain: Crop '{selected}' not supported. Supported crops: {', '.join(SUPPORTED_CROPS)}."
            }
            return {
                "response_type": "UNSUPPORTED_CROP",
                "model_architecture": self.model_name,
                "is_demo_mode": not self.is_trained,
                "inference_mode": f"Three-Stage MobileNetV3 (Unsupported Crop: {selected})",
                "crop": selected,
                "selected_crop": selected,
                "detected_crop": selected,
                "disease_name": "Unsupported Crop Domain",
                "disease_code": "OOD_CROP",
                "category": "Out-Of-Domain",
                "confidence": 0.0,
                "feature_vector": _ood_fv(seed),
                "domain_verification": domain_info,
            }

        # ── Plant Domain Check (HSV foliage verification & unnatural color rejection) ──
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        unnatural_mask = cv2.inRange(hsv, np.array([130, 80, 80]), np.array([175, 255, 255]))
        unnatural_ratio = float(np.count_nonzero(unnatural_mask)) / float(img.shape[0] * img.shape[1])
        plant_mask = cv2.inRange(hsv, np.array([5, 8, 20]), np.array([100, 255, 255]))
        plant_ratio = float(np.count_nonzero(plant_mask)) / float(img.shape[0] * img.shape[1])

        if unnatural_ratio > 0.30 or plant_ratio < 0.08:
            domain_info = {
                "is_plant": False,
                "is_supported_domain": False,
                "domain_status": "NON_PLANT_OOD",
                "detected_crop": "Non-Agricultural Object",
                "plant_pixel_ratio": round(plant_ratio, 4),
                "reason": f"Insufficient or non-plant foliage detected ({plant_ratio*100:.1f}% plant pixels). Non-agricultural object rejected.",
            }
            return {
                "response_type": "OOD_DOMAIN",
                "model_architecture": self.model_name,
                "is_demo_mode": not self.is_trained,
                "inference_mode": "Three-Stage MobileNetV3 (OOD — Rejected)",
                "crop": selected,
                "selected_crop": selected,
                "detected_crop": "Unsupported",
                "disease_name": "Unsupported Domain",
                "disease_code": "OOD_DOMAIN",
                "category": "Out-Of-Domain",
                "confidence": 0.0,
                "feature_vector": _ood_fv(seed),
                "domain_verification": domain_info,
            }

        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # ── Stage 1: Crop detection from image ───────────────────────────────
        detected_crop, crop_conf = self._detect_crop(rgb)

        domain_info = {
            "is_plant": detected_crop != "Unsupported",
            "is_supported_domain": detected_crop in SUPPORTED_CROPS,
            "detected_crop": detected_crop,
            "crop_classifier_confidence": round(crop_conf, 4),
            "domain_status": (
                f"PLANT_CONFIRMED_{detected_crop.upper()}_DETECTED"
                if detected_crop in SUPPORTED_CROPS
                else ("NON_PLANT_OOD" if detected_crop == "Unsupported" else "UNKNOWN")
            ),
        }

        # Unsupported / OOD image from crop classifier
        if detected_crop == "Unsupported" or detected_crop not in SUPPORTED_CROPS:
            domain_info["reason"] = "Input image is not recognized as a supported agricultural crop leaf."
            return {
                "response_type": "OOD_DOMAIN",
                "model_architecture": self.model_name,
                "is_demo_mode": not self.is_trained,
                "inference_mode": "Three-Stage MobileNetV3 (OOD — Rejected)",
                "crop": selected,
                "selected_crop": selected,
                "detected_crop": "Unsupported",
                "disease_name": "Unsupported Domain",
                "disease_code": "OOD_DOMAIN",
                "category": "Out-Of-Domain",
                "confidence": 0.0,
                "feature_vector": _ood_fv(seed),
                "domain_verification": domain_info,
            }

        # ── Stage 2: Disease classification using DETECTED CROP model ────────
        disease = self._classify_disease(rgb, detected_crop, seed)
        if disease is None:
            return {
                "response_type": "MODEL_ERROR",
                "model_architecture": self.model_name,
                "is_demo_mode": True,
                "inference_mode": f"Three-Stage MobileNetV3 ({detected_crop} disease model not loaded)",
                "crop": detected_crop,
                "disease_name": "Model Unavailable",
                "disease_code": "MODEL_ERR",
                "category": "Error",
                "confidence": 0.0,
                "feature_vector": _ood_fv(seed),
                "domain_verification": domain_info,
            }

        final_conf = 0.58 if force_low_confidence else disease["confidence"]

        # ── Stage 3: Check for user crop selection mismatch ──────────────────
        if detected_crop.lower() != selected.lower():
            msg = (
                f"This image appears to be a {detected_crop} leaf, "
                f"but {selected} was selected. "
                f"KrishiRakshak AI automatically diagnosed {detected_crop} {disease['disease_name']}."
            )
            return {
                "response_type": "CROP_MISMATCH",
                "model_architecture": self.model_name,
                "is_demo_mode": not self.is_trained,
                "inference_mode": f"Three-Stage MobileNetV3 (Crop Mismatch Auto-Corrected: {detected_crop} detected, {selected} selected)",
                "crop": detected_crop,        # the REAL crop from image
                "selected_crop": selected,    # what the user picked
                "detected_crop": detected_crop,
                "crop_mismatch": True,
                "disease_name": disease["disease_name"],
                "disease_code": disease["disease_code"],
                "category":     disease["category"],
                "confidence":   final_conf,
                "feature_vector": disease["feature_vector"],
                "domain_verification": domain_info,
                "mismatch_message": msg,
                "crop_classifier_confidence": round(crop_conf, 4),
            }

        return {
            "response_type": "DISEASE_PREDICTION",
            "model_architecture": self.model_name,
            "is_demo_mode": False,
            "inference_mode": f"Three-Stage MobileNetV3 — {detected_crop} Disease Model (Trained)",
            "crop": detected_crop,
            "selected_crop": selected,
            "detected_crop": detected_crop,
            "crop_mismatch": False,
            "disease_name": disease["disease_name"],
            "disease_code": disease["disease_code"],
            "category":     disease["category"],
            "confidence":   final_conf,
            "feature_vector": disease["feature_vector"],
            "domain_verification": domain_info,
            "crop_classifier_confidence": round(crop_conf, 4),
        }
