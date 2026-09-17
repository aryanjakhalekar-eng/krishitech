# KrishiRakshak AI 🌾🤖

> **"AI-powered crop disease detection, safe advisory and outbreak intelligence for farmers."**

[![Two-Crop AI](https://img.shields.io/badge/AI-Tomato_%26_Rice_Vision_Models-green.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Framework](https://img.shields.io/badge/Backend-FastAPI_0.141-emerald.svg)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-React_18_%7C_Tailwind_3.4-blue.svg)](https://reactjs.org)

**KrishiRakshak AI** is an offline-first mobile app and web platform for crop disease identification, severity estimation, safe triage, human expert verification (Gram Sevak), and district-level outbreak intelligence in Maharashtra.

---

## 🌟 Key Features

1. **Edge Vision & On-Device IQA (Image Quality Assessment)**
   - Uses OpenCV Laplacian Variance blur detection to filter out unusable, blurry, or extreme lighting photos on-device before uploading zero data.

2. **Mathematical AI Safety Gate (Core Pillar)**
   - Combines Image Quality Assessment $\text{IQA}(x)$, Softmax Confidence $C(x)$, and Out-Of-Distribution (OOD) Mahalanobis Distance $D_M(x)$ to prevent unsafe generative dosing.
   $$\text{System Action} = \begin{cases} \text{On-Device Retry Prompt}, & \text{if } \text{IQA}(x) < \tau_{\text{IQA}} \\ \text{Automated On-Device Advice}, & \text{if } \text{IQA}(x) \ge \tau_{\text{IQA}} \land C(x) \ge \tau_c \land D_M(x) \le \tau_{\text{OOD}} \\ \text{Escalate to Extension Officer}, & \text{if } \text{IQA}(x) \ge \tau_{\text{IQA}} \land (C(x) < \tau_c \lor D_M(x) > \tau_{\text{OOD}}) \end{cases}$$

3. **Two-Tiered Triage Pipeline & Human-in-the-Loop**
   - High-confidence scans deliver instant local IPM guidance.
   - Low-confidence or rare/OOD cases automatically route to local Extension Officer (Gram Sevak) web queues for expert verification.

4. **Safe Stepped IPM Advisory System**
   - Strictly queries pre-validated databases ($\text{Cultural} \rightarrow \text{Biological} \rightarrow \text{Approved Chemical}$) with zero generative chemical dosing and mandatory safety warnings.

5. **Maharashtra District GIS Outbreak Intelligence Map**
   - Interactive Leaflet map displaying active disease hotspots, case clusters, and micro-climate risk forecasts across Maharashtra districts (Solapur, Pune, Satara, Nashik, Kolhapur, Sangli, Ahmednagar, Nanded).

6. **Offline-First PWA Architecture**
   - PWA Service Worker + IndexedDB queue for offline scan storage when internet connectivity is poor, with auto-sync when connection returns.

---

## 🔑 Quick Demo Credentials

| Role | Email | Password | Access Link |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@krishirakshak.in` | `farmer123` | [Farmer Dashboard](http://127.0.0.1:8001/) |
| **Extension Officer** | `officer@krishirakshak.in` | `officer123` | [Officer Queue](http://127.0.0.1:8001/) |
| **Admin** | `admin@krishirakshak.in` | `admin123` | [GIS Map & Analytics](http://127.0.0.1:8001/) |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript 5, Tailwind CSS, Recharts, Leaflet / OpenStreetMap, Lucide Icons, PWA (Service Worker + IndexedDB)
- **Backend**: Python 3.14, FastAPI, Pydantic, SQLAlchemy, SQLite (PostgreSQL ready), PyJWT
- **AI/ML**: Scikit-Learn (Random Forest, Gradient Boosting), PyTorch MobileNetV3-Small architecture, OpenCV Laplacian Variance IQA, Mahalanobis Distance OOD, PlantSeg-inspired Damage Severity Estimator

---

## 🚀 Quick Start Instructions

### 1. Database Initialization
```bash
python scripts/seed_db.py
```

### 2. Start FastAPI Backend (Port 8001)
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload
```

### 3. Start Frontend Development Server
```bash
cd frontend
npm run dev
# Or build production assets:
npm run build
```

Open your browser at **http://127.0.0.1:8001** (or frontend dev server at **http://localhost:3000**) to access the complete application!

---

## 🌿 Supported Crops & Two-Crop Disease Catalog

The computer vision diagnosis engine supports **ONLY TWO CROPS** with genuine deep learning leaf-image classification:

| Crop | Disease / Health Class | Pathogen / Type | Category |
| :--- | :--- | :--- | :--- |
| **Tomato** | Healthy Crop | None | Healthy Leaf |
| **Tomato** | Early Blight | *Alternaria solani* | Fungal |
| **Tomato** | Late Blight | *Phytophthora infestans* | Oomycete |
| **Tomato** | Bacterial Spot | *Xanthomonas campestris* | Bacterial |
| **Rice** | Healthy Crop | None | Healthy Leaf |
| **Rice** | Blast | *Magnaporthe oryzae* | Fungal |
| **Rice** | Brown Spot | *Bipolaris oryzae* | Fungal |

*Any unsupported crop (e.g. wheat, soybean, potato) or cross-crop mismatch (e.g. rice leaf submitted under tomato) is strictly intercepted by the AI Safety Gate, triggering `HUMAN_ESCALATION` and withholding automated chemical advisories.*

---

## 🔬 Deep Vision Model Architecture & Held-Out Test Metrics

The system uses **TWO separate crop-specific MobileNetV3-Small vision models** (`tomato_model` and `rice_model`) to guarantee zero cross-crop classification leakage:

- **Backbone Architecture**: MobileNetV3-Small (pretrained on ImageNet, fine-tuned independently on Tomato and Rice leaf photographs)
- **Feature Extractor Head**: 576 $\rightarrow$ 128-dim penultimate embedding head (`Linear` + `Hardswish` + `Dropout(0.2)`)
- **Tomato Model Head**: 128 $\rightarrow$ 4 logits (`healthy`, `bacterial_spot`, `early_blight`, `late_blight`)
- **Rice Model Head**: 128 $\rightarrow$ 3 logits (`healthy`, `blast`, `brown_spot`)
- **OOD Detection**: Calibrated 128-dimensional Mahalanobis Distance $D_M(x) \le 4.50$ computed against per-crop class centroids

### Measured Evaluation on Held-Out Test Sets (162 Real Test Images)

#### Tomato Model (Held-Out Test Set: 93 Images)
- **Test Accuracy**: **98.92%** ($92/93$)
- **Macro F1-Score**: **0.9891**
- **Macro Precision**: **0.9896** | **Macro Recall**: **0.9891**

| Class | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| `bacterial_spot` | **1.0000** | 0.9565 | **0.9778** | 23 |
| `early_blight` | **1.0000** | **1.0000** | **1.0000** | 23 |
| `healthy` | **1.0000** | **1.0000** | **1.0000** | 24 |
| `late_blight` | 0.9583 | **1.0000** | **0.9787** | 23 |

#### Rice Model (Held-Out Test Set: 69 Images)
- **Test Accuracy**: **73.91%** ($51/69$)
- **Macro F1-Score**: **0.7427**
- **Macro Precision**: **0.8204** | **Macro Recall**: **0.7391**

| Class | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| `blast` | 0.8824 | 0.6522 | **0.7500** | 23 |
| `brown_spot` | **1.0000** | 0.6087 | **0.7568** | 23 |
| `healthy` | 0.5789 | **0.9565** | **0.7213** | 23 |

---

## 🔒 Strict Role-Based Access Control (RBAC)

1. **Farmer Role**:
   - Authorized routes: `/dashboard`, `/farms`, `/add-farm`, `/scan`, `/scan-result`, `/scan-history`, `/cases` (own escalated cases).
   - Data Isolation: Can only view, edit, or access their own farms, scan results, and notification feeds.
   - Forbidden: Attempting to access Officer Queue (`/api/officer/queue`) or Admin Analytics (`/api/analytics/*`, `/api/outbreaks/hotspots`) returns **HTTP 403 Forbidden**.

2. **Gram Sevak / Extension Officer Role**:
   - Authorized routes: `/dashboard` (Officer Dashboard), `/officer/queue`, `/officer/review/:caseId`.
   - Actions: Reviews escalated AI cases, adjusts diagnoses, writes field notes, and marks cases as `VERIFIED`.
   - Forbidden: Cannot access Admin Management / Analytics (`HTTP 403 Forbidden`).

3. **Admin Role**:
   - Authorized routes: `/dashboard` (Admin Dashboard), `/analytics`, `/gis-map`.
   - Actions: Statewide monitoring, district outbreak analytics, and AI model performance oversight.

---

## 📊 Tabular ML Model Performance

The synthetic agricultural dataset (3,600+ records) was processed and evaluated across 3 classifier models:

| Model | Accuracy | Precision | Recall | Macro F1-Score |
| :--- | :---: | :---: | :---: | :---: |
| **Random Forest Classifier** | **76.45%** | **0.4210** | **0.3850** | **0.3890** |
| **Gradient Boosting** | 76.31% | 0.4415 | 0.3920 | 0.4056 |
| **Logistic Regression** | 76.72% | 0.4350 | 0.3950 | 0.4016 |

---

## 📁 Repository Structure

```
krishirakshak-ai/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (auth, farms, scans, cases, officer, analytics, outbreaks, weather)
│   │   ├── auth/            # JWT security & role checks (require_farmer, require_officer, require_admin)
│   │   ├── database/        # Session & SQLite database connection
│   │   ├── ml/              # MobileNetV3-Small classifier & AI Safety Gate
│   │   ├── models/          # SQLAlchemy domain models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Non-generative IPM advisory & weather services
│   │   └── utils/           # Laplacian IQA, Mahalanobis OOD, severity estimator
│   └── main.py              # Application entrypoint & SPA static file serving
├── frontend/
│   ├── src/
│   │   ├── components/      # React components (Navbar, GISMap, etc.)
│   │   ├── contexts/        # Auth, Language (EN/MR/HI), Offline contexts
│   │   ├── pages/           # Farmer, Officer, Admin & Unauthorized (403) pages
│   │   └── types/           # TypeScript data interfaces
│   └── dist/                # Production build bundle
├── data/
│   └── dataset/             # 70/15/15 train/val/test real leaf image dataset
├── ml/
│   └── models/              # Trained MobileNetV3 PyTorch checkpoint (.pth) & tabular models
└── tests/
    └── test_backend_api.py  # 35/35 automated unit, AI safety & RBAC test suite
```


---

## 🎬 Quick Demonstration Flow (30-Second Walkthrough)

1. **Landing Page**: View problem statement, solution summary, and click **Quick Demo Login** -> select **Farmer**.
2. **Farmer Dashboard**: View registered farms (Baramati, Pune), local weather risk, and tap **SCAN CROP NOW**.
3. **Crop Leaf Scan**:
   - Tap **🌿 Clear Leaf (Pass Demo)** -> Click **Run AI Analysis** -> View **AI Safety Check: PASSED** & Stepped IPM Advisory.
   - Tap **🌫️ Blurry Leaf (Retry Demo)** -> View **Image Quality: POOR** on-device retry warning.
   - Tap **❓ OOD Sample (Escalation Demo)** -> View **AI Safety Check: HUMAN VERIFICATION REQUIRED** and automatic Officer Case creation.
4. **Officer Review**: Click Quick Demo Login -> **Extension Officer** -> Inspect escalated case -> Verify diagnosis & submit notes.
5. **GIS Outbreak Map**: Click Quick Demo Login -> **Admin & GIS Officer** -> Inspect interactive Leaflet Maharashtra outbreak map with district filters and analytics charts.
