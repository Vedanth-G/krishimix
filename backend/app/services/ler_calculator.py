"""
Land Equivalent Ratio (LER) & Economic Yield Calculator for Intercropping Systems.

Agronomic Formulas:
-------------------
1. Land Equivalent Ratio (LER):
    LER = (Y_A_inter / Y_A_sole) + (Y_B_inter / Y_B_sole)
    Where:
      Y_A_inter = Yield of Crop A when intercropped (kg/ha or kg/acre)
      Y_A_sole  = Yield of Crop A in monoculture / sole cropping (kg/ha or kg/acre)
      Y_B_inter = Yield of Crop B when intercropped (kg/ha or kg/acre)
      Y_B_sole  = Yield of Crop B in monoculture / sole cropping (kg/ha or kg/acre)

    Agronomic Interpretation:
      - LER > 1.0: Intercropping advantage (biological yield synergy or niche differentiation).
                   e.g., LER = 1.32 means 32% more sole-cropped land is required to yield the same total harvest.
      - LER = 1.0: Neutral, no net biological or land-use gain.
      - LER < 1.0: Inter-species competition or allelopathy (yield disadvantage).

2. Partial LER:
    pLER_A = Y_A_inter / Y_A_sole
    pLER_B = Y_B_inter / Y_B_sole

3. Gross Economic Return:
    Gross Income = (Y_A_inter * Price_A) + (Y_B_inter * Price_B)

4. Benefit-Cost Ratio (BCR):
    BCR = Gross Revenue / Total Input Costs
"""

from typing import Tuple, Dict, Any

class LERCalculator:
    """Computes agronomic Land Equivalent Ratios and derived financial metrics."""

    @staticmethod
    def calculate_ler(
        yield_a_inter: float,
        solo_yield_a: float,
        yield_b_inter: float,
        solo_yield_b: float
    ) -> Tuple[float, float, float]:
        """
        Calculates total and partial Land Equivalent Ratios.

        Formula:
            pLER_a = yield_a_inter / solo_yield_a
            pLER_b = yield_b_inter / solo_yield_b
            LER = pLER_a + pLER_b

        Args:
            yield_a_inter: Yield of crop A achieved in intercrop (kg/acre or kg/ha).
            solo_yield_a: Reference monoculture yield of crop A.
            yield_b_inter: Yield of crop B achieved in intercrop.
            solo_yield_b: Reference monoculture yield of crop B.

        Returns:
            Tuple of (total_ler, partial_ler_a, partial_ler_b).
        """
        if solo_yield_a <= 0 or solo_yield_b <= 0:
            raise ValueError("Sole crop reference yields must be positive non-zero numbers.")

        pler_a = yield_a_inter / solo_yield_a
        pler_b = yield_b_inter / solo_yield_b
        total_ler = pler_a + pler_b

        return round(total_ler, 3), round(pler_a, 3), round(pler_b, 3)

    @staticmethod
    def estimate_intercrop_yields(
        solo_yield_a: float,
        solo_yield_b: float,
        row_ratio: str,
        synergy_factor: float = 1.0
    ) -> Tuple[float, float]:
        """
        Estimates intercrop yields per unit area given the planting row ratio.

        Row Ratio maths:
          - "2:1" -> 2 parts crop A (66.7% area), 1 part crop B (33.3% area)
          - "1:1" -> 50% crop A, 50% crop B
          - "3:1" -> 75% crop A, 25% crop B
          - "4:2" -> 66.7% crop A, 33.3% crop B

        Yield modeling with spatial proportion and legume/canopy synergy:
          yield_a = solo_yield_a * prop_a * (1.0 + (synergy_factor - 1.0) * 0.4)
          yield_b = solo_yield_b * prop_b * (1.0 + (synergy_factor - 1.0) * 0.8)
        """
        parts = row_ratio.split(":")
        try:
            r_a = float(parts[0])
            r_b = float(parts[1]) if len(parts) > 1 else 1.0
        except (ValueError, IndexError):
            r_a, r_b = 2.0, 1.0

        total_r = r_a + r_b
        prop_a = r_a / total_r
        prop_b = r_b / total_r

        # Synergy uplift: spatial efficiency, niche separation, rhizobia contribution
        yield_a = solo_yield_a * prop_a * (1.0 + (synergy_factor - 1.0) * 0.4)
        yield_b = solo_yield_b * prop_b * (1.0 + (synergy_factor - 1.0) * 0.75)

        return round(yield_a, 1), round(yield_b, 1)

    @staticmethod
    def calculate_economics(
        yield_a: float,
        price_a: float,
        yield_b: float,
        price_b: float,
        input_costs: float
    ) -> Dict[str, float]:
        """Calculates gross revenue, net profit, and benefit-cost ratio."""
        gross_rev = (yield_a * price_a) + (yield_b * price_b)
        net_profit = gross_rev - input_costs
        bcr = round(gross_rev / max(input_costs, 1.0), 2)
        return {
            "gross_revenue_inr": round(gross_rev, 2),
            "total_costs_inr": round(input_costs, 2),
            "net_profit_inr": round(net_profit, 2),
            "bcr": bcr
        }

ler_calculator = LERCalculator()
