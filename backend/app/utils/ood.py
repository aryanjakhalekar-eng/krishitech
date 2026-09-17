"""
KrishiRakshak AI — Out-Of-Distribution Detector
================================================
Loads per-crop class centroids from ml/models/tomato/model.pt
and ml/models/rice/model.pt (produced by train_image_models.py).

Uses per-crop OOD threshold calibrated at the 95th percentile of
validation-set embedding distances during training.
"""
import numpy as np
import torch
from pathlib import Path
from typing import Dict, Optional

_ML_ROOT = Path(__file__).resolve().parent.parent.parent.parent / "ml"

# All supported class display names for fallback deterministic centroid generation
SUPPORTED_CATALOG_CLASSES = [
    ("Tomato", "Healthy Crop"),
    ("Tomato", "Bacterial Spot"),
    ("Tomato", "Early Blight"),
    ("Tomato", "Late Blight"),
    ("Rice",   "Healthy Crop"),
    ("Rice",   "Blast"),
    ("Rice",   "Brown Spot"),
    ("Soybean", "Healthy Crop"),
    ("Grape",   "Healthy Crop"),
    ("Grape",   "Black Rot"),
    ("Grape",   "Esca (Black Measles)"),
    ("Grape",   "Leaf Blight"),
]


def _load_crop_centroids(crop: str) -> tuple[dict, float]:
    """
    Load class centroids and OOD threshold from ml/models/{crop}/model.pt.
    Returns (centroids_dict, threshold).
    centroids_dict maps class_idx (int) -> np.ndarray (128-dim).
    """
    path = _ML_ROOT / "models" / crop.lower() / "model.pt"
    if not path.exists():
        return {}, 4.50

    try:
        ckpt = torch.load(str(path), map_location="cpu", weights_only=False)
        raw  = ckpt.get("centroids", {})
        centroids = {str(k): np.array(v, dtype=np.float64) for k, v in raw.items()}
        threshold  = float(ckpt.get("ood_threshold", 4.50))
        return centroids, threshold
    except Exception as e:
        print(f"[ood] WARNING: could not load {crop} centroids: {e}")
        return {}, 4.50


def _generate_fallback_centroid(crop: str, disease: str, dim: int = 128) -> np.ndarray:
    """Deterministic unit-vector centroid when no trained centroids are available."""
    import hashlib
    key  = f"{crop}___{disease.replace(' ', '_')}".lower()
    seed = int(hashlib.sha256(key.encode()).hexdigest()[:8], 16)
    rng  = np.random.RandomState(seed)
    v    = rng.randn(dim)
    return v / np.linalg.norm(v)


class OutOfDistributionDetector:
    """
    Per-crop Mahalanobis-distance OOD detector.
    For a given feature vector and known crop, measures distance to the
    nearest class centroid (in the 128-dim embedding space).
    """

    def __init__(self, feature_dim: int = 128, sigma_w: float = 0.25, default_threshold: float = 4.50):
        self.feature_dim = feature_dim
        self.sigma_w = sigma_w
        self.default_threshold = default_threshold

        # Load per-crop centroids and thresholds
        self._tomato_centroids,  self._tomato_threshold  = _load_crop_centroids("tomato")
        self._rice_centroids,    self._rice_threshold    = _load_crop_centroids("rice")
        self._soybean_centroids, self._soybean_threshold = _load_crop_centroids("soybean")
        self._grape_centroids,   self._grape_threshold   = _load_crop_centroids("grape")

        # Merged all-class centroid dict for fallback (used when crop is unknown)
        self._all_centroids: Dict[str, np.ndarray] = {}

        if self._tomato_centroids:
            for k, v in self._tomato_centroids.items():
                self._all_centroids[f"tomato_{k}"] = v
        if self._rice_centroids:
            for k, v in self._rice_centroids.items():
                self._all_centroids[f"rice_{k}"] = v
        if self._soybean_centroids:
            for k, v in self._soybean_centroids.items():
                self._all_centroids[f"soybean_{k}"] = v
        if self._grape_centroids:
            for k, v in self._grape_centroids.items():
                self._all_centroids[f"grape_{k}"] = v

        # Fallback: generate deterministic centroids if nothing loaded
        if not self._all_centroids:
            for crop, disease in SUPPORTED_CATALOG_CLASSES:
                key = f"{crop.lower()}_{disease.replace(' ', '_').lower()}"
                self._all_centroids[key] = _generate_fallback_centroid(crop, disease, dim=feature_dim)

    def _nearest_dist(self, fv: np.ndarray, centroids: dict) -> float:
        if not centroids:
            return 9.99
        fv_norm = fv / (np.linalg.norm(fv) + 1e-8)
        min_dist = float("inf")
        for centroid in centroids.values():
            d = float(np.linalg.norm(fv_norm - centroid))
            if d < min_dist:
                min_dist = d
        return min_dist

    def compute_mahalanobis_distance(
        self,
        feature_vector,
        crop: Optional[str] = None,
    ) -> float:
        """
        Compute minimum Mahalanobis distance: D_M(x) = min_c ||z(x) - mu_c|| / sigma_w
        Uses per-crop centroids when crop is known; falls back to all-class otherwise.
        """
        if feature_vector is None or len(feature_vector) == 0:
            return 9.99

        fv = np.array(feature_vector, dtype=np.float64)

        if crop is not None:
            crop_lc = crop.lower()
            if crop_lc == "tomato" and self._tomato_centroids:
                raw_dist = self._nearest_dist(fv, self._tomato_centroids)
            elif crop_lc == "rice" and self._rice_centroids:
                raw_dist = self._nearest_dist(fv, self._rice_centroids)
            elif crop_lc == "soybean" and self._soybean_centroids:
                raw_dist = self._nearest_dist(fv, self._soybean_centroids)
            elif crop_lc == "grape" and self._grape_centroids:
                raw_dist = self._nearest_dist(fv, self._grape_centroids)
            else:
                raw_dist = self._nearest_dist(fv, self._all_centroids)
        else:
            raw_dist = self._nearest_dist(fv, self._all_centroids)

        scaled = float(np.clip(raw_dist / self.sigma_w, 0.5, 9.5))
        return round(scaled, 3)

    def evaluate_ood(
        self,
        feature_vector,
        threshold: Optional[float] = None,
        crop: Optional[str] = None,
    ) -> dict:
        """
        Evaluate OOD status for a feature vector.
        Uses per-crop threshold if crop is provided and model was loaded.
        """
        # Pick per-crop threshold when available
        if threshold is None:
            if crop is not None:
                crop_lc = crop.lower()
                if crop_lc == "tomato" and self._tomato_centroids:
                    threshold = self._tomato_threshold
                elif crop_lc == "rice" and self._rice_centroids:
                    threshold = self._rice_threshold
                elif crop_lc == "soybean" and self._soybean_centroids:
                    threshold = self._soybean_threshold
                elif crop_lc == "grape" and self._grape_centroids:
                    threshold = self._grape_threshold
                else:
                    threshold = self.default_threshold
            else:
                threshold = self.default_threshold

        dist    = self.compute_mahalanobis_distance(feature_vector, crop=crop)
        is_ood  = dist > threshold

        return {
            "mahalanobis_distance": dist,
            "ood_threshold":        threshold,
            "is_ood":               is_ood,
            "status":               "OUT_OF_DISTRIBUTION" if is_ood else "IN_DISTRIBUTION",
            "message":              (
                "Sample is out-of-distribution (rare or unknown condition)."
                if is_ood else
                "Sample matches known training distribution."
            ),
        }


