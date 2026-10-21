import pytest
from app.services.rules_engine import rules_engine
from app.models.agronomy import Crop, Variety

def test_maturity_gap_rejection():
    """Test that maturity difference > 90 days fails with plain-language explanation."""
    c_a = Crop(id=1, name="Maize", crop_type="Cereal")
    v_a = Variety(id=1, crop_id=1, name="Short Maize", maturity_days=65, height_cm=160, canopy_type="Erect", root_depth="Medium", water_need="Medium")

    c_b = Crop(id=2, name="Pigeonpea", crop_type="Pulse")
    v_b = Variety(id=2, crop_id=2, name="Late Redgram", maturity_days=180, height_cm=160, canopy_type="Semi-erect", root_depth="Deep", water_need="Low")

    is_valid, checks, failure_reasons = rules_engine.validate(c_a, v_a, c_b, v_b)
    assert not is_valid
    assert any("Maturity gap too large" in r for r in failure_reasons)
    assert any(c.parameter == "Maturity Gap" and c.status == "FAIL" for c in checks)

def test_canopy_shading_conflict():
    """Test that severe height disparity (>140cm) creates shading failure."""
    c_a = Crop(id=1, name="Giant Maize", crop_type="Cereal")
    v_a = Variety(id=1, crop_id=1, name="Giant 1", maturity_days=100, height_cm=260, canopy_type="Dense", root_depth="Medium", water_need="Medium")

    c_b = Crop(id=2, name="Groundnut", crop_type="Oilseed")
    v_b = Variety(id=2, crop_id=2, name="Dwarf 1", maturity_days=100, height_cm=35, canopy_type="Spreading", root_depth="Medium", water_need="Medium")

    is_valid, checks, failure_reasons = rules_engine.validate(c_a, v_a, c_b, v_b)
    assert not is_valid
    assert any("Severe solar competition" in r or "Dense canopy" in r for r in failure_reasons)

def test_water_requirement_incompatibility():
    """Test that High vs Low water needs triggers rejection."""
    c_a = Crop(id=1, name="Sugarcane", crop_type="Cereal")
    v_a = Variety(id=1, crop_id=1, name="High Water Var", maturity_days=120, height_cm=150, canopy_type="Erect", root_depth="Medium", water_need="High")

    c_b = Crop(id=2, name="Moth Bean", crop_type="Pulse")
    v_b = Variety(id=2, crop_id=2, name="Low Water Var", maturity_days=100, height_cm=100, canopy_type="Semi-erect", root_depth="Medium", water_need="Low")

    is_valid, checks, failure_reasons = rules_engine.validate(c_a, v_a, c_b, v_b)
    assert not is_valid
    assert any("Incompatible water needs" in r for r in failure_reasons)

def test_compatible_pair_passes():
    """Test that harmonious crops pass rule checks."""
    c_a = Crop(id=1, name="Maize", crop_type="Cereal", family="Poaceae")
    v_a = Variety(id=1, crop_id=1, name="DHM-117", maturity_days=105, height_cm=200, canopy_type="Erect", root_depth="Medium", water_need="Medium", soil_ph_min=5.5, soil_ph_max=7.8)

    c_b = Crop(id=2, name="Pigeonpea", crop_type="Pulse", family="Fabaceae")
    v_b = Variety(id=2, crop_id=2, name="TS-3R", maturity_days=140, height_cm=150, canopy_type="Semi-erect", root_depth="Deep", water_need="Medium", soil_ph_min=5.8, soil_ph_max=8.0)

    is_valid, checks, failure_reasons = rules_engine.validate(c_a, v_a, c_b, v_b, soil_ph=6.8)
    assert is_valid
    assert len(failure_reasons) == 0
    assert any(c.parameter == "Biological Nitrogen Synergy" and c.status == "PASS" for c in checks)
