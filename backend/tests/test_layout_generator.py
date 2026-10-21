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
    assert "field-boundary-clip" in res.svg_content

def test_layout_polygon_clipping_and_cut_row_lengths():
    """Verify that trapezoid shape generates tapered rows conforming to boundary polygon."""
    req = LayoutGenerateRequest(
        field_length_m=60.0,
        field_breadth_m=40.0,
        crop_a_name="Sorghum",
        variety_a_name="M 35-1",
        crop_b_name="Pigeonpea",
        variety_b_name="TS-3R",
        row_ratio="2:1",
        shape_type="Trapezoid"
    )
    res = layout_generator.generate_layout(req)

    assert res.shape_type == "Trapezoid"
    assert "field-boundary-clip" in res.svg_content
    assert "clip-path=\"url(#field-boundary-clip)\"" in res.svg_content
    assert "Farm Bund / Ridge" in res.svg_content

    # Also test Kannada localization
    req_kn = LayoutGenerateRequest(
        field_length_m=60.0,
        field_breadth_m=40.0,
        crop_a_name="Sorghum",
        variety_a_name="M 35-1",
        crop_b_name="Pigeonpea",
        variety_b_name="TS-3R",
        row_ratio="2:1",
        shape_type="Trapezoid",
        lang="kn"
    )
    res_kn = layout_generator.generate_layout(req_kn)
    assert "ವರಂಬು / ಬದು" in res_kn.svg_content
    assert len(res.polygon_points) == 4
    # Top rows must be shorter than bottom rows in a trapezoid field
    assert res.min_row_length_m < res.max_row_length_m
    first_planted = [r for r in res.rows if r.crop_key in ("A", "B")][0]
    last_planted = [r for r in res.rows if r.crop_key in ("A", "B")][-1]
    assert first_planted.length_m < last_planted.length_m

