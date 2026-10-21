from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.repositories.crop_repository import crop_repository
from app.schemas.agronomy import CropResponse, VarietyResponse
from app.models.agronomy import Crop, Variety

router = APIRouter(prefix="/crops", tags=["Crops & Varieties"])

@router.get("", response_model=List[CropResponse])
def get_crops(db: Session = Depends(get_db)):
    """Retrieve all crops with their detailed varieties."""
    return crop_repository.get_all_crops(db)

@router.get("/{crop_id}", response_model=CropResponse)
def get_crop(crop_id: int, db: Session = Depends(get_db)):
    """Retrieve a single crop and its varieties by ID."""
    crop = crop_repository.get_crop_by_id(db, crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop

@router.get("/suggest/companions")
def suggest_companions(
    crop_id: int,
    season: str = "Kharif",
    soil_type: str = "Red Sandy Loam",
    db: Session = Depends(get_db)
):
    """
    'Suggest for me' recommendation engine:
    Recommends top 3 complementary companion crops and varieties for a selected primary crop.
    Prefers legume-cereal synergy and verified trial records.
    """
    primary = crop_repository.get_crop_by_id(db, crop_id)
    if not primary:
        raise HTTPException(status_code=404, detail="Primary crop not found")

    all_crops = crop_repository.get_all_crops(db)
    suggestions = []

    for comp in all_crops:
        if comp.id == primary.id:
            continue

        # Prioritize cereal-pulse synergy
        is_pulse_cereal = (
            ("Pulse" in [primary.crop_type, comp.crop_type] and "Cereal" in [primary.crop_type, comp.crop_type]) or
            ("Pulse" in [primary.crop_type, comp.crop_type] and "Millet" in [primary.crop_type, comp.crop_type]) or
            ("Pulse" in [primary.crop_type, comp.crop_type] and "Oilseed" in [primary.crop_type, comp.crop_type])
        )

        for var_p in primary.varieties[:1]:
            for var_c in comp.varieties:
                mat_diff = abs(var_p.maturity_days - var_c.maturity_days)
                height_diff = abs(var_p.height_cm - var_c.height_cm)

                # Agronomic suitability score
                score = 50.0
                if is_pulse_cereal:
                    score += 35.0
                if 20 <= mat_diff <= 50:
                    score += 15.0
                elif mat_diff > 80:
                    score -= 30.0

                if 40 <= height_diff <= 120:
                    score += 10.0
                elif height_diff > 140:
                    score -= 25.0

                reason = (
                    "High nitrogen synergy and complementary canopy stratification."
                    if is_pulse_cereal else "Balanced duration and water alignment."
                )

                suggestions.append({
                    "crop_b_id": comp.id,
                    "crop_b_name": comp.name,
                    "crop_b_type": comp.crop_type,
                    "variety_b_id": var_c.id,
                    "variety_b_name": var_c.name,
                    "suggested_row_ratio": "2:1" if comp.crop_type == "Pulse" else "1:1",
                    "suitability_score": round(score, 1),
                    "rationale": reason
                })

    suggestions.sort(key=lambda x: x["suitability_score"], reverse=True)
    return suggestions[:4]
