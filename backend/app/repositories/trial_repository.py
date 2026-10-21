import csv
import io
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.agronomy import TrialRecord
from app.services.ler_calculator import ler_calculator

REQUIRED_CSV_COLUMNS = [
    "crop_a_name", "variety_a_name", "crop_b_name", "variety_b_name",
    "row_ratio", "spacing_cm", "yield_a_kg_ha", "yield_b_kg_ha",
    "solo_yield_a_kg_ha", "solo_yield_b_kg_ha", "season", "location", "source", "year", "soil_type"
]

class TrialRepository:
    @staticmethod
    def get_all_trials(db: Session, limit: int = 100) -> List[TrialRecord]:
        return db.query(TrialRecord).order_by(TrialRecord.id.desc()).limit(limit).all()

    @staticmethod
    def validate_and_ingest_csv(db: Session, csv_content: str) -> Tuple[int, List[str], List[Dict[str, Any]]]:
        """
        Parses CSV, validates required headers and agronomic boundaries,
        calculates LER, and saves valid rows into database.
        Returns:
            (inserted_count, error_messages, preview_records)
        """
        reader = csv.DictReader(io.StringIO(csv_content))
        if not reader.fieldnames:
            return 0, ["Empty CSV file or invalid headers."], []

        missing_headers = [col for col in REQUIRED_CSV_COLUMNS if col not in reader.fieldnames]
        if missing_headers:
            return 0, [f"Missing required columns in CSV: {', '.join(missing_headers)}"], []

        inserted = 0
        errors: List[str] = []
        previews: List[Dict[str, Any]] = []

        for row_idx, row in enumerate(reader, start=2):
            try:
                c_a = row["crop_a_name"].strip()
                v_a = row["variety_a_name"].strip()
                c_b = row["crop_b_name"].strip()
                v_b = row["variety_b_name"].strip()
                ratio = row["row_ratio"].strip()
                spacing = row["spacing_cm"].strip()

                y_a = float(row["yield_a_kg_ha"])
                y_b = float(row["yield_b_kg_ha"])
                s_a = float(row["solo_yield_a_kg_ha"])
                s_b = float(row["solo_yield_b_kg_ha"])

                if s_a <= 0 or s_b <= 0 or y_a < 0 or y_b < 0:
                    errors.append(f"Row {row_idx}: Yield figures must be positive numbers.")
                    continue

                ler, _, _ = ler_calculator.calculate_ler(y_a, s_a, y_b, s_b)

                year = int(row.get("year", 2022))
                source = row.get("source", "SAMPLE CSV Upload").strip()
                institution = row.get("institution", "ICAR / SAU Research Center").strip()
                location = row.get("location", "Karnataka, India").strip()
                season = row.get("season", "Kharif").strip()
                soil = row.get("soil_type", "Red Sandy Loam").strip()
                rainfall = float(row.get("rainfall_mm", 650.0))

                trial = TrialRecord(
                    crop_a_name=c_a,
                    variety_a_name=v_a,
                    crop_b_name=c_b,
                    variety_b_name=v_b,
                    row_ratio=ratio,
                    spacing_cm=spacing,
                    yield_a_kg_ha=y_a,
                    yield_b_kg_ha=y_b,
                    solo_yield_a_kg_ha=s_a,
                    solo_yield_b_kg_ha=s_b,
                    ler=ler,
                    season=season,
                    location=location,
                    source=source,
                    institution=institution,
                    year=year,
                    soil_type=soil,
                    rainfall_mm=rainfall,
                    is_sample_data=1 if "SAMPLE" in source.upper() else 0
                )
                db.add(trial)
                inserted += 1

                if len(previews) < 10:
                    previews.append({
                        "crop_pair": f"{c_a} ({v_a}) + {c_b} ({v_b})",
                        "ratio": ratio,
                        "ler": ler,
                        "source": source,
                        "location": location,
                        "year": year
                    })
            except Exception as e:
                errors.append(f"Row {row_idx}: Error parsing values ({str(e)})")

        if inserted > 0:
            db.commit()

        return inserted, errors, previews

trial_repository = TrialRepository()
