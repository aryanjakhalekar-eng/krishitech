# KrishiRakshak AI — Model Evaluation Report

**Model Architecture**: MobileNetV3-Small with 128-dim Feature Embedding Head  
**Trained on**: Genuine Agricultural Leaf Disease Benchmark Datasets  
**Supported Crops**: Tomato (4 classes) and Rice (3 classes)  
**Evaluation Date**: 2026-08-27 11:05:06  

---

## 1. Overall Test Set Performance (Unseen Real Leaf Photos)

| Metric | Measured Value |
| :--- | :--- |
| **Overall Accuracy** | **83.85%** |
| **Macro Precision** | **85.37%** |
| **Macro Recall** | **83.85%** |
| **Macro F1-Score** | **83.43%** |
| **Weighted F1-Score** | **83.43%** |
| **Tomato Accuracy** | **100.00%** (Macro F1: 100.00%) |
| **Rice Accuracy** | **62.32%** (Macro F1: 61.33%) |

---

## 2. Per-Class Performance Breakdown

| Class Name | Crop | Precision | Recall | F1-Score | Test Support |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Blast** | Rice | 50.0% | 78.3% | 61.0% | 23.0 |
| **Brown Spot** | Rice | 66.7% | 34.8% | 45.7% | 23.0 |
| **Healthy Crop** | Rice | 81.0% | 73.9% | 77.3% | 23.0 |
| **Bacterial Spot** | Tomato | 100.0% | 100.0% | 100.0% | 23.0 |
| **Early Blight** | Tomato | 100.0% | 100.0% | 100.0% | 23.0 |
| **Healthy Crop** | Tomato | 100.0% | 100.0% | 100.0% | 23.0 |
| **Late Blight** | Tomato | 100.0% | 100.0% | 100.0% | 23.0 |

---

## 3. Confusion Matrix

```text
[[18  4  1  0  0  0  0]
 [12  8  3  0  0  0  0]
 [ 6  0 17  0  0  0  0]
 [ 0  0  0 23  0  0  0]
 [ 0  0  0  0 23  0  0]
 [ 0  0  0  0  0 23  0]
 [ 0  0  0  0  0  0 23]]
```

---

## 4. Multi-Stage Safety & Domain Verification
- Feature embeddings (128-dim) extracted from penultimate projection layer.
- Centroids pre-computed across training distribution.
- Calibrated Mahalanobis OOD distance metric enforces $D_M \le 4.50$.
- Incompatible crop inputs (e.g. Rice uploaded under Tomato selection) trigger `UNSUPPORTED_CROP_MISMATCH` with chemical advisory withheld.
