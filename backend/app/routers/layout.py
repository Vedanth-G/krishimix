from fastapi import APIRouter, HTTPException
from app.schemas.layout import LayoutGenerateRequest, PlantingLayoutData
from app.services.layout_generator import layout_generator

router = APIRouter(prefix="/layout", tags=["Planting Layout Generator"])

@router.post("/generate", response_model=PlantingLayoutData)
def generate_planting_layout(req: LayoutGenerateRequest):
    """
    Generates a deterministic to-scale planting layout SVG and dimension table.
    Guarantees mathematically that all rows stay strictly inside the physical field bounds.
    """
    try:
        return layout_generator.generate_layout(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate layout: {str(e)}")
