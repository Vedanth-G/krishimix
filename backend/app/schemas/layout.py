from pydantic import BaseModel, Field
from typing import List, Optional

class LayoutRowItem(BaseModel):
    row_number: int
    crop_name: str
    variety_name: str
    crop_key: str  # "A" or "B" or "BORDER" or "PATHWAY"
    color: str
    y_offset_m: float
    width_m: float
    length_m: float
    plants_in_row: int
    plant_spacing_m: float

class DimensionTableEntry(BaseModel):
    crop_name: str
    crop_key: str
    color: str
    total_rows: int
    plants_per_row: int
    total_plants: int
    row_spacing_m: float
    plant_spacing_m: float
    percentage_area: float

class PlantingLayoutData(BaseModel):
    field_length_m: float
    field_breadth_m: float
    scale_factor: float
    svg_viewbox: str
    svg_content: str
    total_rows: int
    rows: List[LayoutRowItem]
    dimension_table: List[DimensionTableEntry]
    border_rows_count: int
    pathways_count: int
    pathway_width_m: float
    legend: List[dict]
    orientation: str
    warnings: List[str] = []

class LayoutGenerateRequest(BaseModel):
    field_length_m: float = Field(..., gt=0, description="Field length in meters")
    field_breadth_m: float = Field(..., gt=0, description="Field breadth/width in meters")
    crop_a_name: str
    variety_a_name: str
    crop_b_name: str
    variety_b_name: str
    row_ratio: str = Field(default="2:1", description="e.g. 2:1, 1:1, 3:1, 4:2")
    row_spacing_a_cm: float = 45.0
    plant_spacing_a_cm: float = 20.0
    row_spacing_b_cm: float = 45.0
    plant_spacing_b_cm: float = 20.0
    include_border: bool = True
    pathway_frequency_rows: int = 12
    pathway_width_m: float = 0.8
    orientation: str = "North-South"
