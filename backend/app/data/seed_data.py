import csv
from pathlib import Path
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models.agronomy import Crop, Variety, TrialRecord
from app.services.ler_calculator import ler_calculator
from app.services.ml_service import ml_service
import pandas as pd

CROPS_DATA = [
    {
        "name": "Maize",
        "botanical_name": "Zea mays",
        "family": "Poaceae (Gramineae)",
        "crop_type": "Cereal",
        "canopy_default": "Erect",
        "root_type_default": "Fibrous shallow-to-medium",
        "market_price_per_kg": 24.0,
        "water_req_mm": 500.0,
        "varieties": [
            {
                "name": "DHM-117",
                "code": "DHM117",
                "maturity_days": 105,
                "height_cm": 210.0,
                "canopy_type": "Erect",
                "root_depth": "Medium (30-60cm)",
                "water_need": "Medium",
                "soil_ph_min": 5.8,
                "soil_ph_max": 7.8,
                "suitable_agroclimatic_zones": "Northern Transitional Zone, Semi-Arid Tropics",
                "recommended_spacing_cm": "60x20",
                "solo_yield_kg_per_ha": 4400.0,
                "description": "High-yielding single cross hybrid with broad leaves and strong lodging resistance."
            },
            {
                "name": "Ganga-11",
                "code": "G11",
                "maturity_days": 95,
                "height_cm": 195.0,
                "canopy_type": "Erect",
                "root_depth": "Medium (30-60cm)",
                "water_need": "Medium",
                "soil_ph_min": 6.0,
                "soil_ph_max": 8.0,
                "suitable_agroclimatic_zones": "Rainfed Red Loam & Black Soil Belts",
                "recommended_spacing_cm": "60x20",
                "solo_yield_kg_per_ha": 4100.0,
                "description": "Medium-duration hybrid suitable for dryland intercropping with pulses."
            }
        ]
    },
    {
        "name": "Pigeonpea",
        "botanical_name": "Cajanus cajan (Redgram / Tur)",
        "family": "Fabaceae (Leguminosae)",
        "crop_type": "Pulse",
        "canopy_default": "Semi-spreading",
        "root_type_default": "Taproot deep (60-150cm)",
        "market_price_per_kg": 75.0,
        "water_req_mm": 400.0,
        "varieties": [
            {
                "name": "ICP-8863 (Maruti)",
                "code": "MARUTI",
                "maturity_days": 155,
                "height_cm": 160.0,
                "canopy_type": "Semi-spreading",
                "root_depth": "Deep (60-150cm)",
                "water_need": "Low",
                "soil_ph_min": 5.5,
                "soil_ph_max": 8.2,
                "suitable_agroclimatic_zones": "Dryland Semi-Arid Tropics, Karnataka, Maharashtra",
                "recommended_spacing_cm": "90x30",
                "solo_yield_kg_per_ha": 1100.0,
                "description": "Fusarium wilt-resistant, deep-rooted drought resilient redgram standard."
            },
            {
                "name": "TS-3R",
                "code": "TS3R",
                "maturity_days": 140,
                "height_cm": 150.0,
                "canopy_type": "Semi-erect",
                "root_depth": "Deep (60-150cm)",
                "water_need": "Low",
                "soil_ph_min": 5.8,
                "soil_ph_max": 8.0,
                "suitable_agroclimatic_zones": "North-Eastern Dry Zone",
                "recommended_spacing_cm": "90x20",
                "solo_yield_kg_per_ha": 1150.0,
                "description": "Medium-early wilt resistant variety; excellent companion for cereals."
            },
            {
                "name": "BRG-1",
                "code": "BRG1",
                "maturity_days": 160,
                "height_cm": 165.0,
                "canopy_type": "Semi-spreading",
                "root_depth": "Deep (60-150cm)",
                "water_need": "Low",
                "soil_ph_min": 5.5,
                "soil_ph_max": 7.8,
                "suitable_agroclimatic_zones": "Southern Dry Zone, Karnataka",
                "recommended_spacing_cm": "90x30",
                "solo_yield_kg_per_ha": 1050.0,
                "description": "Recommended by UAS Bangalore for intercropping with Groundnut and Ragi."
            }
        ]
    },
    {
        "name": "Groundnut",
        "botanical_name": "Arachis hypogaea",
        "family": "Fabaceae (Leguminosae)",
        "crop_type": "Oilseed",
        "canopy_default": "Spreading",
        "root_type_default": "Medium taproot",
        "market_price_per_kg": 68.0,
        "water_req_mm": 420.0,
        "varieties": [
            {
                "name": "TMV-2",
                "code": "TMV2",
                "maturity_days": 105,
                "height_cm": 40.0,
                "canopy_type": "Spreading",
                "root_depth": "Medium (30-60cm)",
                "water_need": "Low",
                "soil_ph_min": 6.0,
                "soil_ph_max": 7.5,
                "suitable_agroclimatic_zones": "Rainfed Red Sandy Loam, Rayalaseema & S. Karnataka",
                "recommended_spacing_cm": "30x10",
                "solo_yield_kg_per_ha": 1850.0,
                "description": "Popular bunch variety with high oil content and early ground cover."
            },
            {
                "name": "JL-24",
                "code": "JL24",
                "maturity_days": 100,
                "height_cm": 45.0,
                "canopy_type": "Semi-spreading",
                "root_depth": "Medium (30-60cm)",
                "water_need": "Low",
                "soil_ph_min": 5.8,
                "soil_ph_max": 7.8,
                "suitable_agroclimatic_zones": "Central and Southern Dryland Belts",
                "recommended_spacing_cm": "30x10",
                "solo_yield_kg_per_ha": 1800.0,
                "description": "Early maturing Spanish bunch with high shelling percentage."
            },
            {
                "name": "KCG-6",
                "code": "KCG6",
                "maturity_days": 110,
                "height_cm": 42.0,
                "canopy_type": "Spreading",
                "root_depth": "Medium (30-60cm)",
                "water_need": "Low",
                "soil_ph_min": 6.0,
                "soil_ph_max": 7.5,
                "suitable_agroclimatic_zones": "Eastern and Southern Karnataka",
                "recommended_spacing_cm": "30x10",
                "solo_yield_kg_per_ha": 1920.0,
                "description": "High pod yield with tolerance to foliar diseases."
            }
        ]
    },
    {
        "name": "Finger Millet (Ragi)",
        "botanical_name": "Eleusine coracana",
        "family": "Poaceae (Gramineae)",
        "crop_type": "Millet",
        "canopy_default": "Erect",
        "root_type_default": "Fibrous shallow (0-30cm)",
        "market_price_per_kg": 38.0,
        "water_req_mm": 350.0,
        "varieties": [
            {
                "name": "GPU-28",
                "code": "GPU28",
                "maturity_days": 115,
                "height_cm": 100.0,
                "canopy_type": "Erect",
                "root_depth": "Shallow (0-30cm)",
                "water_need": "Low",
                "soil_ph_min": 5.5,
                "soil_ph_max": 7.5,
                "suitable_agroclimatic_zones": "Southern Dry Zone, Karnataka",
                "recommended_spacing_cm": "30x10",
                "solo_yield_kg_per_ha": 2900.0,
                "description": "Blast-tolerant, high-tillering variety ideal for intercropping with field bean."
            },
            {
                "name": "ML-365",
                "code": "ML365",
                "maturity_days": 120,
                "height_cm": 110.0,
                "canopy_type": "Erect",
                "root_depth": "Shallow (0-30cm)",
                "water_need": "Low",
                "soil_ph_min": 5.5,
                "soil_ph_max": 7.8,
                "suitable_agroclimatic_zones": "Central & Southern Karnataka",
                "recommended_spacing_cm": "30x10",
                "solo_yield_kg_per_ha": 2850.0,
                "description": "Drought-hardy, fine grain quality with excellent fodder value."
            },
            {
                "name": "KMR-301",
                "code": "KMR301",
                "maturity_days": 118,
                "height_cm": 105.0,
                "canopy_type": "Erect",
                "root_depth": "Shallow (0-30cm)",
                "water_need": "Low",
                "soil_ph_min": 5.5,
                "soil_ph_max": 7.5,
                "suitable_agroclimatic_zones": "Semi-arid red soil zones",
                "recommended_spacing_cm": "30x10",
                "solo_yield_kg_per_ha": 2950.0,
                "description": "Resistant to neck and finger blast, open earheads."
            }
        ]
    },
    {
        "name": "Field Bean (Avare)",
        "botanical_name": "Lablab purpureus",
        "family": "Fabaceae (Leguminosae)",
        "crop_type": "Pulse",
        "canopy_default": "Semi-spreading",
        "root_type_default": "Taproot medium-to-deep",
        "market_price_per_kg": 60.0,
        "water_req_mm": 350.0,
        "varieties": [
            {
                "name": "HA-4",
                "code": "HA4",
                "maturity_days": 130,
                "height_cm": 60.0,
                "canopy_type": "Semi-spreading",
                "root_depth": "Deep (60-150cm)",
                "water_need": "Low",
                "soil_ph_min": 5.8,
                "soil_ph_max": 7.8,
                "suitable_agroclimatic_zones": "Southern Karnataka, Bangalore Rural, Kolar",
                "recommended_spacing_cm": "90x15",
                "solo_yield_kg_per_ha": 750.0,
                "description": "Determinate photo-insensitive variety, releases pod aromatic terpenes."
            },
            {
                "name": "Hebbal Avare",
                "code": "HEBBAL",
                "maturity_days": 135,
                "height_cm": 65.0,
                "canopy_type": "Semi-spreading",
                "root_depth": "Deep (60-150cm)",
                "water_need": "Low",
                "soil_ph_min": 5.8,
                "soil_ph_max": 7.8,
                "suitable_agroclimatic_zones": "Karnataka Plains",
                "recommended_spacing_cm": "90x15",
                "solo_yield_kg_per_ha": 800.0,
                "description": "Traditional fragrant culinary favourite paired historically with Ragi."
            }
        ]
    },
    {
        "name": "Soybean",
        "botanical_name": "Glycine max",
        "family": "Fabaceae (Leguminosae)",
        "crop_type": "Oilseed",
        "canopy_default": "Erect",
        "root_type_default": "Taproot medium",
        "market_price_per_kg": 46.0,
        "water_req_mm": 480.0,
        "varieties": [
            {
                "name": "JS-335",
                "code": "JS335",
                "maturity_days": 98,
                "height_cm": 65.0,
                "canopy_type": "Semi-erect",
                "root_depth": "Medium (30-60cm)",
                "water_need": "Medium",
                "soil_ph_min": 6.0,
                "soil_ph_max": 7.8,
                "suitable_agroclimatic_zones": "Madhya Pradesh, Maharashtra, N. Karnataka",
                "recommended_spacing_cm": "45x10",
                "solo_yield_kg_per_ha": 2200.0,
                "description": "Widely cultivated high-protein variety with good shattering resistance."
            },
            {
                "name": "DSb-21",
                "code": "DSB21",
                "maturity_days": 95,
                "height_cm": 60.0,
                "canopy_type": "Semi-erect",
                "root_depth": "Medium (30-60cm)",
                "water_need": "Medium",
                "soil_ph_min": 6.2,
                "soil_ph_max": 7.8,
                "suitable_agroclimatic_zones": "Northern Karnataka Black Soil Belt",
                "recommended_spacing_cm": "45x10",
                "solo_yield_kg_per_ha": 2150.0,
                "description": "Rust-tolerant soybean bred for intercropping in maize and sorghum rows."
            }
        ]
    },
    {
        "name": "Sorghum (Jowar)",
        "botanical_name": "Sorghum bicolor",
        "family": "Poaceae (Gramineae)",
        "crop_type": "Cereal",
        "canopy_default": "Erect",
        "root_type_default": "Fibrous extensive",
        "market_price_per_kg": 32.0,
        "water_req_mm": 400.0,
        "varieties": [
            {
                "name": "CSH-14",
                "code": "CSH14",
                "maturity_days": 100,
                "height_cm": 180.0,
                "canopy_type": "Erect",
                "root_depth": "Deep (60-150cm)",
                "water_need": "Low",
                "soil_ph_min": 6.0,
                "soil_ph_max": 8.2,
                "suitable_agroclimatic_zones": "Deccan Plateau, Semi-Arid Tropics",
                "recommended_spacing_cm": "45x15",
                "solo_yield_kg_per_ha": 3400.0,
                "description": "Early maturing hybrid, drought evasive, excellent stay-green trait."
            },
            {
                "name": "CSH-16",
                "code": "CSH16",
                "maturity_days": 110,
                "height_cm": 195.0,
                "canopy_type": "Erect",
                "root_depth": "Deep (60-150cm)",
                "water_need": "Low",
                "soil_ph_min": 6.0,
                "soil_ph_max": 8.2,
                "suitable_agroclimatic_zones": "Kharif Jowar Belts of Karnataka & Maharashtra",
                "recommended_spacing_cm": "45x15",
                "solo_yield_kg_per_ha": 3550.0,
                "description": "High grain yield, bold lustrous grains, good dual-purpose stover."
            },
            {
                "name": "M-35-1 (Maldandi)",
                "code": "M351",
                "maturity_days": 125,
                "height_cm": 210.0,
                "canopy_type": "Erect",
                "root_depth": "Deep (60-150cm)",
                "water_need": "Low",
                "soil_ph_min": 6.5,
                "soil_ph_max": 8.5,
                "suitable_agroclimatic_zones": "Rabi Deep Vertisols of North Karnataka & Marathwada",
                "recommended_spacing_cm": "45x15",
                "solo_yield_kg_per_ha": 3100.0,
                "description": "Celebrated drought-hardy winter sorghum with pearly white sweet grains."
            }
        ]
    },
    {
        "name": "Cowpea",
        "botanical_name": "Vigna unguiculata",
        "family": "Fabaceae (Leguminosae)",
        "crop_type": "Pulse",
        "canopy_default": "Semi-spreading",
        "root_type_default": "Taproot medium",
        "market_price_per_kg": 65.0,
        "water_req_mm": 320.0,
        "varieties": [
            {
                "name": "C-152",
                "code": "C152",
                "maturity_days": 85,
                "height_cm": 50.0,
                "canopy_type": "Semi-spreading",
                "root_depth": "Medium (30-60cm)",
                "water_need": "Low",
                "soil_ph_min": 5.5,
                "soil_ph_max": 7.8,
                "suitable_agroclimatic_zones": "All India Dryland Belts",
                "recommended_spacing_cm": "45x15",
                "solo_yield_kg_per_ha": 950.0,
                "description": "Semi-determinate, rapid ground cover, high nitrogen fixation."
            },
            {
                "name": "KBC-2",
                "code": "KBC2",
                "maturity_days": 80,
                "height_cm": 55.0,
                "canopy_type": "Bushy",
                "root_depth": "Medium (30-60cm)",
                "water_need": "Low",
                "soil_ph_min": 5.5,
                "soil_ph_max": 7.8,
                "suitable_agroclimatic_zones": "Karnataka & South India",
                "recommended_spacing_cm": "45x15",
                "solo_yield_kg_per_ha": 980.0,
                "description": "Erect bushy habit, synchronous maturity, excellent companion for sorghum."
            }
        ]
    }
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Crop).count() > 0:
            print("Database already has crop records.")
        else:
            print("Seeding crops and varieties...")
            for c_data in CROPS_DATA:
                varieties_data = c_data.pop("varieties")
                crop = Crop(**c_data)
                db.add(crop)
                db.flush()

                for v_data in varieties_data:
                    var = Variety(crop_id=crop.id, **v_data)
                    db.add(var)

            db.commit()
            print("Crops and varieties successfully seeded.")

        # Seed trial records from sample_trials.csv
        csv_path = Path(__file__).resolve().parent / "sample_trials.csv"
        if csv_path.exists() and db.query(TrialRecord).count() == 0:
            print(f"Ingesting trial records from {csv_path.name}...")
            with open(csv_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    y_a = float(row["yield_a_kg_ha"])
                    y_b = float(row["yield_b_kg_ha"])
                    s_a = float(row["solo_yield_a_kg_ha"])
                    s_b = float(row["solo_yield_b_kg_ha"])
                    ler, _, _ = ler_calculator.calculate_ler(y_a, s_a, y_b, s_b)

                    trial = TrialRecord(
                        crop_a_name=row["crop_a_name"].strip(),
                        variety_a_name=row["variety_a_name"].strip(),
                        crop_b_name=row["crop_b_name"].strip(),
                        variety_b_name=row["variety_b_name"].strip(),
                        row_ratio=row["row_ratio"].strip(),
                        spacing_cm=row["spacing_cm"].strip(),
                        yield_a_kg_ha=y_a,
                        yield_b_kg_ha=y_b,
                        solo_yield_a_kg_ha=s_a,
                        solo_yield_b_kg_ha=s_b,
                        ler=ler,
                        season=row["season"].strip(),
                        location=row["location"].strip(),
                        source=row["source"].strip(),
                        institution=row["institution"].strip(),
                        year=int(row["year"]),
                        soil_type=row["soil_type"].strip(),
                        rainfall_mm=float(row["rainfall_mm"]),
                        is_sample_data=1
                    )
                    db.add(trial)
            db.commit()
            print("Trial records successfully seeded.")

        # Train initial ML model using trial records
        trials = db.query(TrialRecord).all()
        if trials:
            print(f"Training Agronomic ML Regressor on {len(trials)} trial observations...")
            training_rows = []
            for t in trials:
                # Find variety details to calculate features
                var_a = db.query(Variety).filter(Variety.name == t.variety_a_name).first()
                var_b = db.query(Variety).filter(Variety.name == t.variety_b_name).first()
                h_a = var_a.height_cm if var_a else 180.0
                h_b = var_b.height_cm if var_b else 60.0
                m_a = var_a.maturity_days if var_a else 100
                m_b = var_b.maturity_days if var_b else 140
                w_a = var_a.water_need if var_a else "Medium"
                w_b = var_b.water_need if var_b else "Low"

                parts = t.row_ratio.split(":")
                try:
                    ra, rb = float(parts[0]), float(parts[1]) if len(parts) > 1 else 1.0
                    r_prop = ra / (ra + rb)
                except Exception:
                    r_prop = 0.67

                h_diff = abs(h_a - h_b)
                m_diff = abs(m_a - m_b)
                w_map = {"Low": 1.0, "Medium": 2.0, "High": 3.0}
                w_gap = abs(w_map.get(w_a, 2.0) - w_map.get(w_b, 2.0))
                legume_val = 1.0 if "Pigeonpea" in (t.crop_a_name + t.crop_b_name) or "Cowpea" in (t.crop_a_name + t.crop_b_name) or "Soybean" in (t.crop_a_name + t.crop_b_name) or "Bean" in (t.crop_a_name + t.crop_b_name) else 0.0

                training_rows.append({
                    "height_diff_cm": h_diff,
                    "maturity_diff_days": m_diff,
                    "ratio_a_prop": r_prop,
                    "soil_ph": 6.8,
                    "rainfall_mm": t.rainfall_mm,
                    "water_gap_score": w_gap,
                    "legume_cereal_pair": legume_val,
                    "ler": t.ler
                })
            df = pd.DataFrame(training_rows)
            metrics = ml_service.train_on_dataframe(df)
            print("Model successfully trained. Metrics:", metrics)

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
