from pydantic import BaseModel, Field
from typing import Optional, Dict

class ResourceAssumptions(BaseModel):
    seed_rate_a_kg_per_acre: float = 8.0
    seed_rate_b_kg_per_acre: float = 6.0
    seed_cost_a_inr_per_kg: float = 120.0
    seed_cost_b_inr_per_kg: float = 90.0
    fertilizer_n_kg_per_acre: float = 40.0
    fertilizer_p_kg_per_acre: float = 25.0
    fertilizer_k_kg_per_acre: float = 15.0
    fertilizer_cost_inr_per_kg: float = 24.0
    labour_rate_inr_per_day: float = 400.0
    water_cost_inr_per_m3: float = 0.50
    diesel_or_electricity_cost_inr: float = 2200.0
    contingency_pct: float = 5.0

class ResourceItemBreakdown(BaseModel):
    category: str
    item_name: str
    quantity: float
    unit: str
    unit_cost_inr: float
    total_cost_inr: float
    notes: str

class ResourceEstimationResponse(BaseModel):
    total_area_acres: float
    seed_crop_a_kg: float
    seed_crop_b_kg: float
    seed_cost_total_inr: float
    fertilizer_n_kg: float
    fertilizer_p_kg: float
    fertilizer_k_kg: float
    fertilizer_cost_total_inr: float
    water_total_m3: float
    water_cost_total_inr: float
    labour_total_days: float
    labour_cost_total_inr: float
    total_input_cost_inr: float
    gross_revenue_inr: float
    net_profit_inr: float
    benefit_cost_ratio: float
    breakdown: list[ResourceItemBreakdown]
    assumptions: ResourceAssumptions
