export interface LocationProfile {
  district: string;
  state: string;
  zone: string;
  typicalSoil: string;
  typicalPh: number;
  avgRainfallMm: number;
  suitableCrops: string[];
}

export const REGIONAL_LOCATION_PROFILES: LocationProfile[] = [
  {
    district: "Dharwad",
    state: "Karnataka",
    zone: "Northern Transitional Zone",
    typicalSoil: "Black Clay (Vertisol)",
    typicalPh: 7.6,
    avgRainfallMm: 680,
    suitableCrops: ["Maize", "Pigeonpea", "Groundnut", "Soybean", "Sorghum (Jowar)"]
  },
  {
    district: "Raichur",
    state: "Karnataka",
    zone: "North-Eastern Dry Zone",
    typicalSoil: "Black Clay (Vertisol)",
    typicalPh: 8.0,
    avgRainfallMm: 540,
    suitableCrops: ["Pigeonpea", "Sorghum (Jowar)", "Groundnut", "Cowpea"]
  },
  {
    district: "Bangalore Rural",
    state: "Karnataka",
    zone: "Southern Dry Zone",
    typicalSoil: "Red Sandy Loam",
    typicalPh: 6.4,
    avgRainfallMm: 740,
    suitableCrops: ["Finger Millet (Ragi)", "Field Bean (Avare)", "Groundnut", "Pigeonpea"]
  },
  {
    district: "Mandya",
    state: "Karnataka",
    zone: "Southern Transition Zone",
    typicalSoil: "Red Sandy Loam",
    typicalPh: 6.6,
    avgRainfallMm: 710,
    suitableCrops: ["Finger Millet (Ragi)", "Field Bean (Avare)", "Cowpea"]
  },
  {
    district: "Belagavi",
    state: "Karnataka",
    zone: "Northern Transitional Zone",
    typicalSoil: "Medium Black Soil",
    typicalPh: 7.2,
    avgRainfallMm: 820,
    suitableCrops: ["Soybean", "Maize", "Groundnut", "Pigeonpea"]
  },
  {
    district: "Vijayapura",
    state: "Karnataka",
    zone: "Northern Dry Zone",
    typicalSoil: "Black Clay (Vertisol)",
    typicalPh: 7.9,
    avgRainfallMm: 510,
    suitableCrops: ["Sorghum (Jowar)", "Pigeonpea", "Cowpea"]
  },
  {
    district: "Kalaburagi",
    state: "Karnataka",
    zone: "North-Eastern Dry Zone",
    typicalSoil: "Deep Black Clay",
    typicalPh: 8.1,
    avgRainfallMm: 590,
    suitableCrops: ["Pigeonpea", "Sorghum (Jowar)", "Soybean"]
  },
  {
    district: "Anantapur",
    state: "Andhra Pradesh",
    zone: "Scarce Rainfall Zone",
    typicalSoil: "Red Sandy Loam",
    typicalPh: 6.5,
    avgRainfallMm: 460,
    suitableCrops: ["Groundnut", "Pigeonpea", "Cowpea"]
  },
  {
    district: "Solapur",
    state: "Maharashtra",
    zone: "Scarcity Zone",
    typicalSoil: "Black Clay (Vertisol)",
    typicalPh: 7.8,
    avgRainfallMm: 530,
    suitableCrops: ["Sorghum (Jowar)", "Pigeonpea", "Soybean"]
  },
  {
    district: "Indore",
    state: "Madhya Pradesh",
    zone: "Malwa Plateau",
    typicalSoil: "Medium Black Soil",
    typicalPh: 7.4,
    avgRainfallMm: 880,
    suitableCrops: ["Soybean", "Maize", "Pigeonpea"]
  },
  {
    district: "Hyderabad",
    state: "Telangana",
    zone: "Southern Telangana Zone",
    typicalSoil: "Red Sandy Loam",
    typicalPh: 6.8,
    avgRainfallMm: 640,
    suitableCrops: ["Maize", "Pigeonpea", "Cowpea"]
  },
  {
    district: "Coimbatore",
    state: "Tamil Nadu",
    zone: "Western Zone",
    typicalSoil: "Red Sandy Loam",
    typicalPh: 6.7,
    avgRainfallMm: 610,
    suitableCrops: ["Groundnut", "Cowpea", "Sorghum (Jowar)"]
  }
];

export function findLocationProfile(query: string): LocationProfile | null {
  if (!query || query.trim().length < 2) return null;
  const q = query.toLowerCase().trim();
  return (
    REGIONAL_LOCATION_PROFILES.find(
      p =>
        q.includes(p.district.toLowerCase()) ||
        p.district.toLowerCase().includes(q) ||
        (q.includes(p.state.toLowerCase()) && q.includes(p.district.toLowerCase()))
    ) || null
  );
}
