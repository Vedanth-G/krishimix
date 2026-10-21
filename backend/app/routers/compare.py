from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.schemas.evaluation import EvaluateRequest, EvaluationResponse
from app.services.evidence_engine import evidence_engine

router = APIRouter(prefix="/compare", tags=["Compare View"])

class CompareRequest(BaseModel):
    configurations: List[EvaluateRequest]

class ComparisonItem(BaseModel):
    config_index: int
    title: str
    row_ratio: str
    evidence_level: str
    verdict: str
    ler: float
    total_yield_kg: float
    estimated_gross_income_inr: float
    estimated_net_income_inr: float
    water_use_m3: float
    labour_days: float
    risk_score: str
    evaluation: EvaluationResponse

class CompareResponse(BaseModel):
    items: List[ComparisonItem]

@router.post("", response_model=CompareResponse)
def compare_configurations(req: CompareRequest, db: Session = Depends(get_db)):
    """Compares up to 4 supported configurations side-by-side."""
    if len(req.configurations) < 1 or len(req.configurations) > 4:
        raise HTTPException(status_code=400, detail="Please provide between 1 and 4 configurations to compare.")

    results: List[ComparisonItem] = []
    for idx, cfg in enumerate(req.configurations):
        eval_res = evidence_engine.evaluate(db, cfg)
        title = f"{eval_res.crop_a_summary.get('name')} + {eval_res.crop_b_summary.get('name')} ({cfg.row_ratio})"
        tot_yield = round(eval_res.yield_a_kg_per_acre + eval_res.yield_b_kg_per_acre, 1)

        results.append(ComparisonItem(
            config_index=idx + 1,
            title=title,
            row_ratio=cfg.row_ratio,
            evidence_level=eval_res.evidence_level.value,
            verdict=eval_res.verdict.value,
            ler=eval_res.ler,
            total_yield_kg=tot_yield,
            estimated_gross_income_inr=eval_res.gross_income_inr,
            estimated_net_income_inr=eval_res.net_income_inr,
            water_use_m3=eval_res.water_use_m3,
            labour_days=eval_res.labour_person_days,
            risk_score=eval_res.risk_score,
            evaluation=eval_res
        ))

    return CompareResponse(items=results)
