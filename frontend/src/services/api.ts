import {
  Crop,
  EvaluateRequest,
  EvaluationResponse,
  PlantingLayoutData,
  ResourceEstimationResponse,
  ResourceAssumptions,
  ComparisonItem,
  TrialRecord,
  SavedPlan
} from '../types';

const apiEnv = (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env;
const API_BASE = (apiEnv?.VITE_API_BASE_URL ? apiEnv.VITE_API_BASE_URL.replace(/\/$/, '') : '') + '/api/v1';

export async function fetchCrops(): Promise<Crop[]> {
  const res = await fetch(`${API_BASE}/crops`);
  if (!res.ok) throw new Error('Failed to fetch crops');
  return res.json();
}

export async function fetchSuggestedCompanions(cropId: number, season: string, soilType: string) {
  const params = new URLSearchParams({
    crop_id: String(cropId),
    season,
    soil_type: soilType
  });
  const res = await fetch(`${API_BASE}/crops/suggest/companions?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch companion suggestions');
  return res.json();
}

export async function evaluateIntercrop(req: EvaluateRequest): Promise<EvaluationResponse> {
  const res = await fetch(`${API_BASE}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Evaluation request failed' }));
    throw new Error(err.detail || 'Evaluation request failed');
  }
  return res.json();
}

export async function generatePlantingLayout(params: {
  field_length_m: number;
  field_breadth_m: number;
  crop_a_name: string;
  variety_a_name: string;
  crop_b_name: string;
  variety_b_name: string;
  row_ratio: string;
  row_spacing_a_cm?: number;
  plant_spacing_a_cm?: number;
  row_spacing_b_cm?: number;
  plant_spacing_b_cm?: number;
  include_border?: boolean;
  orientation?: string;
}): Promise<PlantingLayoutData> {
  const res = await fetch(`${API_BASE}/layout/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to generate planting layout');
  return res.json();
}

export async function estimateResources(params: {
  area_acres: number;
  crop_a_id: number;
  variety_a_id: number;
  crop_b_id: number;
  variety_b_id: number;
  row_ratio: string;
  yield_a_kg: number;
  yield_b_kg: number;
  assumptions?: ResourceAssumptions;
}): Promise<ResourceEstimationResponse> {
  const res = await fetch(`${API_BASE}/resources/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to estimate farm resources');
  return res.json();
}

export async function compareConfigurations(configurations: EvaluateRequest[]): Promise<ComparisonItem[]> {
  const res = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ configurations })
  });
  if (!res.ok) throw new Error('Failed to compare configurations');
  const data = await res.json();
  return data.items;
}

export async function fetchAdminTrials(): Promise<TrialRecord[]> {
  const res = await fetch(`${API_BASE}/admin/trials`);
  if (!res.ok) throw new Error('Failed to fetch trials');
  return res.json();
}

export async function uploadTrialsCsv(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/admin/trials/upload-csv`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to upload trial CSV' }));
    throw new Error(err.detail || 'Failed to upload CSV');
  }
  return res.json();
}

export async function retrainModel() {
  const res = await fetch(`${API_BASE}/admin/model/retrain`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to retrain model');
  return res.json();
}

export async function fetchModelMetrics() {
  const res = await fetch(`${API_BASE}/admin/model/metrics`);
  if (!res.ok) throw new Error('Failed to fetch model metrics');
  return res.json();
}

export async function savePlan(planPayload: {
  title: string;
  farmer_name: string;
  land_area_acres: number;
  field_length_m: number;
  field_breadth_m: number;
  soil_type: string;
  irrigation_source: string;
  season: string;
  crop_a_id: number;
  variety_a_id: number;
  crop_b_id: number;
  variety_b_id: number;
  row_ratio: string;
  evidence_level: string;
  plan_data: unknown;
}): Promise<SavedPlan> {
  const res = await fetch(`${API_BASE}/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(planPayload)
  });
  if (!res.ok) throw new Error('Failed to save farm plan');
  return res.json();
}

export async function fetchSavedPlans(): Promise<SavedPlan[]> {
  const res = await fetch(`${API_BASE}/plans`);
  if (!res.ok) throw new Error('Failed to fetch saved plans');
  return res.json();
}
