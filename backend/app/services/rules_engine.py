import json
from pathlib import Path
from typing import Dict, Any, List, Tuple
from app.config import settings
from app.models.agronomy import Variety, Crop
from app.schemas.evaluation import AgronomicCheckItem

class RulesEngine:
    """
    Evaluates agronomic compatibility constraints between two companion varieties.
    Constraints:
      1. Maturity gap (days difference)
      2. Canopy architecture and shading conflicts (height disparity and canopy shapes)
      3. Water requirement compatibility (preventing waterlogging / drought conflict)
      4. Root depth stratification (complementary nutrient / moisture exploration)
      5. Soil pH overlap tolerance
    """

    def __init__(self, rules_path: Path | None = None):
        self.rules_path = rules_path or (settings.DATA_DIR / "compatibility_rules.json")
        self.rules = self._load_rules()

    def _load_rules(self) -> Dict[str, Any]:
        if self.rules_path.exists():
            with open(self.rules_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {
            "maturity_gap": {"max_allowed_days": 90, "warning_threshold_days": 45},
            "canopy_shading": {"incompatible_pairs": []},
            "water_requirement": {"incompatible_levels": []},
            "soil_ph": {"min_overlap_tolerance": 0.4}
        }

    def validate(
        self,
        crop_a: Crop,
        variety_a: Variety,
        crop_b: Crop,
        variety_b: Variety,
        soil_ph: float = 6.8
    ) -> Tuple[bool, List[AgronomicCheckItem], List[str]]:
        """
        Runs comprehensive rule verification.
        Returns:
            is_valid (bool): True if no blocking failures.
            checks (List[AgronomicCheckItem]): Detailed diagnostic list.
            failure_reasons (List[str]): Plain-language bullet reasons if invalid.
        """
        checks: List[AgronomicCheckItem] = []
        failure_reasons: List[str] = []

        # 1. Maturity Gap Check
        mat_diff = abs(variety_a.maturity_days - variety_b.maturity_days)
        mat_cfg = self.rules.get("maturity_gap", {})
        max_mat = mat_cfg.get("max_allowed_days", 90)
        warn_mat = mat_cfg.get("warning_threshold_days", 45)

        if mat_diff > max_mat:
            fail_msg = f"Maturity gap too large ({mat_diff} days between {variety_a.name} [{variety_a.maturity_days}d] and {variety_b.name} [{variety_b.maturity_days}d])."
            checks.append(AgronomicCheckItem(
                parameter="Maturity Gap",
                status="FAIL",
                farmer_message=fail_msg,
                scientific_detail=f"Gap of {mat_diff} days exceeds agronomic limit of {max_mat} days. Harvest disturbance to immature crop will collapse yield."
            ))
            failure_reasons.append(fail_msg)
        elif mat_diff > warn_mat:
            checks.append(AgronomicCheckItem(
                parameter="Maturity Gap",
                status="WARNING",
                farmer_message=f"Maturity gap is {mat_diff} days. Staggered harvesting is manageable with selective manual picking.",
                scientific_detail=f"Difference of {mat_diff} days requires separate harvesting pass."
            ))
        else:
            checks.append(AgronomicCheckItem(
                parameter="Maturity Gap",
                status="PASS",
                farmer_message=f"Optimal maturity window ({mat_diff} days difference). Clean harvesting succession.",
                scientific_detail=f"Maturity delta {mat_diff}d is well within the safe {warn_mat}d envelope."
            ))

        # 2. Canopy Architecture & Shading Conflict Check
        height_diff = variety_a.height_cm - variety_b.height_cm
        abs_h_diff = abs(height_diff)
        tall_crop, tall_var = (crop_a, variety_a) if height_diff >= 0 else (crop_b, variety_b)
        short_crop, short_var = (crop_b, variety_b) if height_diff >= 0 else (crop_a, variety_a)

        is_shading_fail = False
        if abs_h_diff > 140:
            fail_msg = f"Severe solar competition: {tall_crop.name} ({tall_var.height_cm:.0f} cm) towers over {short_crop.name} ({short_var.height_cm:.0f} cm), starving lower plants of sunlight."
            checks.append(AgronomicCheckItem(
                parameter="Canopy Shading",
                status="FAIL",
                farmer_message=fail_msg,
                scientific_detail=f"Height ratio {tall_var.height_cm / max(short_var.height_cm, 1.0):.2f} causes PAR (Photosynthetically Active Radiation) interception above 88%."
            ))
            failure_reasons.append(fail_msg)
            is_shading_fail = True
        elif (tall_var.canopy_type == "Dense" and short_var.canopy_type == "Spreading" and abs_h_diff > 90):
            fail_msg = f"Dense canopy from {tall_crop.name} casts intense ground shadow, smothering spreading ground branches of {short_crop.name}."
            checks.append(AgronomicCheckItem(
                parameter="Canopy Shading",
                status="FAIL",
                farmer_message=fail_msg,
                scientific_detail="Dense upper foliage attenuates red/far-red light spectrum critical for spreading crop development."
            ))
            failure_reasons.append(fail_msg)
            is_shading_fail = True
        elif abs_h_diff > 75:
            checks.append(AgronomicCheckItem(
                parameter="Canopy Shading",
                status="WARNING",
                farmer_message=f"Tall {tall_crop.name} provides partial shade. Suitable for sunny Kharif season.",
                scientific_detail=f"Height difference is {abs_h_diff:.0f} cm. Multi-tier canopy captures stratified sunlight."
            ))
        else:
            checks.append(AgronomicCheckItem(
                parameter="Canopy Shading",
                status="PASS",
                farmer_message="Complementary canopy heights allow abundant sunlight to both crops.",
                scientific_detail=f"Balanced vertical distribution ({variety_a.height_cm:.0f} cm vs {variety_b.height_cm:.0f} cm)."
            ))

        # 3. Water Requirement Incompatibility
        water_a = variety_a.water_need
        water_b = variety_b.water_need
        if (water_a == "High" and water_b == "Low") or (water_a == "Low" and water_b == "High"):
            high_c = crop_a.name if water_a == "High" else crop_b.name
            low_c = crop_b.name if water_a == "High" else crop_a.name
            fail_msg = f"Incompatible water needs: {high_c} demands heavy irrigation, which will rot roots or drown drought-hardy {low_c}."
            checks.append(AgronomicCheckItem(
                parameter="Water Requirement",
                status="FAIL",
                farmer_message=fail_msg,
                scientific_detail=f"Conflicting water regimes ({water_a} vs {water_b}) create acute soil aeration stress."
            ))
            failure_reasons.append(fail_msg)
        elif (water_a == "High" and water_b == "Medium") or (water_a == "Medium" and water_b == "Low"):
            checks.append(AgronomicCheckItem(
                parameter="Water Requirement",
                status="WARNING",
                farmer_message="Moderate water difference. Ridge and furrow planting recommended to isolate root zones.",
                scientific_detail="Differential evapotranspiration demand requires precise moisture conservation."
            ))
        else:
            checks.append(AgronomicCheckItem(
                parameter="Water Requirement",
                status="PASS",
                farmer_message="Both crops share aligned water and moisture needs.",
                scientific_detail=f"Harmonious moisture profiles ({water_a} and {water_b})."
            ))

        # 4. Root Architecture & Nutrient Competition
        root_a = variety_a.root_depth
        root_b = variety_b.root_depth
        if root_a == root_b and "Shallow" in root_a:
            checks.append(AgronomicCheckItem(
                parameter="Root Stratification",
                status="WARNING",
                farmer_message="Both crops feed in the upper 0-30 cm topsoil. Extra basal compost or micro-dose fertilizer suggested.",
                scientific_detail="Identical shallow fibrous root zones compete directly for available nitrogen and phosphate."
            ))
        else:
            checks.append(AgronomicCheckItem(
                parameter="Root Stratification",
                status="PASS",
                farmer_message="Stratified root depths: one explores deep soil while companion feeds near the surface.",
                scientific_detail=f"Complementary root horizons ({root_a} and {root_b}) prevent subsoil competition."
            ))

        # 5. Soil pH Compatibility
        ph_min_a = variety_a.soil_ph_min if getattr(variety_a, "soil_ph_min", None) is not None else 5.5
        ph_max_a = variety_a.soil_ph_max if getattr(variety_a, "soil_ph_max", None) is not None else 8.0
        ph_min_b = variety_b.soil_ph_min if getattr(variety_b, "soil_ph_min", None) is not None else 5.5
        ph_max_b = variety_b.soil_ph_max if getattr(variety_b, "soil_ph_max", None) is not None else 8.0

        overlap_min = max(ph_min_a, ph_min_b)
        overlap_max = min(ph_max_a, ph_max_b)
        if overlap_min > overlap_max:
            fail_msg = f"Incompatible soil pH ranges: {crop_a.name} requires pH {ph_min_a}-{ph_max_a}, while {crop_b.name} requires {ph_min_b}-{ph_max_b}."
            checks.append(AgronomicCheckItem(
                parameter="Soil pH Match",
                status="FAIL",
                farmer_message=fail_msg,
                scientific_detail="No overlapping soil pH tolerance band."
            ))
            failure_reasons.append(fail_msg)
        elif soil_ph < overlap_min or soil_ph > overlap_max:
            checks.append(AgronomicCheckItem(
                parameter="Soil pH Match",
                status="WARNING",
                farmer_message=f"Current soil pH ({soil_ph:.1f}) is slightly outside ideal overlap band ({overlap_min:.1f} - {overlap_max:.1f}). Apply lime or gypsum as conditioned.",
                scientific_detail=f"Field pH {soil_ph} is outside optimal intersection [{overlap_min}, {overlap_max}]."
            ))
        else:
            checks.append(AgronomicCheckItem(
                parameter="Soil pH Match",
                status="PASS",
                farmer_message=f"Soil pH ({soil_ph:.1f}) matches both crop varieties perfectly.",
                scientific_detail=f"pH falls safely within common band [{overlap_min:.1f}, {overlap_max:.1f}]."
            ))

        # 6. Legume-Cereal Nutrient Bonus
        is_legume_cereal = (
            ("Fabaceae" in (crop_a.family or "") and "Poaceae" in (crop_b.family or "")) or
            ("Fabaceae" in (crop_b.family or "") and "Poaceae" in (crop_a.family or "")) or
            ("Pulse" in [crop_a.crop_type, crop_b.crop_type] and "Cereal" in [crop_a.crop_type, crop_b.crop_type]) or
            ("Pulse" in [crop_a.crop_type, crop_b.crop_type] and "Millet" in [crop_a.crop_type, crop_b.crop_type])
        )
        if is_legume_cereal:
            checks.append(AgronomicCheckItem(
                parameter="Biological Nitrogen Synergy",
                status="PASS",
                farmer_message="Natural nitrogen fixing: the pulse legume will share soil nitrogen with companion cereal/millet.",
                scientific_detail="Rhizobial symbiosis fixes atmospheric N2, yielding 25-45 kg N/ha residual credit."
            ))

        is_valid = len(failure_reasons) == 0
        return is_valid, checks, failure_reasons

rules_engine = RulesEngine()
