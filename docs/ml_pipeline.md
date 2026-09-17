# KrishiRakshak AI — Machine Learning Pipeline Documentation

## 1. Tabular Agricultural & Outbreak Risk ML Engine

The tabular ML engine processes environmental, soil, spatial, and agronomic features from 3,628 synthetic records across 8 Maharashtra districts.

### Input Features
- `district`: Categorical (Solapur, Pune, Satara, Nashik, Kolhapur, Sangli, Ahmednagar, Nanded)
- `crop`: Categorical (Tomato, Soybean, Rice, Grapes, Potato, Cotton)
- `crop_stage`: Categorical (Seedling, Vegetative, Flowering, Fruiting, Maturity)
- `soil_type`: Categorical (Black Soil, Loamy, Clay Loam, Sandy Loam)
- `soil_ph`: Numerical (6.0 - 8.2)
- `soil_moisture_percent`: Numerical (15.0 - 75.0%)
- `temperature_c`: Numerical (18.0 - 38.0°C)
- `humidity_percent`: Numerical (35.0 - 98.0%)
- `rainfall_mm`: Numerical (0.0 - 45.0 mm)
- `wind_speed_kmph`: Numerical (2.0 - 22.0 km/h)
- `leaf_wetness_index`: Numerical (20.0 - 95.0)

### Target Variable & Models Compared
- Target: `risk_level` (Low, Medium, High)
- Algorithms:
  - Random Forest Classifier (100 estimators)
  - Gradient Boosting Classifier (100 estimators)
  - Logistic Regression (Scaled baseline)

### Evaluation Metrics
- **Random Forest**: Accuracy 76.45%, Macro F1 0.3890
- **Gradient Boosting**: Accuracy 76.31%, Macro F1 0.4056
- **Logistic Regression**: Accuracy 76.72%, Macro F1 0.4016

Saved model artifact: `ml/models/tabular_risk_model.joblib`.

---

## 2. Image Vision AI & Out-Of-Distribution (OOD) Pipeline

### Model Architecture
- MobileNetV3-Small edge vision classifier (<10 MB RAM footprint).
- Extracts 128-dimensional feature vector $f(x)$ from penultimate layer.

### Out-Of-Distribution (OOD) Detection
- Computes Mahalanobis Distance $D_M(x)$ against pre-computed class centroids.
- If $D_M(x) > \tau_{\text{OOD}}$ (Default: 4.50), the sample is flagged as Out-Of-Distribution and routed to human expert verification.

### Damage Severity Estimator
- Segment diseased lesion areas from healthy leaf area using HSV thresholding.
- Calculates affected leaf area percentage and assigns LOW (<12%), MEDIUM (12-35%), or HIGH (>35%) severity.
