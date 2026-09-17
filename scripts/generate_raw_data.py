import os
import random
import pandas as pd
import numpy as np

# Set random seeds for reproducibility
random.seed(42)
np.random.seed(42)

DISTRICT_TALUKAS = {
    "Solapur": ["Mangalwedhe", "Pandharpur", "Malshiras", "Akkalkot"],
    "Pune": ["Daund", "Shirur", "Indapur", "Baramati"],
    "Satara": ["Phaltan", "Koregaon", "Wai", "Karad"],
    "Nashik": ["Dindori", "Malegaon", "Niphad", "Sinnar"],
    "Kolhapur": ["Shirol", "Kagal", "Hatkanangale", "Karveer"],
    "Sangli": ["Jat", "Tasgaon", "Miraj", "Kavathe Mahankal"],
    "Ahmednagar": ["Kopargaon", "Sangamner", "Rahata", "Shrigonda"],
    "Nanded": ["Hadgaon", "Biloli", "Deglur", "Loha"]
}

CROP_VARIETIES = {
    "Soybean": ["MACS-1188", "JS-335", "MAUS-71"],
    "Rice": ["Indrayani", "Phule Samruddhi", "Basmati"],
    "Tomato": ["Hybrid-T1", "Arka Rakshak", "Abhinav"],
    "Grapes": ["Sonaka", "Thompson Seedless", "Sharad Seedless"],
    "Potato": ["Local-P1", "Kufri Jyoti", "Kufri Pukhraj"],
    "Cotton": ["Bt Cotton", "RCH-659", "Bunny Bt"]
}

CROP_STAGES = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Maturity"]
SOIL_TYPES = ["Black Soil", "Loamy", "Clay Loam", "Sandy Loam"]

DIAGNOSES = [
    "Healthy", "Leaf Spot", "Stem Borer", "Early Blight", "Late Blight",
    "Thrips", "Downy Mildew", "Rust", "Blast", "Bacterial Blight",
    "Powdery Mildew", "Leaf Mold", "Brown Spot", "Leaf Miner", "Bollworm"
]

PEST_TYPES = ["None", "Bollworm", "Thrips", "Whitefly", "Stem Borer", "Fruit Fly", "Leaf Miner", "Aphids"]
TRAP_TYPES = ["None", "Sticky Trap", "Pheromone Trap", "Light Trap"]
IMAGE_QUALITIES = ["Good", "Blurry", "Too Dark", "Poor Framing", "Too Bright"]

def generate_dataset(num_records=3628):
    rows = []
    districts = list(DISTRICT_TALUKAS.keys())
    crops = list(CROP_VARIETIES.keys())

    for i in range(1, num_records + 1):
        rec_id = f"KR_{i:05d}"
        district = random.choice(districts)
        taluka = random.choice(DISTRICT_TALUKAS[district])
        
        # Latitude: 16.0 to 21.5 (Maharashtra range)
        lat = round(random.uniform(16.0, 21.5), 5)
        # Longitude: 73.0 to 79.5 (Maharashtra range)
        lon = round(random.uniform(73.0, 79.5), 5)
        
        crop = random.choice(crops)
        variety = random.choice(CROP_VARIETIES[crop])
        crop_stage = random.choice(CROP_STAGES)
        soil_type = random.choice(SOIL_TYPES)
        
        soil_ph = round(random.uniform(6.0, 8.2), 2)
        soil_moisture = round(random.uniform(15.0, 75.0), 1)
        
        diagnosis = random.choice(DIAGNOSES)
        if diagnosis == "Healthy":
            severity = "None"
            damage_percent = round(random.uniform(0.0, 5.0), 1)
            pest_type = "None"
        else:
            severity = random.choice(["Mild", "Moderate", "Severe"])
            if severity == "Mild":
                damage_percent = round(random.uniform(5.0, 20.0), 1)
            elif severity == "Moderate":
                damage_percent = round(random.uniform(20.0, 50.0), 1)
            else:
                damage_percent = round(random.uniform(50.0, 85.0), 1)
            pest_type = random.choice(PEST_TYPES[1:])
            
        trap_type = random.choice(TRAP_TYPES)
        trap_count = 0 if trap_type == "None" else random.randint(1, 15)
        
        temp_c = round(random.uniform(18.0, 38.0), 1)
        humidity = round(random.uniform(35.0, 98.0), 1)
        rainfall = round(random.uniform(0.0, 45.0), 1)
        wind_speed = round(random.uniform(2.0, 22.0), 1)
        leaf_wetness = round(random.uniform(20.0, 95.0), 1)
        
        img_quality = random.choice(["Good", "Good", "Good", "Blurry", "Too Dark", "Poor Framing", "Too Bright"])
        if img_quality == "Good":
            img_quality_score = round(random.uniform(0.75, 1.0), 3)
        else:
            img_quality_score = round(random.uniform(0.20, 0.65), 3)
            
        ai_confidence = round(random.uniform(0.45, 0.99), 3)
        
        # Referral required if low confidence or poor image quality
        referral_required = "Yes" if (img_quality != "Good" or ai_confidence < 0.75) else "No"
        expert_verified = "Yes" if random.random() > 0.3 else "No"
        
        prev_disease = random.choice(["None"] + DIAGNOSES[1:])
        prev_pest = random.choice(PEST_TYPES)
        
        # Risk level determination based on humidity, temperature, and damage
        if humidity > 80 and (severity == "Severe" or damage_percent > 40):
            risk_level = "High"
        elif humidity > 60 or severity == "Moderate" or damage_percent > 15:
            risk_level = "Medium"
        else:
            risk_level = "Low"
            
        date_str = f"2026-0{random.randint(1,8):02d}-{random.randint(1,28):02d}"

        rows.append({
            "record_id": rec_id,
            "date": date_str,
            "district": district,
            "taluka": taluka,
            "latitude": lat,
            "longitude": lon,
            "crop": crop,
            "variety": variety,
            "crop_stage": crop_stage,
            "soil_type": soil_type,
            "soil_ph": soil_ph,
            "soil_moisture_percent": soil_moisture,
            "diagnosis": diagnosis,
            "severity": severity,
            "damage_percent": damage_percent,
            "pest_type": pest_type,
            "trap_type": trap_type,
            "trap_count": trap_count,
            "temperature_c": temp_c,
            "humidity_percent": humidity,
            "rainfall_mm": rainfall,
            "wind_speed_kmph": wind_speed,
            "leaf_wetness_index": leaf_wetness,
            "image_quality": img_quality,
            "image_quality_score": img_quality_score,
            "ai_confidence": ai_confidence,
            "expert_verified": expert_verified,
            "referral_required": referral_required,
            "previous_disease": prev_disease,
            "previous_pest": prev_pest,
            "risk_level": risk_level
        })

    df = pd.DataFrame(rows)
    raw_path = "C:/Users/aryan/.gemini/antigravity/scratch/krishirakshak-ai/data/raw/krishirakshak_dataset.csv"
    os.makedirs(os.path.dirname(raw_path), exist_ok=True)
    df.to_csv(raw_path, index=False)
    print(f"Generated raw dataset with {len(df)} records at {raw_path}")

if __name__ == "__main__":
    generate_dataset()
