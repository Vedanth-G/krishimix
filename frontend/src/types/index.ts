export type EvidenceLevel = 'OBSERVED' | 'MODEL-PREDICTED' | 'UNSUPPORTED';
export type Verdict = 'Recommended' | 'Possible' | 'Not supported';

export interface Variety {
  id: number;
  crop_id: number;
  name: string;
  code?: string;
  maturity_days: number;
  height_cm: number;
  canopy_type: string;
  root_depth: string;
  water_need: string;
  soil_ph_min: number;
  soil_ph_max: number;
  suitable_agroclimatic_zones: string;
  recommended_spacing_cm: string;
  solo_yield_kg_per_ha: number;
  description?: string;
}

export interface Crop {
  id: number;
  name: string;
  botanical_name?: string;
  family?: string;
  crop_type: string;
  canopy_default: string;
  root_type_default: string;
  market_price_per_kg: number;
  water_req_mm: number;
  varieties: Variety[];
}

export interface LandConstraints {
  area_acres: number;
  length_m: number;
  breadth_m: number;
  shape: string;
  shape_type?: string;
  orientation: string;
  irrigation: string;
  soil_type: string;
  soil_ph: number;
  season: string;
  budget_inr?: number;
  photo_preview?: string;
}

export interface EvaluateRequest {
  crop_a_id: number;
  variety_a_id: number;
  crop_b_id: number;
  variety_b_id: number;
  row_ratio: string;
  land: LandConstraints;
}

export interface ConfidenceInterval {
  low: number;
  high: number;
  level: number;
}

export interface FeatureContribution {
  feature: string;
  impact: string;
  importance_pct: number;
  description: string;
}

export interface TrialCitation {
  trial_id: number;
  institution: string;
  year: number;
  location: string;
  season: string;
  citation_text: string;
  soil_type: string;
  rainfall_mm: number;
  is_sample_notice: string;
}

export interface AgronomicCheckItem {
  parameter: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  farmer_message: string;
  scientific_detail: string;
}

export interface AlternativeSuggestion {
  crop_a_name: string;
  variety_a_name: string;
  crop_b_name: string;
  variety_b_name: string;
  row_ratio: string;
  evidence_level: EvidenceLevel;
  expected_ler: number;
  rationale: string;
}

export interface EvaluationResponse {
  evidence_level: EvidenceLevel;
  verdict: Verdict;
  verdict_summary: string;
  ler: number;
  ler_ci?: ConfidenceInterval;
  yield_a_kg_per_acre: number;
  yield_b_kg_per_acre: number;
  solo_yield_a_kg_per_acre: number;
  solo_yield_b_kg_per_acre: number;
  gross_income_inr: number;
  net_income_inr: number;
  water_use_m3: number;
  labour_person_days: number;
  risk_score: 'Low' | 'Moderate' | 'High';
  risk_explanation: string;
  checks: AgronomicCheckItem[];
  top_features: FeatureContribution[];
  citation?: TrialCitation;
  unsupported_reasons: string[];
  alternatives: AlternativeSuggestion[];
  explainability_narrative: string;
  crop_a_summary: {
    name: string;
    variety: string;
    height: number;
    maturity: number;
  };
  crop_b_summary: {
    name: string;
    variety: string;
    height: number;
    maturity: number;
  };
}

export interface LayoutRowItem {
  row_number: number;
  crop_name: string;
  variety_name: string;
  crop_key: string;
  color: string;
  y_offset_m: number;
  width_m: number;
  length_m: number;
  plants_in_row: number;
  plant_spacing_m: number;
}

export interface DimensionTableEntry {
  crop_name: string;
  crop_key: string;
  color: string;
  total_rows: number;
  plants_per_row: number;
  total_plants: number;
  row_spacing_m: number;
  plant_spacing_m: number;
  percentage_area: number;
}

export interface PlantingLayoutData {
  field_length_m: number;
  field_breadth_m: number;
  scale_factor: number;
  svg_viewbox: string;
  svg_content: string;
  total_rows: number;
  rows: LayoutRowItem[];
  dimension_table: DimensionTableEntry[];
  border_rows_count: number;
  pathways_count: number;
  pathway_width_m: number;
  legend: Array<{ label: string; color: string; type: string }>;
  orientation: string;
  warnings: string[];
}

export interface ResourceAssumptions {
  seed_rate_a_kg_per_acre: number;
  seed_rate_b_kg_per_acre: number;
  seed_cost_a_inr_per_kg: number;
  seed_cost_b_inr_per_kg: number;
  fertilizer_n_kg_per_acre: number;
  fertilizer_p_kg_per_acre: number;
  fertilizer_k_kg_per_acre: number;
  fertilizer_cost_inr_per_kg: number;
  labour_rate_inr_per_day: number;
  water_cost_inr_per_m3: number;
  diesel_or_electricity_cost_inr: number;
  contingency_pct: number;
}

export interface ResourceItemBreakdown {
  category: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_cost_inr: number;
  total_cost_inr: number;
  notes: string;
}

export interface ResourceEstimationResponse {
  total_area_acres: number;
  seed_crop_a_kg: number;
  seed_crop_b_kg: number;
  seed_cost_total_inr: number;
  fertilizer_n_kg: number;
  fertilizer_p_kg: number;
  fertilizer_k_kg: number;
  fertilizer_cost_total_inr: number;
  water_total_m3: number;
  water_cost_total_inr: number;
  labour_total_days: number;
  labour_cost_total_inr: number;
  total_input_cost_inr: number;
  gross_revenue_inr: number;
  net_profit_inr: number;
  benefit_cost_ratio: number;
  breakdown: ResourceItemBreakdown[];
  assumptions: ResourceAssumptions;
}

export interface ComparisonItem {
  config_index: number;
  title: string;
  row_ratio: string;
  evidence_level: string;
  verdict: string;
  ler: number;
  total_yield_kg: number;
  estimated_gross_income_inr: number;
  estimated_net_income_inr: number;
  water_use_m3: number;
  labour_days: number;
  risk_score: string;
  evaluation: EvaluationResponse;
}

export interface TrialRecord {
  id: number;
  crop_a_name: string;
  variety_a_name: string;
  crop_b_name: string;
  variety_b_name: string;
  row_ratio: string;
  spacing_cm: string;
  yield_a_kg_ha: number;
  yield_b_kg_ha: number;
  solo_yield_a_kg_ha: number;
  solo_yield_b_kg_ha: number;
  ler: number;
  season: string;
  location: string;
  source: string;
  institution: string;
  year: number;
  soil_type: string;
  rainfall_mm: number;
  is_sample_data: number;
}

export interface SavedPlan {
  id: number;
  title: string;
  farmer_name: string;
  land_area_acres: number;
  crop_a_id: number;
  variety_a_id?: number;
  crop_b_id: number;
  variety_b_id?: number;
  row_ratio: string;
  evidence_level: string;
  created_at: string;
  plan_data: {
    evaluation: EvaluationResponse;
    layout?: PlantingLayoutData;
    resources?: ResourceEstimationResponse;
    land: LandConstraints;
  };
}
