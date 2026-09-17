# KrishiRakshak AI — Dataset Sources & Provenance Documentation

## 1. Dataset Overview

This dataset catalog documents the real-world agricultural leaf disease image datasets used to train, validate, and evaluate the **KrishiRakshak AI Two-Crop Vision Classifier (MobileNetV3-Small)**.

Strictly adhering to user requirements, **all synthetic image generators and hard-coded demo classifiers have been replaced by real leaf photography datasets.**

---

## 2. Dataset Provenance & Metadata

### A. Tomato Leaf Disease Dataset (PlantVillage Benchmark)
* **Dataset Name**: PlantVillage Tomato Disease Dataset
* **Source**: PlantVillage (Penn State University & EPFL) / Hugging Face ipartzix/Crop_Disease_Image_Dataset & spMohanty/PlantVillage-Dataset
* **Source URL**: [https://huggingface.co/datasets/ipartzix/Crop_Disease_Image_Dataset](https://huggingface.co/datasets/ipartzix/Crop_Disease_Image_Dataset)
* **Original Repository**: [https://github.com/spMohanty/PlantVillage-Dataset](https://github.com/spMohanty/PlantVillage-Dataset)
* **License**: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) / Open Access Research
* **Crop**: **Tomato** (*Solanum lycopersicum*)
* **Disease Classes**:
  1. Tomato___Bacterial_Spot (*Xanthomonas perforans*)
  2. Tomato___Early_Blight (*Alternaria solani*)
  3. Tomato___Late_Blight (*Phytophthora infestans*)
  4. Tomato___Healthy (Healthy uninfected foliage)

### B. Rice Leaf Disease Dataset (Rice Disease Benchmark)
* **Dataset Name**: Rice Leaf Disease Benchmark Dataset
* **Source**: UCI Machine Learning Repository / Mendeley Data / Hugging Face ipartzix/Crop_Disease_Image_Dataset
* **Source URL**: [https://huggingface.co/datasets/ipartzix/Crop_Disease_Image_Dataset](https://huggingface.co/datasets/ipartzix/Crop_Disease_Image_Dataset)
* **License**: Creative Commons Attribution 4.0 International (CC BY 4.0) / Open Research Data
* **Crop**: **Rice** (*Oryza sativa*)
* **Disease Classes**:
  1. Rice___Brown_Spot (*Bipolaris oryzae*)
  2. Rice___Leaf_Blast (*Magnaporthe oryzae*)
  3. Rice___Healthy (Healthy uninfected rice foliage)

### C. Out-Of-Domain (OOD) Evaluation Benchmarks
* **Crops**: Potato (*Solanum tuberosum*), Corn/Maize (*Zea mays*), Non-agricultural objects
* **Classes**: Potato___Early_Blight, Corn_(Maize)___Common_Rust
* **Purpose**: Verifying that non-target crops and out-of-domain images are safely rejected with (x) > 4.50$ and flagged for human escalation.

---

## 3. Dataset Splits & Statistics

All images undergo automated MD5 hash verification to prevent duplicate samples across splits and eliminate data leakage.

| Standard Class Identifier | Crop | Disease / Condition | Train (70%) | Val (15%) | Test (15%) | Total Real Images |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Tomato___Bacterial_Spot | Tomato | Bacterial Spot | 105 | 22 | 23 | 150 |
| Tomato___Early_Blight | Tomato | Early Blight | 105 | 22 | 23 | 150 |
| Tomato___Healthy | Tomato | Healthy Crop | 105 | 22 | 23 | 150 |
| Tomato___Late_Blight | Tomato | Late Blight | 105 | 22 | 23 | 150 |
| Rice___Brown_Spot | Rice | Brown Spot | 105 | 22 | 23 | 150 |
| Rice___Healthy | Rice | Healthy Crop | 105 | 22 | 23 | 150 |
| Rice___Leaf_Blast | Rice | Blast | 105 | 22 | 23 | 150 |
| **Total In-Domain** | — | — | **735** | **154** | **161** | **1,050** |
| OOD_Potato___Early_Blight | Potato | OOD Evaluation | — | — | 30 | 30 |
| OOD_Corn___Common_Rust | Corn | OOD Evaluation | — | — | 30 | 30 |

---

## 4. Preprocessing & Data Augmentation Pipeline

1. **Resolution & Normalization**:
   - Resized to standard MobileNet input resolution:  \times 224$ pixels.
   - Channel normalization using ImageNet statistics: $\mu = [0.485, 0.456, 0.406]$, $\sigma = [0.229, 0.224, 0.225]$.
2. **Training Augmentations**:
   - Random Horizontal & Vertical Flips ( = 0.5$)
   - Random Rotation ($\pm 15^\circ$)
   - Color Jitter (Brightness $\pm 10\%$, Contrast $\pm 10\%$)
3. **Data Integrity & Deduplication**:
   - Minimum pixel resolution requirement:  \times 30$.
   - Bitwise MD5 hash tracking ensuring zero cross-split duplication.
   - Independent test set reserved strictly for post-training evaluation.
