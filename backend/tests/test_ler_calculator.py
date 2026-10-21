import pytest
from app.services.ler_calculator import ler_calculator

def test_ler_calculation_advantage():
    """Test standard LER formula with yield synergy."""
    # Maize: 3850 kg/ha in intercrop vs 4400 kg/ha sole -> 0.875
    # Pigeonpea: 720 kg/ha in intercrop vs 1100 kg/ha sole -> 0.655
    # Total LER = 0.875 + 0.655 = 1.53
    ler, p_a, p_b = ler_calculator.calculate_ler(3850, 4400, 720, 1100)
    assert ler == pytest.approx(1.53, rel=1e-2)
    assert p_a == pytest.approx(0.875, rel=1e-2)
    assert p_b == pytest.approx(0.655, rel=1e-2)

def test_ler_zero_division():
    """Verify zero division exception when sole yield is zero or negative."""
    with pytest.raises(ValueError):
        ler_calculator.calculate_ler(100, 0, 50, 200)

def test_economics_calculation():
    """Verify economic profit and BCR calculations."""
    res = ler_calculator.calculate_economics(
        yield_a=1500, price_a=25.0,
        yield_b=400, price_b=70.0,
        input_costs=25000.0
    )
    # Gross = (1500 * 25) + (400 * 70) = 37500 + 28000 = 65500
    assert res["gross_revenue_inr"] == 65500.0
    assert res["net_profit_inr"] == 40500.0
    assert res["bcr"] == pytest.approx(2.62, rel=1e-2)
