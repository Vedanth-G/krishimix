"""
Deterministic To-Scale SVG Layout Generator for Intercropped Fields.

Spacing Maths:
--------------
Let:
  - L = Field Length (meters, parallel to crop rows)
  - W = Field Breadth (meters, perpendicular to rows)
  - r_spacing_A = Inter-row spacing for Crop A (m)
  - r_spacing_B = Inter-row spacing for Crop B (m)
  - p_spacing_A = Intra-row plant-to-plant spacing for Crop A (m)
  - p_spacing_B = Intra-row plant-to-plant spacing for Crop B (m)
  - B_count = Number of border rows (outer perimeter buffer)
  - P_width = Pathway width (m) inserted every P_freq rows for operational transit

Row Allocation:
  - Rows are laid sequentially along the breadth dimension W.
  - At each step, row_y is incremented by row_spacing.
  - Pathway is inserted when (row_counter % P_freq == 0).
  - Invariant: row_y + row_spacing <= W ensures no row ever exceeds physical field boundaries.
  - Plants per row = floor((L - 2 * headland_margin) / plant_spacing)
"""

from typing import List, Dict, Any, Tuple
import math
from app.schemas.layout import (
    PlantingLayoutData,
    LayoutRowItem,
    DimensionTableEntry,
    LayoutGenerateRequest
)

COLOR_CROP_A = "#15803d"      # Green 700 (Tall / Main Cereal)
COLOR_CROP_B = "#d97706"      # Amber 600 (Pulse / Legume)
COLOR_BORDER = "#166534"      # Deep Forest Green (Trap crop / border)
COLOR_PATHWAY = "#e2e8f0"     # Slate 200 (Pathway)
COLOR_FIELD_BG = "#fefce8"    # Soft fertile soil tint / ivory

