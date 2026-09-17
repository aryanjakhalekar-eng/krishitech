from typing import Dict, Any

# Pre-validated, stepped IPM advisories (Cultural -> Biological -> Approved Chemical)
# Strictly adheres to CABC/ICAR recommendations with zero generative chemical dosing.
IPM_DATABASE = {
    "Tomato_Bacterial Spot": {
        "cultural": "Use certified pathogen-free seeds and transplants. Practice strict crop rotation (at least 2 years without solanaceous crops). Avoid overhead sprinkler irrigation to minimize splash dispersal.",
        "biological": "Apply Bacillus subtilis or Pseudomonas fluorescens @ 5g/liter of water at first symptom appearance.",
        "approved_chemical": "Copper Oxychloride 50% WP @ 2.5g/liter + Streptocycline @ 0.1g/liter. Spray at 7-10 day intervals during humid weather.",
        "safety_warning": "Observe safety interval of 5 days before harvest. Avoid inhalation of copper bactericide dust."
    },
    "Tomato_Early Blight": {
        "cultural": "Practice 2-3 year crop rotation with non-solanaceous crops. Remove and destroy infected lower leaves. Ensure 60cm plant spacing for adequate air circulation.",
        "biological": "Apply Trichoderma viride or Bacillus subtilis @ 5g/liter of water as foliar spray during early morning hours.",
        "approved_chemical": "Mancozeb 75% WP @ 2.5g/liter OR Chlorothalonil 75% WP @ 2.0g/liter. Apply 2-3 sprays at 10-14 day intervals.",
        "safety_warning": "Wear protective mask, gloves, and apron. Do not harvest within 7 days of spraying. Keep spray away from drinking water sources."
    },
    "Tomato_Late Blight": {
        "cultural": "Avoid overhead sprinkler irrigation. Use raised beds and clear field margins of wild nightshade hosts.",
        "biological": "Foliar application of Pseudomonas fluorescens (1% WP) @ 10g/liter.",
        "approved_chemical": "Cymoxanil 8% + Mancozeb 64% WP @ 2.0g/liter OR Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/liter.",
        "safety_warning": "Highly systemic chemical. Do not apply near water bodies. Observe pre-harvest interval (PHI) of 10 days."
    },
    "Tomato_Healthy Crop": {
        "cultural": "Continue standard field hygiene, balanced NPK fertilization, and proper irrigation scheduling.",
        "biological": "Apply neem cake @ 250kg/ha to enrich soil organic microbial activity.",
        "approved_chemical": "No chemical fungicide or pesticide required.",
        "safety_warning": "Regular field monitoring advised every 3-5 days."
    },
    "Rice_Healthy Crop": {
        "cultural": "Maintain optimal water level (2-5cm) during vegetative phase. Apply balanced urea top-dressing with zinc sulfate.",
        "biological": "Azospirillum and Phosphobacteria biofertilizers @ 2kg/ha.",
        "approved_chemical": "No chemical fungicide or pesticide required.",
        "safety_warning": "Routine pest and disease surveillance recommended twice a week."
    },
    "Rice_Leaf Blast": {
        "cultural": "Avoid excessive nitrogenous fertilizer application. Drain fields periodically to reduce humidity.",
        "biological": "Pseudomonas fluorescens seed treatment @ 10g/kg seed and nursery dip.",
        "approved_chemical": "Tricyclazole 75% WP @ 0.6g/liter OR Isoprothiolane 40% EC @ 1.5ml/liter.",
        "safety_warning": "Flammable liquid formulation. Keep away from heat sources. Mandatory 14-day pre-harvest interval."
    },
    "Tomato_Leaf Mold": {
        "cultural": "Ensure greenhouse/field ventilation and lower relative humidity below 85%. Prune dense lower leaves and stake tomato plants.",
        "biological": "Spray Bacillus subtilis (1% WP) @ 5g/liter OR Ampelomyces quisqualis @ 5g/liter at first sign of pale green spots on upper leaf surfaces.",
        "approved_chemical": "Difenoconazole 25% EC @ 0.5ml/liter OR Copper Hydroxide 53.8% DF @ 2.0g/liter. Apply at 10-14 day intervals.",
        "safety_warning": "Ensure thorough spray coverage on lower leaf surfaces where velvety olive-green mold sporulates. Observe 7-day pre-harvest interval."
    },
    "Soybean_Healthy Crop": {
        "cultural": "Maintain optimum row spacing (45 cm), adequate seedbed drainage, and timely intercultural weeding.",
        "biological": "Rhizobium and Phosphate Solubilizing Bacteria (PSB) seed inoculation @ 25g/kg seed.",
        "approved_chemical": "No chemical fungicide or pesticide required. Crop appears healthy.",
        "safety_warning": "Conduct routine field surveillance every 4-5 days during vegetative and pod-filling stages."
    },
    "Grape_Healthy Crop": {
        "cultural": "Maintain balanced cane pruning, proper canopy aeration, weed-free vine basins, and drip irrigation scheduling.",
        "biological": "Apply composted farmyard manure enriched with Trichoderma viride @ 5kg/vine annually.",
        "approved_chemical": "No chemical fungicide or pesticide required. Vineyard foliage is healthy.",
        "safety_warning": "Regular canopy scouting recommended twice a week during active shoot growth."
    },
    "Grape_Black Rot": {
        "cultural": "Prune out mummified berries and infected canes during dormant pruning. Destroy all vineyard debris. Ensure open canopy structure for rapid leaf drying.",
        "biological": "Spray Bacillus subtilis (1% WP) @ 5g/liter or Trichoderma harzianum foliar formulations at bud-break.",
        "approved_chemical": "Mancozeb 75% WP @ 2.5g/liter OR Myclobutanil 10% WP @ 0.4g/liter OR Azoxystrobin 23% SC @ 1.0ml/liter.",
        "safety_warning": "Observe mandatory 14-day pre-harvest safety interval (PHI). Wear protective nitrile gloves and respirator when preparing tank mix."
    },
    "Grape_Esca (Black Measles)": {
        "cultural": "Disinfect pruning shears between vines with 70% ethanol or 10% bleach. Avoid large pruning cuts during wet weather; protect fresh pruning wounds with wound sealant paste.",
        "biological": "Apply Trichoderma atroviride pruning wound protectant paste immediately after dormant pruning.",
        "approved_chemical": "Paint fresh pruning wounds with Thiophanate-methyl 70% WP paste (20g/liter water) or Pyraclostrobin pruning barrier.",
        "safety_warning": "Esca is a complex fungal vascular syndrome. Remove and burn severely diseased dead vine trunks away from vineyard."
    },
    "Grape_Leaf Blight": {
        "cultural": "Prune lower leaves to reduce soil splash. Ensure adequate vineyard drainage and eliminate wild vine hosts in bordering hedges.",
        "biological": "Foliar application of Pseudomonas fluorescens @ 5g/liter or Ampelomyces quisqualis @ 5g/liter at onset of spotting.",
        "approved_chemical": "Kresoxim-methyl 44.3% SC @ 0.7ml/liter OR Copper Oxychloride 50% WP @ 2.5g/liter.",
        "safety_warning": "Do not spray copper formulations during high noon temperature (>32°C). Observe 10-day pre-harvest safety interval."
    },
    "Soybean_Leaf Spot": {
        "cultural": "Use certified disease-free seeds. Maintain proper drainage and weed control.",
        "biological": "Seed treatment with Trichoderma harzianum @ 10g/kg seed before sowing.",
        "approved_chemical": "Carbendazim 50% WP @ 1.0g/liter OR Pyraclostrobin 20% WG @ 1.5g/liter.",
        "safety_warning": "Avoid spraying during peak bee activity. Wear face shield and protective boots."
    },
    "Soybean_Rust": {
        "cultural": "Plant rust-tolerant varieties and adjust sowing dates to avoid peak monsoon humidity periods.",
        "biological": "Foliar spray with Verticillium lecanii @ 5g/liter or neem-based formulations @ 3ml/liter.",
        "approved_chemical": "Hexaconazole 5% EC @ 1.0ml/liter OR Propiconazole 25% EC @ 1.0ml/liter.",
        "safety_warning": "Apply at early pustule development stage. Observe 14-day pre-harvest safety interval."
    },
    "Rice_Blast": {
        "cultural": "Avoid excessive nitrogenous fertilizer application. Drain fields periodically to reduce humidity.",
        "biological": "Pseudomonas fluorescens seed treatment @ 10g/kg seed and nursery dip.",
        "approved_chemical": "Tricyclazole 75% WP @ 0.6g/liter OR Isoprothiolane 40% EC @ 1.5ml/liter.",
        "safety_warning": "Flammable liquid formulation. Keep away from heat sources. Mandatory 14-day pre-harvest interval."
    },
    "Rice_Brown Spot": {
        "cultural": "Apply balanced soil fertilization with potassium (K) and silicon amendments. Maintain optimum water depth.",
        "biological": "Seed treatment with Trichoderma viride @ 4g/kg seed.",
        "approved_chemical": "Mancozeb 75% WP @ 2.0g/liter OR Edifenphos 50% EC @ 1.0ml/liter.",
        "safety_warning": "Do not spray against wind direction. Use certified protective respirator."
    },
    "Rice_Bacterial Leaf Blight": {
        "cultural": "Avoid clipping of seedlings during transplanting. Provide proper field drainage and avoid continuous deep flooding. Apply balanced nitrogen with split doses.",
        "biological": "Spray fresh cow dung extract @ 20% OR foliar spray of Pseudomonas fluorescens @ 5g/liter at early symptom onset.",
        "approved_chemical": "Copper Oxychloride 50% WP @ 2.5g/liter + Streptocycline @ 0.1g/liter OR Kasugamycin 3% SL @ 2.0ml/liter.",
        "safety_warning": "Observe 10-day pre-harvest interval. Avoid spraying during strong winds."
    },
    "Rice_Tungro": {
        "cultural": "Control Green Leafhopper (GLH) insect vectors. Destroy stubble of infected previous crops. Synchronize planting in the community.",
        "biological": "Conserve natural predators of leafhoppers (mirid bugs, spiders). Apply Neem oil (1500 ppm) @ 5ml/liter.",
        "approved_chemical": "Apply Thiamethoxam 25% WG @ 0.2g/liter OR Dinotefuran 20% SG @ 0.4g/liter to suppress insect vector population.",
        "safety_warning": "Viral disease is spread by leafhopper vectors. Target insecticide sprays at vectors at early tillering. Wear protective equipment."
    },
    "Cotton_Bollworm Damage": {
        "cultural": "Install yellow sticky traps (10/acre) and erect bird perches (20/acre) in field.",
        "biological": "Release Trichogramma chilonis egg parasitoids @ 50,000/ha 3 times at weekly intervals. Spray HaNPV @ 250 LE/ha.",
        "approved_chemical": "Emamectin benzoate 5% SG @ 0.4g/liter OR Spinetoram 11.7% SC @ 1.0ml/liter.",
        "safety_warning": "Harmful to beneficial pollinators. Spray strictly in evening hours."
    },
    "Cotton_Thrips Infestation": {
        "cultural": "Destroy weed hosts around field borders (Parthenium). Intercrop with cowpea or maize barrier rows.",
        "biological": "Spray Lecanicillium lecanii @ 5g/liter OR Neem oil (1500 ppm) @ 5ml/liter.",
        "approved_chemical": "Thiamethoxam 25% WG @ 0.2g/liter OR Diafenthiuron 50% WP @ 1.2g/liter.",
        "safety_warning": "Toxic to bees. Do not spray during active morning flowering/pollination."
    },
    "Grapes_Downy Mildew": {
        "cultural": "Prune dense canopies for sunlight penetration. Remove fallen diseased leaf debris from vineyard floor.",
        "biological": "Foliar spray of Ampelomyces quisqualis @ 5g/liter.",
        "approved_chemical": "Copper Oxychloride 50% WP @ 3.0g/liter OR Dimethomorph 50% WP @ 1.0g/liter.",
        "safety_warning": "Copper compounds can burn tender leaves in hot sunlight. Apply in early morning."
    },
    "Grapes_Powdery Mildew": {
        "cultural": "Open vine canopies by leaf thinning around grape bunches to maximize air movement.",
        "biological": "Spray Ampelomyces quisqualis @ 5g/liter or sulfur wettable powder @ 2g/liter.",
        "approved_chemical": "Azoxystrobin 23% SC @ 1.0ml/liter OR Penconazole 10% EC @ 0.5ml/liter.",
        "safety_warning": "Do not spray sulfur when temperatures exceed 32°C to prevent phytotoxicity."
    },
    "Potato_Early Blight": {
        "cultural": "Practice crop rotation. Ensure balanced nitrogen fertilization and remove infected debris.",
        "biological": "Foliar application of Trichoderma viride @ 5g/liter.",
        "approved_chemical": "Mancozeb 75% WP @ 2.5g/liter OR Chlorothalonil 75% WP @ 2.0g/liter.",
        "safety_warning": "Observe 7-day pre-harvest interval before tuber digging."
    },
    "Potato_Late Blight": {
        "cultural": "Use certified blight-free seed tubers. High hilling up to cover growing tubers from sporangia wash-off.",
        "biological": "Foliar spray of Pseudomonas fluorescens @ 10g/liter.",
        "approved_chemical": "Cymoxanil 8% + Mancozeb 64% WP @ 2.0g/liter OR Metalaxyl-M 4% + Mancozeb 64% WP @ 2.5g/liter.",
        "safety_warning": "Spray immediately upon local weather blight warning. Mandatory 10-day PHI."
    },
    "Healthy Crop": {
        "cultural": "Continue standard field hygiene, balanced NPK fertilization, and proper irrigation scheduling.",
        "biological": "Apply neem cake @ 250kg/ha to enrich soil organic microbial activity.",
        "approved_chemical": "No chemical fungicide or pesticide required.",
        "safety_warning": "Regular monitoring advised every 3-5 days."
    }
}

