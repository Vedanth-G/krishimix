from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.agronomy import Crop, Variety
from app.schemas.resources import ResourceAssumptions, ResourceEstimationResponse
from app.services.resource_estimator import resource_estimator

router = APIRouter(prefix="/resources", tags=["Resource Estimator"])

class ResourceCalculationRequest(BaseModel):
    area_acres: float
    crop_a_id: int
    variety_a_id: int
    crop_b_id: int
    variety_b_id: int
    row_ratio: str = "2:1"
    yield_a_kg: float
    yield_b_kg: float
    assumptions: ResourceAssumptions | None = None

@router.post("/estimate", response_model=ResourceEstimationResponse)
def estimate_farm_resources(req: ResourceCalculationRequest, db: Session = Depends(get_db)):
    """Computes transparent, editable input estimates: seed kg, fertilizer, water, labour."""
    c_a = db.query(Crop).filter(Crop.id == req.crop_a_id).first()
    v_a = db.query(Variety).filter(Variety.id == req.variety_a_id).first()
    c_b = db.query(Crop).filter(Crop.id == req.crop_b_id).first()
    v_b = db.query(Variety).filter(Variety.id == req.variety_b_id).first()

    if not c_a or not v_a or not c_b or not v_b:
        raise HTTPException(status_code=404, detail="Crop or variety not found")

    return resource_estimator.estimate(
        area_acres=req.area_acres,
        crop_a=c_a,
        variety_a=v_a,
        crop_b=c_b,
        variety_b=v_b,
        row_ratio=req.row_ratio,
        yield_a_kg=req.yield_a_kg,
        yield_b_kg=req.yield_b_kg,
        assumptions=req.assumptions
    )
