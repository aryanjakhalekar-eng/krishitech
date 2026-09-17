# KrishiRakshak AI — System Architecture & Operational Pillars

## Operational Overview

KrishiRakshak AI is engineered as an offline-first mobile app and web platform for crop disease identification, severity estimation, and outbreak tracking in Maharashtra.

### Operational Flowchart

```
1. Farmer Captures Photo (Low-cost Android device)
       │
       ▼
2. On-Device IQA Check: IQA(x) >= tau_IQA ?
       ├── Blurry/Dark → Prompt On-Device Retry (Zero Data Uploaded)
       └── Clear → Continue
       │
       ▼
3. On-Device Model Inference
   Calculate Softmax Confidence C(x) & OOD Distance D_M(x)
       │
       ▼
4. AI Safety Gate Pass?
   C(x) >= tau_c  AND  D_M(x) <= tau_OOD
       ├── [PASS] → Automated Path: Local-Language IPM Advisory (EN/MR/HI)
       └── [FAIL] → Human Escalation: Extension Officer Queue (Gram Sevak)
       │
       ▼
5. District GIS Map & Retraining Loop
```

## Mathematical Safety Gate Criteria

Automated actions are strictly governed by combining Image Quality Assessment ($\text{IQA}(x)$), Softmax Confidence ($C(x)$), and Mahalanobis Distance ($D_M(x)$):

$$\text{System Action} = \begin{cases} \text{On-Device Retry Prompt}, & \text{if } \text{IQA}(x) < \tau_{\text{IQA}} \\ \text{Automated On-Device Advice}, & \text{if } \text{IQA}(x) \ge \tau_{\text{IQA}} \land C(x) \ge \tau_c \land D_M(x) \le \tau_{\text{OOD}} \\ \text{Escalate to Extension Officer}, & \text{if } \text{IQA}(x) \ge \tau_{\text{IQA}} \land (C(x) < \tau_c \lor D_M(x) > \tau_{\text{OOD}}) \end{cases}$$

## Core Pillars

1. **Hardware-Optimized Edge Vision & On-Device IQA**:
   - Uses MobileNetV3-Small (<10 MB RAM target) for lightweight image classification while outputting 128-dim feature vector $f(x)$.
   - Employs OpenCV Laplacian Variance for auto-filtering blurry images.

2. **Two-Tiered Triage Pipeline**:
   - High-confidence in-distribution scans deliver instant local IPM guidance.
   - Low-confidence or rare/OOD images route asynchronously to Gram Sevaks' web queues.

3. **Safe IPM & GIS Intelligence**:
   - Queries pre-validated, stepped IPM databases ($\text{Cultural} \rightarrow \text{Biological} \rightarrow \text{Approved Chemical}$) with zero generative chemical dosing.
   - Syncs verified diagnoses with micro-climate weather ($T$, RH, Rain) for proactive outbreak tracking.
