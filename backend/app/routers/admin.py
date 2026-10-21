from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
import pandas as pd
from app.database import get_db
from app.repositories.trial_repository import trial_repository
from app.models.agronomy import TrialRecord, Variety
from app.services.ml_service import ml_service
from app.schemas.agronomy import TrialRecordResponse

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

class UploadCSVResponse(BaseModel):
    inserted_records: int
    errors: List[str]
    previews: List[Dict[str, Any]]
    status: str

@router.get("/trials", response_model=List[TrialRecordResponse])
def get_admin_trials(limit: int = 100, db: Session = Depends(get_db)):
    """Fetches all trial records."""
    return trial_repository.get_all_trials(db, limit)

@router.post("/trials/upload-csv", response_model=UploadCSVResponse)
async def upload_trials_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload and validate a research trial CSV."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported.")

    content = await file.read()
    try:
        csv_text = content.decode("utf-8")
    except UnicodeDecodeError:
        csv_text = content.decode("latin-1")

    inserted, errors, previews = trial_repository.validate_and_ingest_csv(db, csv_text)

    status_msg = f"Successfully ingested {inserted} trial records." if inserted > 0 else "No records ingested."
    return UploadCSVResponse(
        inserted_records=inserted,
        errors=errors,
        previews=previews,
        status=status_msg
    )

@router.post("/model/retrain")
def retrain_model(db: Session = Depends(get_db)):
    """Retrains the Random Forest Regressor on the current trial database."""
    trials = db.query(TrialRecord).all()
    if not trials:
        raise HTTPException(status_code=400, detail="No trial records available for training.")

    training_rows = []
    for t in trials:
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
    return {
        "status": "Model successfully retrained.",
        "metrics": metrics
    }

@router.get("/model/metrics")
def get_model_metrics():
    """Returns current model parameters, R², MAE, and feature importances."""
    return ml_service.metrics
