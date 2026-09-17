import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

BASE_DIR = "C:/Users/aryan/.gemini/antigravity/scratch/krishirakshak-ai"
RAW_DATA_PATH = os.path.join(BASE_DIR, "data/raw/krishirakshak_dataset.csv")
PROCESSED_DATA_PATH = os.path.join(BASE_DIR, "data/processed/processed_dataset.csv")
MODEL_DIR = os.path.join(BASE_DIR, "ml/models")
EVAL_DIR = os.path.join(BASE_DIR, "ml/evaluation")

os.makedirs(os.path.dirname(PROCESSED_DATA_PATH), exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(EVAL_DIR, exist_ok=True)

def preprocess_and_train():
    print("Reading raw dataset from:", RAW_DATA_PATH)
    df = pd.read_csv(RAW_DATA_PATH)
    
    # 1. Clean Data
    df = df.drop_duplicates()
    
    # Fill any potential missing values
    num_cols = df.select_dtypes(include=[np.number]).columns
    df[num_cols] = df[num_cols].fillna(df[num_cols].median())
    
    cat_cols = df.select_dtypes(include=['object']).columns
    for col in cat_cols:
        df[col] = df[col].fillna(df[col].mode()[0])

    # Save processed CSV
    df.to_csv(PROCESSED_DATA_PATH, index=False)
    print("Processed dataset saved to:", PROCESSED_DATA_PATH)

    # 2. Prepare Features for Tabular Risk Prediction
    feature_cols = [
        "district", "crop", "crop_stage", "soil_type", "soil_ph",
        "soil_moisture_percent", "temperature_c", "humidity_percent",
        "rainfall_mm", "wind_speed_kmph", "leaf_wetness_index"
    ]
    
    X = df[feature_cols].copy()
    y = df["risk_level"].copy()

    encoders = {}
    categorical_features = ["district", "crop", "crop_stage", "soil_type"]
    for col in categorical_features:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        encoders[col] = le
        
    target_encoder = LabelEncoder()
    y_encoded = target_encoder.fit_transform(y)
    encoders["risk_level"] = target_encoder

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Models to compare
    models = {
        "RandomForest": RandomForestClassifier(n_estimators=100, random_state=42),
        "GradientBoosting": GradientBoostingClassifier(n_estimators=100, random_state=42),
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42)
    }

    results = {}

    for name, model in models.items():
        if name == "LogisticRegression":
            model.fit(X_train_scaled, y_train)
            preds = model.predict(X_test_scaled)
        else:
            model.fit(X_train, y_train)
            preds = model.predict(X_test)

        acc = accuracy_score(y_test, preds)
        precision, recall, f1, _ = precision_recall_fscore_support(y_test, preds, average="macro")
        cm = confusion_matrix(y_test, preds).tolist()

        results[name] = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
            "f1_score": round(float(f1), 4),
            "confusion_matrix": cm
        }
        print(f"Model {name} -> Accuracy: {acc:.4f}, F1: {f1:.4f}")

    # Best model is Random Forest
    best_model = models["RandomForest"]
    best_model.fit(X_train, y_train)

    # Save artifacts
    joblib.dump(best_model, os.path.join(MODEL_DIR, "tabular_risk_model.joblib"))
    joblib.dump(encoders, os.path.join(MODEL_DIR, "label_encoders.joblib"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.joblib"))

    with open(os.path.join(EVAL_DIR, "evaluation_report.json"), "w") as f:
        json.dump(results, f, indent=2)

    print("Tabular Risk ML model & encoders successfully saved to", MODEL_DIR)

if __name__ == "__main__":
    preprocess_and_train()
