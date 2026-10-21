from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

class VarietyBase(BaseModel):
    name: str
    code: Optional[str] = None
    maturity_days: int
    height_cm: float
    canopy_type: str
    root_depth: str
    water_need: str
    soil_ph_min: float = 5.5
    soil_ph_max: float = 8.0
    suitable_agroclimatic_zones: str = "Semi-Arid, Tropical"
    recommended_spacing_cm: str = "45x15"
    solo_yield_kg_per_ha: float = 2500.0
    description: Optional[str] = None

class VarietyResponse(VarietyBase):
    id: int
    crop_id: int
    model_config = ConfigDict(from_attributes=True)

class CropBase(BaseModel):
    name: str
    botanical_name: Optional[str] = None
    family: Optional[str] = None
    crop_type: str
    canopy_default: str
    root_type_default: str
    market_price_per_kg: float = 30.0
    water_req_mm: float = 450.0

class CropResponse(CropBase):
    id: int
    varieties: List[VarietyResponse] = []
    model_config = ConfigDict(from_attributes=True)

class TrialRecordBase(BaseModel):
    crop_a_name: str
    variety_a_name: str
    crop_b_name: str
    variety_b_name: str
    row_ratio: str
    spacing_cm: str
    yield_a_kg_ha: float
    yield_b_kg_ha: float
    solo_yield_a_kg_ha: float
    solo_yield_b_kg_ha: float
    ler: float
    season: str
    location: str
    source: str
    institution: str = "ICAR / State Agricultural University"
    year: int
    soil_type: str
    rainfall_mm: float = 600.0
    is_sample_data: int = 1

class TrialRecordResponse(TrialRecordBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
