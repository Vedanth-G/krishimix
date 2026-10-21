from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from enum import Enum

class EvidenceLevel(str, Enum):
    OBSERVED = "OBSERVED"
    MODEL_PREDICTED = "MODEL-PREDICTED"
    UNSUPPORTED = "UNSUPPORTED"

class Verdict(str, Enum):
    RECOMMENDED = "Recommended"
    POSSIBLE = "Possible"
    NOT_SUPPORTED = "Not supported"

class LandConstraints(BaseModel):
    area_acres: float = Field(default=1.0, gt=0, description="Area in acres")
    length_m: float = Field(default=63.6, gt=0, description="Field length in meters")
    breadth_m: float = Field(default=63.6, gt=0, description="Field width in meters")
    shape: str = Field(default="Rectangular", description="Rectangular, Square, Contour")
    orientation: str = Field(default="North-South", description="North-South or East-West")
    irrigation: str = Field(default="Rainfed", description="Rainfed, Borewell/Drip, Canal, Sprinkler")
    soil_type: str = Field(default="Red Sandy Loam", description="Black Clay, Red Sandy Loam, Alluvial, Clay Loam")
    soil_ph: float = Field(default=6.8, ge=3.5, le=10.0)
    season: str = Field(default="Kharif", description="Kharif, Rabi, Summer")
    budget_inr: Optional[float] = Field(default=35000.0, description="Farmer budget in INR")

class EvaluateRequest(BaseModel):
    crop_a_id: int
    variety_a_id: int
    crop_b_id: int
    variety_b_id: int
    row_ratio: str = Field(default="2:1", description="e.g. 2:1, 1:1, 3:1, 4:2")
    land: LandConstraints

class FeatureContribution(BaseModel):
    feature: str
    impact: str  # "Positive", "Negative", "Neutral"
    importance_pct: float
    description: str

class ConfidenceInterval(BaseModel):
    low: float
    high: float
    level: float = 0.95

class TrialCitation(BaseModel):
    trial_id: int
    institution: str
    year: int
    location: str
    season: str
    citation_text: str
    soil_type: str
    rainfall_mm: float
    is_sample_notice: str = "SAMPLE DATA: Must be calibrated with real regional ICAR/SAU trial data."

class AgronomicCheckItem(BaseModel):
    parameter: str
    status: str  # "PASS", "WARNING", "FAIL"
    farmer_message: str
    scientific_detail: str

class AlternativeSuggestion(BaseModel):
    crop_a_name: str
    variety_a_name: str
    crop_b_name: str
    variety_b_name: str
    row_ratio: str
    evidence_level: EvidenceLevel
    expected_ler: float
    rationale: str

class EvaluationResponse(BaseModel):
    evidence_level: EvidenceLevel
    verdict: Verdict
    verdict_summary: str
    ler: float
    ler_ci: Optional[ConfidenceInterval] = None
    yield_a_kg_per_acre: float
    yield_b_kg_per_acre: float
    solo_yield_a_kg_per_acre: float
    solo_yield_b_kg_per_acre: float
    gross_income_inr: float
    net_income_inr: float
    water_use_m3: float
    labour_person_days: float
    risk_score: str  # "Low", "Moderate", "High"
    risk_explanation: str
    checks: List[AgronomicCheckItem]
    top_features: List[FeatureContribution] = []
    citation: Optional[TrialCitation] = None
    unsupported_reasons: List[str] = []
    alternatives: List[AlternativeSuggestion] = []
    explainability_narrative: str
    crop_a_summary: Dict[str, Any]
    crop_b_summary: Dict[str, Any]
