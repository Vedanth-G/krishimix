"""
Deterministic To-Scale SVG Layout Generator for Intercropped Fields with
Dynamic Boundary Polygon Clipping and Farmer-Centric Visuals.

Features:
1. Dynamic Polygon Conformation: Crop rows and furrows strictly conform to
   arbitrary field polygons (Regular, Trapezoid, Contour, Custom Boundary).
2. Line-Polygon Intersection: Calculates true cut row lengths (x_start, x_end)
   for tapering or irregular boundaries, ensuring realistic plant populations.
3. Farmer-Centric Top-Down Map: Warm plowed soil texture, green cereal lines
   with leaf glyphs, amber dashed legume lines with blossom dots, light earthen
   walking tracks, and traditional dashed bund (ವರಂಬು / ಬದು).
4. Measurement Brackets: Clean rustic dimension brackets (ಉದ್ದ, ಅಗಲ) without
   abstract Cartesian grid ticks or scientific coordinate axes.
"""

from typing import List, Dict, Any, Tuple
import math
from app.schemas.layout import (
    PlantingLayoutData,
    LayoutRowItem,
    DimensionTableEntry,
    LayoutGenerateRequest
)

COLOR_CROP_A = "#16a34a"      # Emerald Green 600 (Main Cereal)
COLOR_CROP_B = "#d97706"      # Amber Gold 600 (Pulse / Legume)
COLOR_BORDER = "#15803d"      # Deep Forest Green (Trap crop / border)
COLOR_PATHWAY = "#fef3c7"     # Light Earthen Track (Sprayer / Walking Path)
COLOR_SOIL = "#78350f"        # Warm agricultural plowed soil
COLOR_BUND = "#451a03"        # Deep earthen field bund / ridge

