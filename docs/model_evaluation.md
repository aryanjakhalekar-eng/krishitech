# KrishiRakshak AI — Vision Model Evaluation Report

This document records the empirical evaluation of the two crop-specific MobileNetV3-Small vision models trained on the actual dataset at `D:\crop images dataset`.

---

## 1. Overview & Architecture

- **Backbone**: MobileNetV3-Small (`mobilenet_v3_small`, ImageNet-1K pretrained)
- **Feature Extraction**: 128-dimensional penultimate embedding head with Hardswish activation and Dropout ($p=0.2$)
- **Classification Head**: Crop-specific linear output head
  - **Tomato Model (4 classes)**: early_blight, healthy, late_blight, leaf_mold
  - **Rice Model (5 classes)**: bacterial_leaf_blight, brown_spot, healthy, leaf_blast, tungro
- **Loss Function**: Cross-Entropy Loss with Label Smoothing ($0.05$)
- **Optimizer**: AdamW ($	ext{LR}=8	imes 10^{-4}$, Weight Decay=$1	imes 10^{-4}$) with Cosine Annealing Scheduler
- **Input Size**: $224 \times 224 \times 3$ RGB normalized with ImageNet statistics ($\mu=[0.485, 0.456, 0.406]$, $\sigma=[0.229, 0.224, 0.225]$)
- **OOD Detection**: Calibrated Mahalanobis distance ($D_M(x) \le 4.50$) computed against 128-dimensional class centroid vectors

---

## Tomato Model Performance

- **Test Accuracy**: **87.50%**
- **Macro F1-Score**: **0.8667**
- **Macro Precision**: **0.9167**
- **Macro Recall**: **0.8750**
- **Weighted F1-Score**: **0.8667**
- **Best Validation Accuracy**: **100.00%**

### Per-Class Performance Metrics

| Class Name | Precision | Recall | F1-Score | Test Support |
| :--- | :---: | :---: | :---: | :---: |
| `early_blight` | 1.0000 | 1.0000 | 1.0000 | 4 |
| `healthy` | 0.6667 | 1.0000 | 0.8000 | 4 |
| `late_blight` | 1.0000 | 1.0000 | 1.0000 | 4 |
| `leaf_mold` | 1.0000 | 0.5000 | 0.6667 | 4 |

### Confusion Matrix

```
Labels: ['early_blight', 'healthy', 'late_blight', 'leaf_mold']
[[4 0 0 0]
 [0 4 0 0]
 [0 0 4 0]
 [0 2 0 2]]
```

---

## Rice Model Performance

- **Test Accuracy**: **100.00%**
- **Macro F1-Score**: **1.0000**
- **Macro Precision**: **1.0000**
- **Macro Recall**: **1.0000**
- **Weighted F1-Score**: **1.0000**
- **Best Validation Accuracy**: **100.00%**

### Per-Class Performance Metrics

| Class Name | Precision | Recall | F1-Score | Test Support |
| :--- | :---: | :---: | :---: | :---: |
| `bacterial_leaf_blight` | 1.0000 | 1.0000 | 1.0000 | 4 |
| `brown_spot` | 1.0000 | 1.0000 | 1.0000 | 4 |
| `healthy` | 1.0000 | 1.0000 | 1.0000 | 4 |
| `leaf_blast` | 1.0000 | 1.0000 | 1.0000 | 4 |
| `tungro` | 1.0000 | 1.0000 | 1.0000 | 4 |

### Confusion Matrix

```
Labels: ['bacterial_leaf_blight', 'brown_spot', 'healthy', 'leaf_blast', 'tungro']
[[4 0 0 0 0]
 [0 4 0 0 0]
 [0 0 4 0 0]
 [0 0 0 4 0]
 [0 0 0 0 4]]
```

---

