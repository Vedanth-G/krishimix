import pytest
from app.services.layout_generator import layout_generator
from app.schemas.layout import LayoutGenerateRequest

def test_layout_boundary_constraint_never_exceeded():
    """CRITICAL TEST: Verify mathematically that no row exceeds field breadth W."""
    test_cases = [
        {"L": 50.0, "W": 30.0, "ratio": "2:1", "spacing_a": 45.0, "spacing_b": 45.0},
        {"L": 100.0, "W": 60.0, "ratio": "3:1", "spacing_a": 60.0, "spacing_b": 30.0},
        {"L": 25.0, "W": 15.0, "ratio": "1:1", "spacing_a": 30.0, "spacing_b": 30.0},
        {"L": 80.0, "W": 40.0, "ratio": "4:2", "spacing_a": 45.0, "spacing_b": 45.0},
    ]

    for tc in test_cases:
        req = LayoutGenerateRequest(
            field_length_m=tc["L"],
            field_breadth_m=tc["W"],
            crop_a_name="Maize",
            variety_a_name="DHM-117",
            crop_b_name="Pigeonpea",
            variety_b_name="TS-3R",
            row_ratio=tc["ratio"],
            row_spacing_a_cm=tc["spacing_a"],
            row_spacing_b_cm=tc["spacing_b"]
        )
        layout = layout_generator.generate_layout(req)

        assert layout.total_rows > 0
        assert len(layout.rows) == layout.total_rows

        for r in layout.rows:
            # Row position plus width must not exceed field breadth
            assert r.y_offset_m < tc["W"], f"Row {r.row_number} y_offset {r.y_offset_m} exceeded breadth {tc['W']}"
            assert (r.y_offset_m + r.width_m) <= (tc["W"] + 0.01), f"Row {r.row_number} extent exceeded boundary"

def test_layout_dimension_table_consistency():
    """Verify that dimension table row and plant counts match individual rows."""
    req = LayoutGenerateRequest(
        field_length_m=63.6,
        field_breadth_m=63.6,
        crop_a_name="Groundnut",
        variety_a_name="TMV-2",
        crop_b_name="Pigeonpea",
        variety_b_name="Maruti",
        row_ratio="3:1",
        row_spacing_a_cm=30.0,
        row_spacing_b_cm=90.0
    )
    res = layout_generator.generate_layout(req)

    total_table_plants = sum(entry.total_plants for entry in res.dimension_table)
    total_row_plants = sum(r.plants_in_row for r in res.rows)
    assert total_table_plants == total_row_plants
    assert "<svg" in res.svg_content
    assert "</svg>" in res.svg_content