class LayoutGenerator:
    """Generates precise, deterministic SVG planting layouts with boundary validation."""

    @staticmethod
    def _get_shape_polygon(shape_type: str, L: float, W: float) -> List[Tuple[float, float]]:
        """Returns meter-space vertices [(x, y)] of the field boundary polygon."""
        st = (shape_type or "Regular").lower()
        if "trap" in st:
            # Trapezoid: narrower top (70% width), full width at bottom base
            return [
                (0.15 * L, 0.0),
                (0.85 * L, 0.0),
                (L, W),
                (0.0, W)
            ]
        elif "contour" in st:
            # Smooth curved slope / terrace contour polygon
            return [
                (0.06 * L, 0.08 * W),
                (0.35 * L, 0.01 * W),
                (0.70 * L, 0.04 * W),
                (0.94 * L, 0.14 * W),
                (0.98 * L, 0.52 * W),
                (0.92 * L, 0.88 * W),
                (0.60 * L, 0.98 * W),
                (0.15 * L, 0.94 * W),
                (0.02 * L, 0.56 * W)
            ]
        elif "custom" in st:
            # Irregular field boundary sketch
            return [
                (0.10 * L, 0.06 * W),
                (0.50 * L, 0.02 * W),
                (0.92 * L, 0.15 * W),
                (0.98 * L, 0.65 * W),
                (0.80 * L, 0.96 * W),
                (0.20 * L, 0.90 * W),
                (0.03 * L, 0.48 * W)
            ]
        else:
            # Regular rectangular parcel
            return [
                (0.0, 0.0),
                (L, 0.0),
                (L, W),
                (0.0, W)
            ]

    @staticmethod
    def _intersect_horizontal_line(poly: List[Tuple[float, float]], y: float) -> Tuple[float, float]:
        """Calculates min and max x intercepts where horizontal row y crosses the boundary edges."""
        x_intercepts: List[float] = []
        n = len(poly)
        for i in range(n):
            p1 = poly[i]
            p2 = poly[(i + 1) % n]
            x1, y1 = p1
            x2, y2 = p2
            if (y1 <= y <= y2) or (y2 <= y <= y1):
                if abs(y2 - y1) > 1e-6:
                    t = (y - y1) / (y2 - y1)
                    x_intercepts.append(x1 + t * (x2 - x1))
                elif abs(y - y1) < 1e-6:
                    x_intercepts.extend([x1, x2])
        if len(x_intercepts) >= 2:
            return min(x_intercepts), max(x_intercepts)
        return 0.0, 0.0

    @staticmethod
    def generate_layout(req: LayoutGenerateRequest) -> PlantingLayoutData:
        """
        Generates layout rows, dimension table, and SVG markup.
        Guarantees that no row exceeds field boundary.
        """
        L = float(req.field_length_m)
        W = float(req.field_breadth_m)
        shape_type = req.shape_type or "Regular"

        poly_points = LayoutGenerator._get_shape_polygon(shape_type, L, W)

        # Spacing in meters
        r_spacing_a_m = max(0.2, req.row_spacing_a_cm / 100.0)
        p_spacing_a_m = max(0.1, req.plant_spacing_a_cm / 100.0)
        r_spacing_b_m = max(0.2, req.row_spacing_b_cm / 100.0)
        p_spacing_b_m = max(0.1, req.plant_spacing_b_cm / 100.0)

        # Parse ratio (e.g. 2:1 -> 2 rows Crop A, 1 row Crop B)
        parts = req.row_ratio.split(":")
        try:
            ratio_a = max(1, int(parts[0]))
            ratio_b = max(1, int(parts[1])) if len(parts) > 1 else 1
        except Exception:
            ratio_a, ratio_b = 2, 1

        pattern: List[str] = (["A"] * ratio_a) + (["B"] * ratio_b)
        pattern_len = len(pattern)

        # Headland margin for tractor turning / walking near bund
        headland_margin_m = min(1.0, max(0.5, L * 0.02))

        rows: List[LayoutRowItem] = []
        warnings: List[str] = []

        current_y_m = 0.5  # initial edge margin from top boundary
        row_idx = 1
        pattern_idx = 0
        border_count = 0
        pathway_count = 0

        # Optional 1st border row
        if req.include_border:
            border_spacing = min(r_spacing_a_m, r_spacing_b_m)
            if current_y_m + border_spacing <= W:
                x_min, x_max = LayoutGenerator._intersect_horizontal_line(poly_points, current_y_m)
                x_start = x_min + headland_margin_m
                x_end = x_max - headland_margin_m
                cut_length = max(1.0, x_end - x_start)
                plants = int(math.floor(cut_length / p_spacing_a_m))

                rows.append(LayoutRowItem(
                    row_number=row_idx,
                    crop_name=f"{req.crop_a_name} (Border)",
                    variety_name="Border Row",
                    crop_key="BORDER",
                    color=COLOR_BORDER,
                    y_offset_m=round(current_y_m, 2),
                    width_m=border_spacing,
                    length_m=round(cut_length, 2),
                    plants_in_row=plants,
                    plant_spacing_m=p_spacing_a_m,
                    start_x_m=round(x_start, 2),
                    end_x_m=round(x_end, 2)
                ))
                current_y_m += border_spacing
                row_idx += 1
                border_count += 1

        # Intercrop rows allocation
        crop_row_counter = 0
        while True:
            # Check if pathway needed
            if crop_row_counter > 0 and (crop_row_counter % req.pathway_frequency_rows == 0):
                if current_y_m + req.pathway_width_m <= W:
                    x_min, x_max = LayoutGenerator._intersect_horizontal_line(poly_points, current_y_m)
                    x_start = x_min
                    x_end = x_max
                    cut_length = max(1.0, x_end - x_start)

                    rows.append(LayoutRowItem(
                        row_number=row_idx,
                        crop_name="Access Pathway",
                        variety_name="Inspection / Spraying Track",
                        crop_key="PATHWAY",
                        color=COLOR_PATHWAY,
                        y_offset_m=round(current_y_m, 2),
                        width_m=req.pathway_width_m,
                        length_m=round(cut_length, 2),
                        plants_in_row=0,
                        plant_spacing_m=0.0,
                        start_x_m=round(x_start, 2),
                        end_x_m=round(x_end, 2)
                    ))
                    current_y_m += req.pathway_width_m
                    row_idx += 1
                    pathway_count += 1
                else:
                    break  # Boundary reached

            # Determine crop in pattern
            crop_key = pattern[pattern_idx % pattern_len]
            if crop_key == "A":
                c_name = req.crop_a_name
                v_name = req.variety_a_name
                c_color = COLOR_CROP_A
                spacing_r = r_spacing_a_m
                spacing_p = p_spacing_a_m
            else:
                c_name = req.crop_b_name
                v_name = req.variety_b_name
                c_color = COLOR_CROP_B
                spacing_r = r_spacing_b_m
                spacing_p = p_spacing_b_m

            # Strict boundary check: DO NOT EXCEED W
            if current_y_m + spacing_r > (W - 0.2):
                break

            # Calculate real intersection of horizontal row against field boundary polygon
            x_min, x_max = LayoutGenerator._intersect_horizontal_line(poly_points, current_y_m)
            x_start = x_min + headland_margin_m
            x_end = x_max - headland_margin_m
            cut_length = max(0.5, x_end - x_start)

            if cut_length >= 2.0:  # Only plant if enough room to sow
                plants = int(math.floor(cut_length / spacing_p))
                rows.append(LayoutRowItem(
                    row_number=row_idx,
                    crop_name=c_name,
                    variety_name=v_name,
                    crop_key=crop_key,
                    color=c_color,
                    y_offset_m=round(current_y_m, 2),
                    width_m=spacing_r,
                    length_m=round(cut_length, 2),
                    plants_in_row=plants,
                    plant_spacing_m=spacing_p,
                    start_x_m=round(x_start, 2),
                    end_x_m=round(x_end, 2)
                ))
                row_idx += 1
                pattern_idx += 1
                crop_row_counter += 1

            current_y_m += spacing_r

        # Calculate Dimension Table stats
        rows_a = [r for r in rows if r.crop_key == "A"]
        rows_b = [r for r in rows if r.crop_key == "B"]
        rows_border = [r for r in rows if r.crop_key == "BORDER"]

        total_plant_rows = len(rows_a) + len(rows_b) + len(rows_border)
        total_plants_a = sum(r.plants_in_row for r in rows_a)
        total_plants_b = sum(r.plants_in_row for r in rows_b)
        total_plants_border = sum(r.plants_in_row for r in rows_border)

        plants_per_row_a = int(round(total_plants_a / max(len(rows_a), 1))) if rows_a else 0
        plants_per_row_b = int(round(total_plants_b / max(len(rows_b), 1))) if rows_b else 0

        area_pct_a = round(((len(rows_a) + len(rows_border)) / max(total_plant_rows, 1)) * 100, 1)
        area_pct_b = round((len(rows_b) / max(total_plant_rows, 1)) * 100, 1)

        dim_table: List[DimensionTableEntry] = [
            DimensionTableEntry(
                crop_name=f"{req.crop_a_name} ({req.variety_a_name})",
                crop_key="A",
                color=COLOR_CROP_A,
                total_rows=len(rows_a) + len(rows_border),
                plants_per_row=plants_per_row_a,
                total_plants=total_plants_a + total_plants_border,
                row_spacing_m=r_spacing_a_m,
                plant_spacing_m=p_spacing_a_m,
                percentage_area=area_pct_a
            ),
            DimensionTableEntry(
                crop_name=f"{req.crop_b_name} ({req.variety_b_name})",
                crop_key="B",
                color=COLOR_CROP_B,
                total_rows=len(rows_b),
                plants_per_row=plants_per_row_b,
                total_plants=total_plants_b,
                row_spacing_m=r_spacing_b_m,
                plant_spacing_m=p_spacing_b_m,
                percentage_area=area_pct_b
            )
        ]

        planted_rows = [r for r in rows if r.crop_key in ("A", "B", "BORDER")]
        min_len = min((r.length_m for r in planted_rows), default=round(L - 2 * headland_margin_m, 1))
        max_len = max((r.length_m for r in planted_rows), default=round(L - 2 * headland_margin_m, 1))

        # Generate SVG string
        svg_content, viewbox, scale_factor = LayoutGenerator._render_svg(
            L=L,
            W=W,
            poly_points=poly_points,
            rows=rows,
            req=req,
            shape_type=shape_type
        )

        legend = [
            {"label": f"{req.crop_a_name} ({req.variety_a_name})", "color": COLOR_CROP_A, "type": "Primary Crop (ಮುಖ್ಯ ಬೆಳೆ)"},
            {"label": f"{req.crop_b_name} ({req.variety_b_name})", "color": COLOR_CROP_B, "type": "Intercrop Companion (ಜೋಡಿ ಬೆಳೆ)"},
            {"label": "Farm Bund / Ridge (ವರಂಬು / ಬದು)", "color": COLOR_BUND, "type": "Boundary Protection"},
            {"label": "Sprayer Track (ತಿರುಗಾಡುವ ಹಾದಿ)", "color": COLOR_PATHWAY, "type": "Access Alley"}
        ]

        return PlantingLayoutData(
            field_length_m=round(L, 1),
            field_breadth_m=round(W, 1),
            scale_factor=scale_factor,
            svg_viewbox=viewbox,
            svg_content=svg_content,
            total_rows=len(rows),
            rows=rows,
            dimension_table=dim_table,
            border_rows_count=border_count,
            pathways_count=pathway_count,
            pathway_width_m=req.pathway_width_m,
            legend=legend,
            orientation=req.orientation,
            warnings=warnings,
            shape_type=shape_type,
            polygon_points=[[round(p[0], 2), round(p[1], 2)] for p in poly_points],
            min_row_length_m=round(min_len, 1),
            max_row_length_m=round(max_len, 1)
        )

    @staticmethod
    def _render_svg(
        L: float,
        W: float,
        poly_points: List[Tuple[float, float]],
        rows: List[LayoutRowItem],
        req: LayoutGenerateRequest,
        shape_type: str
    ) -> Tuple[str, str, float]:
        """Renders farmer-friendly SVG markup conforming strictly to arbitrary field polygon."""
        margin_x = 70
        margin_y = 65
        target_width = 860
        scale = (target_width - (2 * margin_x)) / max(L, 1.0)
        svg_w = target_width
        svg_h = int((W * scale) + (2 * margin_y))

        viewbox = f"0 0 {svg_w} {svg_h}"

        # Function to map meter (x, y) to svg pixel coords
        def sx(x_m: float) -> float:
            return margin_x + (x_m * scale)

        def sy(y_m: float) -> float:
            return margin_y + (y_m * scale)

        # Polygon points string for SVG
        poly_svg_str = " ".join(f"{sx(p[0]):.1f},{sy(p[1]):.1f}" for p in poly_points)

        lines: List[str] = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" width="100%" height="auto" class="krishimix-layout-svg rounded-2xl border border-stone-300 shadow-md bg-[#faf8f5]">'
        ]

        # Definitions: Dynamic clip path for boundary polygon & glyphs
        lines.append(f"""
        <defs>
          <!-- Dynamic SVG Field Boundary Clip -->
          <clipPath id="field-boundary-clip">
            <polygon points="{poly_svg_str}" />
          </clipPath>

          <!-- Drop Shadow for Bund -->
          <filter id="bundShadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#451a03" flood-opacity="0.35" />
          </filter>

          <!-- Leaf glyph for Primary Cereal (Crop A) -->
          <g id="cropLeafGlyph">
            <path d="M 0,0 C -3,-5 0,-8 3,-4 C 5,-1 3,2 0,0 Z" fill="#22c55e" stroke="#15803d" stroke-width="0.5" />
          </g>

          <!-- Blossom glyph for Secondary Legume (Crop B) -->
          <g id="cropBlossomGlyph">
            <circle cx="0" cy="0" r="2.2" fill="#fde047" stroke="#ca8a04" stroke-width="0.5" />
            <circle cx="0" cy="0" r="0.9" fill="#ea580c" />
          </g>
        </defs>
        """)

        # GROUP CLIPPED TO ACTUAL FIELD BOUNDARY POLYGON
        lines.append('  <g clip-path="url(#field-boundary-clip)">')

        # 1. Warm agricultural plowed soil background
        field_w_px = L * scale
        field_h_px = W * scale
        lines.append(f'    <polygon points="{poly_svg_str}" fill="{COLOR_SOIL}" />')

        # 2. Subtle plowed furrows texture overlay (parallel soil lines)
        furrow_step_px = max(6.0, scale * 0.4)
        num_furrows = int(field_h_px / furrow_step_px) + 2
        for f_idx in range(num_furrows):
            fy = margin_y + (f_idx * furrow_step_px)
            lines.append(f'    <line x1="{margin_x - 10}" y1="{fy:.1f}" x2="{margin_x + field_w_px + 10}" y2="{fy:.1f}" stroke="#5c330a" stroke-width="1.2" opacity="0.45" />')

        # 3. Planting Rows and Pathways strictly inside clipped polygon
        for row in rows:
            ry = sy(row.y_offset_m)
            rx_start = sx(row.start_x_m)
            rx_end = sx(row.end_x_m)
            row_len_px = rx_end - rx_start

            if row.crop_key == "PATHWAY":
                # Earthen spraying track / walking path
                ph = max(4.0, row.width_m * scale * 0.7)
                lines.append(f'    <rect x="{rx_start}" y="{ry - (ph / 2):.1f}" width="{row_len_px:.1f}" height="{ph:.1f}" fill="{row.color}" opacity="0.65" rx="2" />')
                lines.append(f'    <line x1="{rx_start}" y1="{ry:.1f}" x2="{rx_end}" y2="{ry:.1f}" stroke="#d97706" stroke-dasharray="5,4" stroke-width="1.2" />')
                lines.append(f'    <text x="{(rx_start + rx_end) / 2:.1f}" y="{ry + 3.5:.1f}" font-size="10" font-family="sans-serif" font-weight="700" fill="#78350f" text-anchor="middle">🚶 ಹಾದಿ / Sprayer Track ({req.pathway_width_m}m)</text>')

            elif row.crop_key == "BORDER":
                # Outer perimeter trap / border row
                lines.append(f'    <line x1="{rx_start:.1f}" y1="{ry:.1f}" x2="{rx_end:.1f}" y2="{ry:.1f}" stroke="{row.color}" stroke-width="4" stroke-linecap="round" />')
                step = max(24.0, row_len_px / 14.0)
                n_dots = int(row_len_px / step)
                for d in range(n_dots + 1):
                    lines.append(f'    <circle cx="{rx_start + (d * step):.1f}" cy="{ry:.1f}" r="2" fill="#bbf7d0" />')

            elif row.crop_key == "A":
                # Primary Cereal: bold solid green line dotted with leaf glyphs
                lines.append(f'    <line x1="{rx_start:.1f}" y1="{ry:.1f}" x2="{rx_end:.1f}" y2="{ry:.1f}" stroke="{COLOR_CROP_A}" stroke-width="4.2" stroke-linecap="round" />')
                step = max(26.0, row_len_px / 15.0)
                n_leaves = int(row_len_px / step)
                for d in range(1, n_leaves):
                    gx = rx_start + (d * step)
                    lines.append(f'    <use href="#cropLeafGlyph" x="{gx:.1f}" y="{ry:.1f}" />')

            else:
                # Secondary Legume: amber-gold segmented dashes with blossom dots
                lines.append(f'    <line x1="{rx_start:.1f}" y1="{ry:.1f}" x2="{rx_end:.1f}" y2="{ry:.1f}" stroke="{COLOR_CROP_B}" stroke-width="3.6" stroke-dasharray="9,6" stroke-linecap="round" />')
                step = max(30.0, row_len_px / 12.0)
                n_blossoms = int(row_len_px / step)
                for d in range(1, n_blossoms):
                    bx = rx_start + (d * step)
                    lines.append(f'    <use href="#cropBlossomGlyph" x="{bx:.1f}" y="{ry:.1f}" />')

        lines.append('  </g>')  # END OF CLIPPED FIELD GROUP

        # 4. Outer Physical Bund (ವರಂಬು / ಬದು) - Multi-layer Earthen Ridge
        lines.append(f'    <polygon points="{poly_svg_str}" fill="none" stroke="{COLOR_BUND}" stroke-width="7" stroke-linejoin="round" filter="url(#bundShadow)" />')
        lines.append(f'    <polygon points="{poly_svg_str}" fill="none" stroke="#d97706" stroke-width="2.5" stroke-dasharray="8,6" />')

        # Boundary survey stones at polygon corners (ಹದ್ದುಬಸ್ತು ಕಲ್ಲು)
        for idx, pt in enumerate(poly_points):
            cx = sx(pt[0])
            cy = sy(pt[1])
            lines.append(f'    <rect x="{cx - 4.5:.1f}" y="{cy - 4.5:.1f}" width="9" height="9" fill="#ffffff" stroke="#1e293b" stroke-width="1.5" rx="1.5" />')
            lines.append(f'    <circle cx="{cx:.1f}" cy="{cy:.1f}" r="1.5" fill="#dc2626" />')

        # Outer bund label badge
        p_first = poly_points[0]
        p_sec = poly_points[1] if len(poly_points) > 1 else (L, 0)
        bund_label_x = sx((p_first[0] + p_sec[0]) / 2.0)
        bund_label_y = sy((p_first[1] + p_sec[1]) / 2.0) - 8
        lines.append(f'    <text x="{bund_label_x:.1f}" y="{bund_label_y:.1f}" font-size="10" font-family="sans-serif" font-weight="700" fill="#78350f" text-anchor="middle">ವರಂಬು / ಬದು (Farm Bund) 📍</text>')

        # 5. Farmer-Centric Measurement Brackets (no scientific Cartesian ticks)
        # Top bracket: Field Length
        bracket_y = margin_y - 20
        lines.append(f'  <path d="M {margin_x} {bracket_y + 6} L {margin_x} {bracket_y} L {margin_x + field_w_px} {bracket_y} L {margin_x + field_w_px} {bracket_y + 6}" fill="none" stroke="#451a03" stroke-width="2" />')
        lines.append(f'  <text x="{margin_x + (field_w_px / 2):.1f}" y="{bracket_y - 6:.1f}" font-size="12" font-family="sans-serif" font-weight="800" fill="#451a03" text-anchor="middle">ಉದ್ದ: {L:.1f} ಮೀ (Length: {L:.1f}m) • {req.orientation}</text>')

        # Right bracket: Field Breadth
        bracket_x = margin_x + field_w_px + 20
        lines.append(f'  <path d="M {bracket_x - 6} {margin_y} L {bracket_x} {margin_y} L {bracket_x} {margin_y + field_h_px} L {bracket_x - 6} {margin_y + field_h_px}" fill="none" stroke="#451a03" stroke-width="2" />')
        lines.append(f'  <text x="{bracket_x + 16:.1f}" y="{margin_y + (field_h_px / 2):.1f}" font-size="12" font-family="sans-serif" font-weight="800" fill="#451a03" text-anchor="middle" transform="rotate(90, {bracket_x + 16:.1f}, {margin_y + (field_h_px / 2):.1f})">ಅಗಲ: {W:.1f} ಮೀ (Breadth: {W:.1f}m)</text>')

        # 6. Rural Compass Indicator (Top-Right)
        comp_cx = margin_x + field_w_px - 26
        comp_cy = margin_y + 26
        lines.append(f'  <circle cx="{comp_cx}" cy="{comp_cy}" r="17" fill="#ffffff" stroke="#15803d" stroke-width="1.8" opacity="0.95" />')
        lines.append(f'  <polygon points="{comp_cx},{comp_cy - 12} {comp_cx - 4.5},{comp_cy + 8} {comp_cx},{comp_cy + 3} {comp_cx + 4.5},{comp_cy + 8}" fill="#15803d" />')
        lines.append(f'  <text x="{comp_cx}" y="{comp_cy - 14}" font-size="9" font-family="sans-serif" font-weight="bold" fill="#15803d" text-anchor="middle">ಉತ್ತರ (N)</text>')

        # Close SVG
        lines.append('</svg>')
        return "\n".join(lines), viewbox, round(scale, 2)

layout_generator = LayoutGenerator()
