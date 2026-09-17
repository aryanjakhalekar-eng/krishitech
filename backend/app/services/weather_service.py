import random

# Predefined micro-climate weather defaults for Maharashtra Districts
DISTRICT_WEATHER = {
    "Solapur": {"temp_c": 31.5, "humidity": 58.0, "rain_mm": 2.5, "condition": "Sunny"},
    "Pune": {"temp_c": 26.2, "humidity": 78.0, "rain_mm": 12.0, "condition": "Moderate Rain"},
    "Satara": {"temp_c": 24.8, "humidity": 82.5, "rain_mm": 18.4, "condition": "Cloudy & Humid"},
    "Nashik": {"temp_c": 27.4, "humidity": 68.0, "rain_mm": 5.0, "condition": "Partly Cloudy"},
    "Kolhapur": {"temp_c": 25.0, "humidity": 86.0, "rain_mm": 22.0, "condition": "Heavy Rain"},
    "Sangli": {"temp_c": 29.0, "humidity": 64.0, "rain_mm": 4.0, "condition": "Clear Sky"},
    "Ahmednagar": {"temp_c": 30.2, "humidity": 55.0, "rain_mm": 1.0, "condition": "Dry & Warm"},
    "Nanded": {"temp_c": 32.0, "humidity": 52.0, "rain_mm": 0.0, "condition": "Sunny"}
}

def get_current_weather(district: str, taluka: str = None) -> dict:
    """
    Returns weather parameters for a given district and taluka.
    Uses mock realistic data if external API key is absent.
    """
    base = DISTRICT_WEATHER.get(district, {"temp_c": 28.0, "humidity": 65.0, "rain_mm": 5.0, "condition": "Partly Cloudy"})
    
    # Add slight random micro-variations
    temp_variation = round(base["temp_c"] + random.uniform(-1.2, 1.2), 1)
    humidity_variation = round(min(99.0, max(30.0, base["humidity"] + random.uniform(-3.0, 3.0))), 1)
    rain_variation = round(max(0.0, base["rain_mm"] + random.uniform(-0.5, 0.5)), 1)
    
    # Calculate disease risk score based on weather parameters
    risk_score = 0.2
    if humidity_variation > 75 and rain_variation > 5.0:
        risk_score += 0.5
    elif humidity_variation > 60:
        risk_score += 0.3
        
    if 20.0 <= temp_variation <= 28.0:
        risk_score += 0.2

    risk_level = "High" if risk_score >= 0.7 else ("Medium" if risk_score >= 0.4 else "Low")

    return {
        "district": district,
        "taluka": taluka or "Central",
        "temp_c": temp_variation,
        "humidity_percent": humidity_variation,
        "rainfall_mm": rain_variation,
        "wind_speed_kmph": round(random.uniform(5.0, 18.0), 1),
        "weather_condition": base["condition"],
        "contextual_risk_level": risk_level,
        "contextual_risk_score": round(min(0.99, risk_score), 2)
    }
