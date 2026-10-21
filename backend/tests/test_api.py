import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_get_crops():
    res = client.get("/api/v1/crops")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 5
    assert any(c["name"] == "Maize" for c in data)
    assert any(c["name"] == "Pigeonpea" for c in data)

def test_crops_suggestions():
    # Primary crop Maize (id=1)
    res = client.get("/api/v1/crops/suggest/companions?crop_id=1")
    assert res.status_code == 200
    suggestions = res.json()
    assert len(suggestions) > 0
    assert "suggested_row_ratio" in suggestions[0]

def test_layout_generate_api():
    payload = {
        "field_length_m": 60.0,
        "field_breadth_m": 40.0,
        "crop_a_name": "Maize",
        "variety_a_name": "DHM-117",
        "crop_b_name": "Pigeonpea",
        "variety_b_name": "TS-3R",
        "row_ratio": "2:1",
        "row_spacing_a_cm": 60.0,
        "plant_spacing_a_cm": 20.0,
        "row_spacing_b_cm": 120.0,
        "plant_spacing_b_cm": 30.0,
        "include_border": True
    }
    res = client.post("/api/v1/layout/generate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_rows"] > 0
    assert "<svg" in data["svg_content"]
    assert len(data["dimension_table"]) == 2

def test_admin_metrics_api():
    res = client.get("/api/v1/admin/model/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "r2_score" in data
    assert "feature_importances" in data
