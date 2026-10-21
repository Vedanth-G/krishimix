from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.evaluation import EvaluateRequest, EvaluationResponse
from app.services.evidence_engine import evidence_engine

router = APIRouter(prefix="/evaluate", tags=["Evaluation & Evidence Engine"])

@router.post("", response_model=EvaluationResponse)
def evaluate_intercropping_combination(
    req: EvaluateRequest,
    db: Session = Depends(get_db)
):
    """
    Evaluates a crop/variety pair under specified land constraints.
    Returns:
      - Evidence Level: OBSERVED, MODEL-PREDICTED, or UNSUPPORTED
      - LER (with 95% Confidence Interval for predictions)
      - Plain-language agronomic checks and explainability narrative
      - Citation details (for OBSERVED) or supported alternatives (for UNSUPPORTED)
    """
    try:
        return evidence_engine.evaluate(db, req)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal evaluation error: {str(e)}")
