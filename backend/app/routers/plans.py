from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models.agronomy import SavedPlan

router = APIRouter(prefix="/plans", tags=["Saved Plans"])

class CreatePlanRequest(BaseModel):
    title: str
    farmer_name: str = "Farmer"
    land_area_acres: float
    field_length_m: float
    field_breadth_m: float
    soil_type: str
    irrigation_source: str
    season: str
    crop_a_id: int
    variety_a_id: int
    crop_b_id: int
    variety_b_id: int
    row_ratio: str
    evidence_level: str
    plan_data: Dict[str, Any]

class PlanSummaryResponse(BaseModel):
    id: int
    title: str
    farmer_name: str
    land_area_acres: float
    crop_a_id: int
    crop_b_id: int
    row_ratio: str
    evidence_level: str
    created_at: datetime
    plan_data: Dict[str, Any]

@router.post("", response_model=PlanSummaryResponse)
def save_plan(req: CreatePlanRequest, db: Session = Depends(get_db)):
    plan = SavedPlan(
        title=req.title,
        farmer_name=req.farmer_name,
        land_area_acres=req.land_area_acres,
        field_length_m=req.field_length_m,
        field_breadth_m=req.field_breadth_m,
        soil_type=req.soil_type,
        irrigation_source=req.irrigation_source,
        season=req.season,
        crop_a_id=req.crop_a_id,
        variety_a_id=req.variety_a_id,
        crop_b_id=req.crop_b_id,
        variety_b_id=req.variety_b_id,
        row_ratio=req.row_ratio,
        evidence_level=req.evidence_level,
        plan_data=req.plan_data
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.get("", response_model=List[PlanSummaryResponse])
def get_plans(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(SavedPlan).order_by(SavedPlan.id.desc()).limit(limit).all()

@router.get("/{plan_id}", response_model=PlanSummaryResponse)
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(SavedPlan).filter(SavedPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan
