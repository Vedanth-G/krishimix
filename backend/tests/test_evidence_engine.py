import pytest
from app.database import SessionLocal
from app.services.evidence_engine import evidence_engine
from app.models.agronomy import Crop, Variety
from app.schemas.evaluation import EvaluateRequest, LandConstraints, EvidenceLevel

@pytest.fixture
def db():
    session = SessionLocal()
    yield session
    session.close()

def test_evidence_engine_observed_trial(db):
    """Test that a known trial combination returns OBSERVED with full citation."""
    # Find Maize DHM-117 and Pigeonpea Maruti
    maize = db.query(Crop).filter(Crop.name == "Maize").first()
    dhm = db.query(Variety).filter(Variety.name == "DHM-117").first()
    pigeonpea = db.query(Crop).filter(Crop.name == "Pigeonpea").first()
    maruti = db.query(Variety).filter(Variety.name == "ICP-8863 (Maruti)").first()

    assert maize and dhm and pigeonpea and maruti

    req = EvaluateRequest(
        crop_a_id=maize.id,
        variety_a_id=dhm.id,
        crop_b_id=pigeonpea.id,
        variety_b_id=maruti.id,
        row_ratio="2:1",
        land=LandConstraints(area_acres=1.0)
    )

    res = evidence_engine.evaluate(db, req)
    assert res.evidence_level == EvidenceLevel.OBSERVED
    assert res.citation is not None
    assert "UAS Dharwad" in res.citation.citation_text
    assert res.ler > 1.0

def test_evidence_engine_predicted(db):
    """Test that a novel but compatible pair returns MODEL-PREDICTED with CI."""
    ragi = db.query(Crop).filter(Crop.name.like("%Millet%")).first()
    gpu = db.query(Variety).filter(Variety.name == "GPU-28").first()
    cowpea = db.query(Crop).filter(Crop.name == "Cowpea").first()
    c152 = db.query(Variety).filter(Variety.name == "C-152").first()

    assert ragi and gpu and cowpea and c152

    req = EvaluateRequest(
        crop_a_id=ragi.id,
        variety_a_id=gpu.id,
        crop_b_id=cowpea.id,
        variety_b_id=c152.id,
        row_ratio="2:1",
        land=LandConstraints(area_acres=1.0)
    )

    res = evidence_engine.evaluate(db, req)
    assert res.evidence_level == EvidenceLevel.MODEL_PREDICTED
    assert res.ler_ci is not None
    assert res.ler_ci.low < res.ler_ci.high
    assert len(res.top_features) > 0

def test_evidence_engine_unsupported(db):
    """Test that selecting identical crops returns UNSUPPORTED."""
    maize = db.query(Crop).filter(Crop.name == "Maize").first()
    dhm = db.query(Variety).filter(Variety.name == "DHM-117").first()
    ganga = db.query(Variety).filter(Variety.name == "Ganga-11").first()

    req = EvaluateRequest(
        crop_a_id=maize.id,
        variety_a_id=dhm.id,
        crop_b_id=maize.id,
        variety_b_id=ganga.id,
        row_ratio="2:1",
        land=LandConstraints(area_acres=1.0)
    )

    res = evidence_engine.evaluate(db, req)
    assert res.evidence_level == EvidenceLevel.UNSUPPORTED
    assert res.verdict.value == "Not supported"
    assert len(res.unsupported_reasons) > 0
