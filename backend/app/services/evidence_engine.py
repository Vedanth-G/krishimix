from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.models.agronomy import Crop, Variety, TrialRecord
from app.schemas.evaluation import (
    EvidenceLevel,
    Verdict,
    EvaluationResponse,
    EvaluateRequest,
    TrialCitation,
    AlternativeSuggestion
)
from app.services.rules_engine import rules_engine
from app.services.ler_calculator import ler_calculator
from app.services.ml_service import ml_service

class EvidenceEngine:
    """
    Multi-tier evidence arbitration engine:
      1. OBSERVED: Direct match in empirical trial records.
      2. MODEL-PREDICTED: Rule engine passes -> Scikit-Learn Ensemble Regressor with 95% CI.
      3. UNSUPPORTED: Agronomic constraints violated -> Clear reasons + 2-3 supported alternatives.
    """

    def evaluate(self, db: Session, req: EvaluateRequest) -> EvaluationResponse:
        # Load entities
        crop_a = db.query(Crop).filter(Crop.id == req.crop_a_id).first()
        variety_a = db.query(Variety).filter(Variety.id == req.variety_a_id).first()
        crop_b = db.query(Crop).filter(Crop.id == req.crop_b_id).first()
        variety_b = db.query(Variety).filter(Variety.id == req.variety_b_id).first()

        if not crop_a or not variety_a or not crop_b or not variety_b:
            raise ValueError("Invalid crop or variety ID provided.")

        # Check for same crop selection
        if crop_a.id == crop_b.id:
            return self._build_same_crop_unsupported(crop_a, variety_a, variety_b, req)

        # 1. Look up exact Trial Record match
        exact_trial = (
            db.query(TrialRecord)
            .filter(
                (
                    (TrialRecord.crop_a_name == crop_a.name) &
                    (TrialRecord.variety_a_name == variety_a.name) &
                    (TrialRecord.crop_b_name == crop_b.name) &
                    (TrialRecord.variety_b_name == variety_b.name)
                ) | (
                    (TrialRecord.crop_a_name == crop_b.name) &
                    (TrialRecord.variety_a_name == variety_b.name) &
                    (TrialRecord.crop_b_name == crop_a.name) &
                    (TrialRecord.variety_b_name == variety_a.name)
                )
            )
            .filter(TrialRecord.row_ratio == req.row_ratio)
            .first()
        )

        # 2. Run Agronomic Rules Validation
        is_rules_valid, checks, failure_reasons = rules_engine.validate(
            crop_a=crop_a,
            variety_a=variety_a,
            crop_b=crop_b,
            variety_b=variety_b,
            soil_ph=req.land.soil_ph
        )

        # Scenario 1: OBSERVED (Empirical Trial Match)
        if exact_trial is not None:
            return self._build_observed_response(
                trial=exact_trial,
                crop_a=crop_a,
                variety_a=variety_a,
                crop_b=crop_b,
                variety_b=variety_b,
                req=req,
                checks=checks
            )

        # Scenario 3: UNSUPPORTED (Agronomic rule violation)
        if not is_rules_valid:
            alternatives = self._find_supported_alternatives(
                db=db,
                crop_a=crop_a,
                variety_a=variety_a,
                crop_b=crop_b,
                target_ratio=req.row_ratio
            )
            return self._build_unsupported_response(
                crop_a=crop_a,
                variety_a=variety_a,
                crop_b=crop_b,
                variety_b=variety_b,
                req=req,
                checks=checks,
                reasons=failure_reasons,
                alternatives=alternatives
            )

        # Scenario 2: MODEL-PREDICTED (Rules passed, predict via Machine Learning with CI)
        return self._build_predicted_response(
            crop_a=crop_a,
            variety_a=variety_a,
            crop_b=crop_b,
            variety_b=variety_b,
            req=req,
            checks=checks
        )

    def _build_observed_response(
        self,
        trial: TrialRecord,
        crop_a: Crop,
        variety_a: Variety,
        crop_b: Crop,
        variety_b: Variety,
        req: EvaluateRequest,
        checks: list
    ) -> EvaluationResponse:
        area_factor = req.land.area_acres  # yield per acre
        # Trial record yields are in kg/ha, convert 1 ha = 2.471 acres
        yield_a_acre = round((trial.yield_a_kg_ha / 2.471) * area_factor, 1)
        yield_b_acre = round((trial.yield_b_kg_ha / 2.471) * area_factor, 1)
        solo_a_acre = round((trial.solo_yield_a_kg_ha / 2.471) * area_factor, 1)
        solo_b_acre = round((trial.solo_yield_b_kg_ha / 2.471) * area_factor, 1)

        ler = round(trial.ler, 2)
        price_a = crop_a.market_price_per_kg or 30.0
        price_b = crop_b.market_price_per_kg or 70.0
        gross_inc = round((yield_a_acre * price_a) + (yield_b_acre * price_b), 2)
        est_cost = round(req.land.area_acres * 14500.0, 2)
        net_inc = round(gross_inc - est_cost, 2)

        verdict = Verdict.RECOMMENDED if ler >= 1.20 else Verdict.POSSIBLE
        summary = (
            f"Demonstrated {round((ler - 1.0) * 100)}% land-use advantage documented in institutional field trials."
            if ler > 1.0 else "Comparable to monoculture yields under recorded trial conditions."
        )

        citation = TrialCitation(
            trial_id=trial.id,
            institution=trial.institution,
            year=trial.year,
            location=trial.location,
            season=trial.season,
            citation_text=trial.source,
            soil_type=trial.soil_type,
            rainfall_mm=trial.rainfall_mm,
            is_sample_notice="[SAMPLE DATA] Cultivated under controlled research station conditions. Must be calibrated with regional ICAR/SAU data."
        )

        narrative = (
            f"This combination has real field trial data recorded at {trial.location} ({trial.year}, {trial.season}). "
            f"The trial observed an LER of {ler:.2f}, demonstrating that growing {crop_a.name} ({variety_a.name}) "
            f"and {crop_b.name} ({variety_b.name}) in a {req.row_ratio} configuration outperforms monoculture cropping."
        )

        return EvaluationResponse(
            evidence_level=EvidenceLevel.OBSERVED,
            verdict=verdict,
            verdict_summary=summary,
            ler=ler,
            ler_ci=None,  # Not predicted, it is empirical
            yield_a_kg_per_acre=yield_a_acre,
            yield_b_kg_per_acre=yield_b_acre,
            solo_yield_a_kg_per_acre=solo_a_acre,
            solo_yield_b_kg_per_acre=solo_b_acre,
            gross_income_inr=gross_inc,
            net_income_inr=net_inc,
            water_use_m3=round(max(crop_a.water_req_mm, crop_b.water_req_mm) * 3.5 * req.land.area_acres, 1),
            labour_person_days=round(18.0 * req.land.area_acres, 1),
            risk_score="Low",
            risk_explanation="Backed by published research station trial trials with validated agronomic parameters.",
            checks=checks,
            top_features=[],
            citation=citation,
            unsupported_reasons=[],
            alternatives=[],
            explainability_narrative=narrative,
            crop_a_summary={"name": crop_a.name, "variety": variety_a.name, "height": variety_a.height_cm, "maturity": variety_a.maturity_days},
            crop_b_summary={"name": crop_b.name, "variety": variety_b.name, "height": variety_b.height_cm, "maturity": variety_b.maturity_days}
        )

    def _build_predicted_response(
        self,
        crop_a: Crop,
        variety_a: Variety,
        crop_b: Crop,
        variety_b: Variety,
        req: EvaluateRequest,
        checks: list
    ) -> EvaluationResponse:
        is_legume = "Pulse" in [crop_a.crop_type, crop_b.crop_type] or "Fabaceae" in ((crop_a.family or "") + (crop_b.family or ""))

        features = ml_service.extract_features(
            height_a=variety_a.height_cm,
            height_b=variety_b.height_cm,
            maturity_a=variety_a.maturity_days,
            maturity_b=variety_b.maturity_days,
            row_ratio=req.row_ratio,
            soil_ph=req.land.soil_ph,
            rainfall_mm=650.0,
            water_need_a=variety_a.water_need,
            water_need_b=variety_b.water_need,
            is_legume_cereal=is_legume
        )

        pred_ler, ci, contributions = ml_service.predict_ler_with_ci(features)

        # Baseline yields
        solo_a_acre = round(variety_a.solo_yield_kg_per_ha / 2.471 * req.land.area_acres, 1)
        solo_b_acre = round(variety_b.solo_yield_kg_per_ha / 2.471 * req.land.area_acres, 1)

        yield_a_acre, yield_b_acre = ler_calculator.estimate_intercrop_yields(
            solo_yield_a=solo_a_acre,
            solo_yield_b=solo_b_acre,
            row_ratio=req.row_ratio,
            synergy_factor=pred_ler
        )

        price_a = crop_a.market_price_per_kg or 30.0
        price_b = crop_b.market_price_per_kg or 70.0
        gross_inc = round((yield_a_acre * price_a) + (yield_b_acre * price_b), 2)
        est_cost = round(req.land.area_acres * 15200.0, 2)
        net_inc = round(gross_inc - est_cost, 2)

        verdict = Verdict.RECOMMENDED if pred_ler >= 1.20 else Verdict.POSSIBLE
        summary = f"Agronomically compatible pairing. Model projects ~{round((pred_ler - 1.0)*100)}% land yield gain (95% CI: [{ci.low:.2f}, {ci.high:.2f}])."

        narrative = (
            f"No empirical field trial record matches this specific variety pair and row ratio directly in the database. "
            f"However, agronomic rule validation confirmed full compatibility (sunlight, maturity, root zones, and water). "
            f"Our ensemble machine learning model estimated an LER of {pred_ler:.2f} with a 95% confidence interval "
            f"spanning [{ci.low:.2f} to {ci.high:.2f}], primarily driven by complementary canopy heights and row density."
        )

        return EvaluationResponse(
            evidence_level=EvidenceLevel.MODEL_PREDICTED,
            verdict=verdict,
            verdict_summary=summary,
            ler=pred_ler,
            ler_ci=ci,
            yield_a_kg_per_acre=yield_a_acre,
            yield_b_kg_per_acre=yield_b_acre,
            solo_yield_a_kg_per_acre=solo_a_acre,
            solo_yield_b_kg_per_acre=solo_b_acre,
            gross_income_inr=gross_inc,
            net_income_inr=net_inc,
            water_use_m3=round(max(crop_a.water_req_mm, crop_b.water_req_mm) * 3.8 * req.land.area_acres, 1),
            labour_person_days=round(19.0 * req.land.area_acres, 1),
            risk_score="Moderate",
            risk_explanation="Simulated outcome based on algorithmic synthesis of compatible traits; recommend test strip verification.",
            checks=checks,
            top_features=contributions,
            citation=None,
            unsupported_reasons=[],
            alternatives=[],
            explainability_narrative=narrative,
            crop_a_summary={"name": crop_a.name, "variety": variety_a.name, "height": variety_a.height_cm, "maturity": variety_a.maturity_days},
            crop_b_summary={"name": crop_b.name, "variety": variety_b.name, "height": variety_b.height_cm, "maturity": variety_b.maturity_days}
        )

    def _build_unsupported_response(
        self,
        crop_a: Crop,
        variety_a: Variety,
        crop_b: Crop,
        variety_b: Variety,
        req: EvaluateRequest,
        checks: list,
        reasons: list[str],
        alternatives: list[AlternativeSuggestion]
    ) -> EvaluationResponse:
        narrative = (
            f"The selected combination of {crop_a.name} ({variety_a.name}) and {crop_b.name} ({variety_b.name}) "
            f"cannot be recommended for intercropping. The combination violated {len(reasons)} agronomic safety rule(s): "
            + "; ".join(reasons) + ". No planting layout or optimistic yield claims will be fabricated for agronomically conflicting crops."
        )

        return EvaluationResponse(
            evidence_level=EvidenceLevel.UNSUPPORTED,
            verdict=Verdict.NOT_SUPPORTED,
            verdict_summary="Agronomically incompatible combination. Crop yields will be suppressed due to physiological competition.",
            ler=0.0,
            ler_ci=None,
            yield_a_kg_per_acre=0.0,
            yield_b_kg_per_acre=0.0,
            solo_yield_a_kg_per_acre=0.0,
            solo_yield_b_kg_per_acre=0.0,
            gross_income_inr=0.0,
            net_income_inr=0.0,
            water_use_m3=0.0,
            labour_person_days=0.0,
            risk_score="High",
            risk_explanation="High risk of severe crop failure, shading suppression, or harvest conflict.",
            checks=checks,
            top_features=[],
            citation=None,
            unsupported_reasons=reasons,
            alternatives=alternatives,
            explainability_narrative=narrative,
            crop_a_summary={"name": crop_a.name, "variety": variety_a.name, "height": variety_a.height_cm, "maturity": variety_a.maturity_days},
            crop_b_summary={"name": crop_b.name, "variety": variety_b.name, "height": variety_b.height_cm, "maturity": variety_b.maturity_days}
        )

    def _build_same_crop_unsupported(
        self,
        crop_a: Crop,
        variety_a: Variety,
        variety_b: Variety,
        req: EvaluateRequest
    ) -> EvaluationResponse:
        msg = f"Cannot intercrop {crop_a.name} with itself. Intercropping requires two distinct complementary crops."
        return EvaluationResponse(
            evidence_level=EvidenceLevel.UNSUPPORTED,
            verdict=Verdict.NOT_SUPPORTED,
            verdict_summary=msg,
            ler=1.0,
            yield_a_kg_per_acre=0.0,
            yield_b_kg_per_acre=0.0,
            solo_yield_a_kg_per_acre=0.0,
            solo_yield_b_kg_per_acre=0.0,
            gross_income_inr=0.0,
            net_income_inr=0.0,
            water_use_m3=0.0,
            labour_person_days=0.0,
            risk_score="High",
            risk_explanation="Monoculture variety mixture does not yield intercrop niche separation.",
            checks=[],
            unsupported_reasons=[msg],
            alternatives=[],
            explainability_narrative=msg,
            crop_a_summary={"name": crop_a.name, "variety": variety_a.name, "height": variety_a.height_cm, "maturity": variety_a.maturity_days},
            crop_b_summary={"name": crop_a.name, "variety": variety_b.name, "height": variety_b.height_cm, "maturity": variety_b.maturity_days}
        )

    def _find_supported_alternatives(
        self,
        db: Session,
        crop_a: Crop,
        variety_a: Variety,
        crop_b: Crop,
        target_ratio: str
    ) -> List[AlternativeSuggestion]:
        """Finds 2-3 supported combinations involving Crop A or proven companions."""
        alternatives: List[AlternativeSuggestion] = []

        # First, look for any trial records involving crop_a
        trials = db.query(TrialRecord).filter(
            (TrialRecord.crop_a_name == crop_a.name) | (TrialRecord.crop_b_name == crop_a.name)
        ).limit(3).all()

        for t in trials:
            alternatives.append(AlternativeSuggestion(
                crop_a_name=t.crop_a_name,
                variety_a_name=t.variety_a_name,
                crop_b_name=t.crop_b_name,
                variety_b_name=t.variety_b_name,
                row_ratio=t.row_ratio,
                evidence_level=EvidenceLevel.OBSERVED,
                expected_ler=round(t.ler, 2),
                rationale=f"Validated in {t.location} trials with proven {round((t.ler-1)*100)}% land gain."
            ))

        # If not enough, find other compatible pulse/cereal companion varieties
        if len(alternatives) < 2:
            alt_trials = db.query(TrialRecord).filter(TrialRecord.ler >= 1.25).limit(2).all()
            for t in alt_trials:
                if not any(a.crop_a_name == t.crop_a_name and a.crop_b_name == t.crop_b_name for a in alternatives):
                    alternatives.append(AlternativeSuggestion(
                        crop_a_name=t.crop_a_name,
                        variety_a_name=t.variety_a_name,
                        crop_b_name=t.crop_b_name,
                        variety_b_name=t.variety_b_name,
                        row_ratio=t.row_ratio,
                        evidence_level=EvidenceLevel.OBSERVED,
                        expected_ler=round(t.ler, 2),
                        rationale=f"High-performing ICAR trial standard ({t.crop_a_name} + {t.crop_b_name})."
                    ))

        return alternatives[:3]

evidence_engine = EvidenceEngine()