class LayoutGenerator:
    """Generates precise, deterministic SVG planting layouts with boundary validation."""

    @staticmethod
    def generate_layout(req: LayoutGenerateRequest) -> PlantingLayoutData:
        """
        Generates layout rows, dimension table, and SVG markup.
        Guarantees that no row exceeds field boundary.
        """
        L = float(req.field_length_m)
        W = float(req.field_breadth_m)

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

        # Margin/headland for tractor turning or walking at row ends
        headland_margin_m = min(1.0, L * 0.02)
        effective_row_length_m = max(1.0, L - (2 * headland_margin_m))

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
                plants = int(math.floor(effective_row_length_m / p_spacing_a_m))
                rows.append(LayoutRowItem(
                    row_number=row_idx,
                    crop_name=f"{req.crop_a_name} (Border)",
                    variety_name="Border Row",
                    crop_key="BORDER",
                    color=COLOR_BORDER,
                    y_offset_m=round(current_y_m, 2),
                    width_m=border_spacing,
                    length_m=round(effective_row_length_m, 2),
                    plants_in_row=plants,
                    plant_spacing_m=p_spacing_a_m
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
                    rows.append(LayoutRowItem(
                        row_number=row_idx,
                        crop_name="Access Pathway",
                        variety_name="Inspection / Spraying Track",
                        crop_key="PATHWAY",
                        color=COLOR_PATHWAY,
                        y_offset_m=round(current_y_m, 2),
                        width_m=req.pathway_width_m,
                        length_m=round(effective_row_length_m, 2),
                        plants_in_row=0,
                        plant_spacing_m=0.0
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
            if current_y_m + spacing_r > (W - 0.3):
                # Cannot fit another full row safely inside field boundary
                break

            plants = int(math.floor(effective_row_length_m / spacing_p))
            rows.append(LayoutRowItem(
                row_number=row_idx,
                crop_name=c_name,
                variety_name=v_name,
                crop_key=crop_key,
                color=c_color,
                y_offset_m=round(current_y_m, 2),
                width_m=spacing_r,
                length_m=round(effective_row_length_m, 2),
                plants_in_row=plants,
                plant_spacing_m=spacing_p
            ))

            current_y_m += spacing_r
            row_idx += 1
            pattern_idx += 1
            crop_row_counter += 1

        # Calculate Dimension Table stats
        rows_a = [r for r in rows if r.crop_key == "A"]
        rows_b = [r for r in rows if r.crop_key == "B"]
        rows_border = [r for r in rows if r.crop_key == "BORDER"]

        total_plant_rows = len(rows_a) + len(rows_b) + len(rows_border)
        total_plants_a = sum(r.plants_in_row for r in rows_a)
        total_plants_b = sum(r.plants_in_row for r in rows_b)
        total_plants_border = sum(r.plants_in_row for r in rows_border)

        plants_per_row_a = rows_a[0].plants_in_row if rows_a else 0
        plants_per_row_b = rows_b[0].plants_in_row if rows_b else 0

        total_area_planted = max(0.1, L * W)
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

        # Generate SVG string
        svg_content, viewbox, scale_factor = LayoutGenerator._render_svg(
            L=L,
            W=W,
            rows=rows,
            req=req,
            headland_margin_m=headland_margin_m,
            effective_length_m=effective_row_length_m
        )

        legend = [
            {"label": f"{req.crop_a_name} ({req.variety_a_name})", "color": COLOR_CROP_A, "type": "Primary Crop"},
            {"label": f"{req.crop_b_name} ({req.variety_b_name})", "color": COLOR_CROP_B, "type": "Intercrop Companion"},
            {"label": "Border / Trap Rows", "color": COLOR_BORDER, "type": "Border Protection"},
            {"label": "Farm Pathway / Sprayer Track", "color": COLOR_PATHWAY, "type": "Access"}
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
            warnings=warnings
        )

    @staticmethod
    def _render_svg(
        L: float,
        W: float,
        rows: List[LayoutRowItem],
        req: LayoutGenerateRequest,
        headland_margin_m: float,
        effective_length_m: float
    ) -> Tuple[str, str, float]:
        """Renders responsive, cleanly dimensioned SVG markup."""
        # Canvas sizing
        margin = 60
        target_width = 860
        scale = (target_width - (2 * margin)) / max(L, 1.0)
        svg_w = target_width
        svg_h = int((W * scale) + (2 * margin))

        viewbox = f"0 0 {svg_w} {svg_h}"

        lines: List[str] = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" width="100%" height="auto" class="krishimix-layout-svg rounded-lg border border-emerald-200 shadow-inner bg-[#fafaf9]">'
        ]

        # Definitions (grid pattern, drop shadow)
        lines.append("""
        <defs>
          <pattern id="soilGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e7e5e4" stroke-width="0.75" />
          </pattern>
          <filter id="rowGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000000" flood-opacity="0.1" />
          </filter>
        </defs>
        """)

        # Field Background
        field_x = margin
        field_y = margin
        field_w = L * scale
        field_h = W * scale

        lines.append(f'<rect x="{field_x}" y="{field_y}" width="{field_w}" height="{field_h}" fill="{COLOR_FIELD_BG}" stroke="#78716c" stroke-width="2" rx="4" />')
        lines.append(f'<rect x="{field_x}" y="{field_y}" width="{field_w}" height="{field_h}" fill="url(#soilGrid)" opacity="0.6" />')

        # Headland / turn margins
        hl_px = headland_margin_m * scale
        lines.append(f'<line x1="{field_x + hl_px}" y1="{field_y}" x2="{field_x + hl_px}" y2="{field_y + field_h}" stroke="#a8a29e" stroke-dasharray="4,4" stroke-width="1" />')
        lines.append(f'<line x1="{field_x + field_w - hl_px}" y1="{field_y}" x2="{field_x + field_w - hl_px}" y2="{field_y + field_h}" stroke="#a8a29e" stroke-dasharray="4,4" stroke-width="1" />')

        # Draw rows
        for row in rows:
            ry = field_y + (row.y_offset_m * scale)
            rx = field_x + hl_px
            rw = effective_length_m * scale
            rh = max(2.0, row.width_m * scale * 0.45)

            if row.crop_key == "PATHWAY":
                lines.append(f'<rect x="{field_x}" y="{ry}" width="{field_w}" height="{rh * 1.5}" fill="{row.color}" stroke="#cbd5e1" stroke-dasharray="3,3" />')
                lines.append(f'<text x="{field_x + (field_w / 2)}" y="{ry + rh}" font-size="10" font-family="sans-serif" font-weight="600" fill="#64748b" text-anchor="middle">🚶 Walkway / Inspection Track ({req.pathway_width_m}m)</text>')
            else:
                # Crop planting row line
                lines.append(f'<rect x="{rx}" y="{ry - (rh / 2)}" width="{rw}" height="{rh}" rx="{rh/2}" fill="{row.color}" opacity="0.85" filter="url(#rowGlow)" />')
                # Plant dots indicator along the row
                dot_step = max(18.0, rw / 18.0)
                num_dots = int(rw / dot_step)
                for d in range(num_dots + 1):
                    dot_x = rx + (d * dot_step)
                    dot_color = "#ffffff" if row.crop_key == "A" else "#fef08a"
                    lines.append(f'<circle cx="{dot_x}" cy="{ry}" r="{max(1.5, rh * 0.28)}" fill="{dot_color}" opacity="0.9" />')

                # Row label badge on the left margin
                if row.row_number % 2 == 1 or row.row_number <= 6:
                    lines.append(f'<text x="{field_x - 8}" y="{ry + 3}" font-size="9" font-family="sans-serif" font-weight="600" fill="#44403c" text-anchor="end">R{row.row_number} ({row.crop_key})</text>')

        # Dimension Annotations: Length & Breadth
        # Top dimension (Length)
        lines.append(f'<line x1="{field_x}" y1="{margin - 20}" x2="{field_x + field_w}" y2="{margin - 20}" stroke="#0f172a" stroke-width="1.5" />')
        lines.append(f'<path d="M {field_x} {margin - 25} L {field_x} {margin - 15} M {field_x + field_w} {margin - 25} L {field_x + field_w} {margin - 15}" stroke="#0f172a" stroke-width="1.5" />')
        lines.append(f'<text x="{field_x + (field_w / 2)}" y="{margin - 28}" font-size="12" font-family="sans-serif" font-weight="bold" fill="#0f172a" text-anchor="middle">↔ Field Length: {L:.1f} m ({req.orientation})</text>')

        # Right dimension (Breadth)
        right_dim_x = field_x + field_w + 20
        lines.append(f'<line x1="{right_dim_x}" y1="{field_y}" x2="{right_dim_x}" y2="{field_y + field_h}" stroke="#0f172a" stroke-width="1.5" />')
        lines.append(f'<path d="M {right_dim_x - 5} {field_y} L {right_dim_x + 5} {field_y} M {right_dim_x - 5} {field_y + field_h} L {right_dim_x + 5} {field_y + field_h}" stroke="#0f172a" stroke-width="1.5" />')
        lines.append(f'<text x="{right_dim_x + 12}" y="{field_y + (field_h / 2)}" font-size="12" font-family="sans-serif" font-weight="bold" fill="#0f172a" transform="rotate(90, {right_dim_x + 12}, {field_y + (field_h / 2)})" text-anchor="middle">↕ Field Breadth: {W:.1f} m</text>')

        # Scale ruler in bottom left
        scale_10m_px = 10.0 * scale
        lines.append(f'<rect x="{margin}" y="{svg_h - 25}" width="{scale_10m_px}" height="5" fill="#0f172a" />')
        lines.append(f'<text x="{margin}" y="{svg_h - 12}" font-size="10" font-family="sans-serif" fill="#0f172a">Scale: 10 meters</text>')

        # Compass Indicator (Top-Right)
        comp_cx = field_x + field_w - 30
        comp_cy = margin + 30
        lines.append(f'<circle cx="{comp_cx}" cy="{comp_cy}" r="18" fill="#ffffff" stroke="#047857" stroke-width="1.5" />')
        lines.append(f'<polygon points="{comp_cx},{comp_cy - 14} {comp_cx - 5},{comp_cy + 10} {comp_cx},{comp_cy + 4} {comp_cx + 5},{comp_cy + 10}" fill="#047857" />')
        lines.append(f'<text x="{comp_cx}" y="{comp_cy - 16}" font-size="10" font-weight="bold" fill="#047857" text-anchor="middle">N</text>')

        lines.append('</svg>')
        return "\n".join(lines), viewbox, round(scale, 2)

layout_generator = LayoutGenerator()
