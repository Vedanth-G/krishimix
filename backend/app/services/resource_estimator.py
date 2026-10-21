from typing import List
from app.schemas.resources import (
    ResourceAssumptions,
    ResourceEstimationResponse,
    ResourceItemBreakdown
)
from app.models.agronomy import Crop, Variety

class ResourceEstimator:
    """Estimates required inputs (seeds, fertilizers, water, labour) and financial returns."""

    @staticmethod
    def estimate(
        area_acres: float,
        crop_a: Crop,
        variety_a: Variety,
        crop_b: Crop,
        variety_b: Variety,
        row_ratio: str,
        yield_a_kg: float,
        yield_b_kg: float,
        assumptions: ResourceAssumptions | None = None
    ) -> ResourceEstimationResponse:
        p = assumptions or ResourceAssumptions()
        acres = max(0.1, area_acres)

        # Parse ratio for seed proportion
        parts = row_ratio.split(":")
        try:
            ra = float(parts[0])
            rb = float(parts[1]) if len(parts) > 1 else 1.0
            prop_a = ra / (ra + rb)
            prop_b = rb / (ra + rb)
        except Exception:
            prop_a, prop_b = 0.67, 0.33

        # Seed requirement
        seed_a_kg = round(p.seed_rate_a_kg_per_acre * acres * prop_a, 2)
        seed_b_kg = round(p.seed_rate_b_kg_per_acre * acres * prop_b, 2)
        cost_seed_a = seed_a_kg * p.seed_cost_a_inr_per_kg
        cost_seed_b = seed_b_kg * p.seed_cost_b_inr_per_kg
        total_seed_cost = cost_seed_a + cost_seed_b

        # Fertilizer N-P-K (Legume biologically fixes part of N, reducing cereal synthetic requirement by 15%)
        is_legume = "Pulse" in [crop_a.crop_type, crop_b.crop_type] or "Fabaceae" in ((crop_a.family or "") + (crop_b.family or ""))
        n_saving_factor = 0.85 if is_legume else 1.0

        n_kg = round(p.fertilizer_n_kg_per_acre * acres * n_saving_factor, 1)
        p_kg = round(p.fertilizer_p_kg_per_acre * acres, 1)
        k_kg = round(p.fertilizer_k_kg_per_acre * acres, 1)
        total_fert_kg = n_kg + p_kg + k_kg
        total_fert_cost = round(total_fert_kg * p.fertilizer_cost_inr_per_kg, 2)

        # Irrigation water requirement (1 acre-mm = 4.047 m3)
        # Average seasonal evapotranspiration adjusted for intercrop ground cover efficiency (saves 12% evaporation)
        base_water_mm = max(crop_a.water_req_mm, crop_b.water_req_mm) * 0.88
        water_m3 = round(base_water_mm * 4.047 * acres, 1)
        water_cost = round(water_m3 * p.water_cost_inr_per_m3 + (p.diesel_or_electricity_cost_inr * acres), 2)

        # Labour days (land prep, sowing two crops, weeding, harvesting staggered)
        labour_days = round((16.0 + (4.0 * prop_b)) * acres, 1)  # intercropping takes slightly more manual harvesting
        labour_cost = round(labour_days * p.labour_rate_inr_per_day, 2)

        # Total costs
        contingency = (total_seed_cost + total_fert_cost + water_cost + labour_cost) * (p.contingency_pct / 100.0)
        total_input_cost = round(total_seed_cost + total_fert_cost + water_cost + labour_cost + contingency, 2)

        # Revenue
        price_a = crop_a.market_price_per_kg or 30.0
        price_b = crop_b.market_price_per_kg or 70.0
        gross_rev = round((yield_a_kg * price_a) + (yield_b_kg * price_b), 2)
        net_prof = round(gross_rev - total_input_cost, 2)
        bcr = round(gross_rev / max(total_input_cost, 1.0), 2)

        breakdown = [
            ResourceItemBreakdown(
                category="Seeds",
                item_name=f"{crop_a.name} ({variety_a.name}) Certified Seeds",
                quantity=seed_a_kg,
                unit="kg",
                unit_cost_inr=p.seed_cost_a_inr_per_kg,
                total_cost_inr=round(cost_seed_a, 2),
                notes=f"Calculated at {p.seed_rate_a_kg_per_acre} kg/acre base * {prop_a*100:.0f}% row density"
            ),
            ResourceItemBreakdown(
                category="Seeds",
                item_name=f"{crop_b.name} ({variety_b.name}) Certified Seeds",
                quantity=seed_b_kg,
                unit="kg",
                unit_cost_inr=p.seed_cost_b_inr_per_kg,
                total_cost_inr=round(cost_seed_b, 2),
                notes=f"Calculated at {p.seed_rate_b_kg_per_acre} kg/acre base * {prop_b*100:.0f}% row density"
            ),
            ResourceItemBreakdown(
                category="Fertilizer",
                item_name="Basal & Topdress Nutrients (N:P:K)",
                quantity=total_fert_kg,
                unit="kg",
                unit_cost_inr=p.fertilizer_cost_inr_per_kg,
                total_cost_inr=total_fert_cost,
                notes=f"N: {n_kg}kg (includes 15% biological N credit), P: {p_kg}kg, K: {k_kg}kg"
            ),
            ResourceItemBreakdown(
                category="Irrigation / Pumping",
                item_name="Seasonal Water Delivery & Power",
                quantity=water_m3,
                unit="m³",
                unit_cost_inr=p.water_cost_inr_per_m3,
                total_cost_inr=water_cost,
                notes="Ground cover shade reduces surface soil evaporation by ~12%"
            ),
            ResourceItemBreakdown(
                category="Labour",
                item_name="Field Operations & Staggered Harvest",
                quantity=labour_days,
                unit="person-days",
                unit_cost_inr=p.labour_rate_inr_per_day,
                total_cost_inr=labour_cost,
                notes="Land preparation, furrow layout, seeding, inter-cultivation, and harvesting"
            ),
            ResourceItemBreakdown(
                category="Contingency",
                item_name="Buffer & Incidental Reserves",
                quantity=1.0,
                unit="lump-sum",
                unit_cost_inr=round(contingency, 2),
                total_cost_inr=round(contingency, 2),
                notes=f"{p.contingency_pct}% risk buffer for unforeseen fuel or bio-pesticide needs"
            )
        ]

        return ResourceEstimationResponse(
            total_area_acres=round(acres, 2),
            seed_crop_a_kg=seed_a_kg,
            seed_crop_b_kg=seed_b_kg,
            seed_cost_total_inr=round(total_seed_cost, 2),
            fertilizer_n_kg=n_kg,
            fertilizer_p_kg=p_kg,
            fertilizer_k_kg=k_kg,
            fertilizer_cost_total_inr=total_fert_cost,
            water_total_m3=water_m3,
            water_cost_total_inr=water_cost,
            labour_total_days=labour_days,
            labour_cost_total_inr=labour_cost,
            total_input_cost_inr=total_input_cost,
            gross_revenue_inr=gross_rev,
            net_profit_inr=net_prof,
            benefit_cost_ratio=bcr,
            breakdown=breakdown,
            assumptions=p
        )

resource_estimator = ResourceEstimator()