DEFAULT_ADVISORY = {
    "cultural": "Inspect crop regularly. Ensure optimal drainage, weed control, and air circulation around crop canopy.",
    "biological": "Apply bio-pesticides like Neem Oil 1500 ppm @ 3-5 ml/liter water for general crop protection.",
    "approved_chemical": "Consult your local Gram Sevak or Agricultural Extension Officer for specific approved chemical dosage.",
    "safety_warning": "Always follow Central Insecticides Board (CIB) guidance and use personal protective equipment."
}

HEALTHY_ADVISORY = {
    "cultural": "Continue standard field hygiene, balanced NPK fertilization, and proper irrigation scheduling.",
    "biological": "Apply neem cake @ 250 kg/ha to enrich soil organic microbial activity.",
    "approved_chemical": "No chemical fungicide or pesticide required. Crop appears healthy.",
    "safety_warning": "Regular field monitoring advised every 3-5 days to catch early symptoms."
}


def get_ipm_advisory(crop: str, disease_name: str) -> Dict[str, Any]:
    """
    Retrieve IPM advisory for a given (crop, disease_name) pair.

    Lookup priority:
      1. Exact key: "{Crop}_{Disease Name}"
      2. Alias lookups (Blast/Leaf Blast, Brown Spot, etc.)
      3. Healthy Crop override (never returns chemical advice)
      4. DEFAULT_ADVISORY fallback

    Chemical advice is withheld for all Healthy Crop results.
    """
    crop        = (crop or "").strip()
    disease_name = (disease_name or "").strip()
    dn_lower    = disease_name.lower()

    # Healthy always overrides — never suggest chemicals for healthy crops
    if "healthy" in dn_lower:
        advisory = HEALTHY_ADVISORY
        return {
            "crop": crop,
            "disease_name": disease_name,
            "cultural_control":          advisory["cultural"],
            "biological_control":        advisory["biological"],
            "approved_chemical_control": advisory["approved_chemical"],
            "safety_warning":            advisory["safety_warning"],
        }

    # Exact key lookup
    key = f"{crop}_{disease_name}"
    advisory = IPM_DATABASE.get(key)

    # Alias: Rice Blast may be stored as "Rice_Leaf Blast"
    if not advisory and disease_name.lower() == "blast":
        advisory = IPM_DATABASE.get(f"{crop}_Leaf Blast") or IPM_DATABASE.get(f"{crop}_Blast")

    # Fuzzy: match disease substring in any key
    if not advisory:
        for k, v in IPM_DATABASE.items():
            if dn_lower in k.lower() and k.lower().startswith(crop.lower()):
                advisory = v
                break

    # Broader fuzzy: any key containing disease name
    if not advisory:
        for k, v in IPM_DATABASE.items():
            if dn_lower in k.lower():
                advisory = v
                break

    if not advisory:
        advisory = DEFAULT_ADVISORY

    return {
        "crop":                      crop,
        "disease_name":              disease_name,
        "cultural_control":          advisory["cultural"],
        "biological_control":        advisory["biological"],
        "approved_chemical_control": advisory["approved_chemical"],
        "safety_warning":            advisory["safety_warning"],
    }
