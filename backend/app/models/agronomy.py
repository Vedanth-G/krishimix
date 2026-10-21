from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    botanical_name = Column(String(150), nullable=True)
    family = Column(String(100), nullable=True)  # e.g., Poaceae (Cereal), Fabaceae (Legume)
    crop_type = Column(String(50), nullable=False)  # Cereal, Pulse, Oilseed, Millet
    canopy_default = Column(String(50), nullable=False)  # Erect, Spreading, Semi-erect, Dense
    root_type_default = Column(String(50), nullable=False)  # Fibrous shallow, Taproot deep, Medium
    market_price_per_kg = Column(Float, default=30.0)  # Reference MSP/market price in INR
    water_req_mm = Column(Float, default=450.0)  # Seasonal water requirement in mm

    varieties = relationship("Variety", back_populates="crop", cascade="all, delete-orphan")


class Variety(Base):
    __tablename__ = "varieties"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    name = Column(String(120), nullable=False, index=True)
    code = Column(String(60), nullable=True)
    maturity_days = Column(Integer, nullable=False)  # e.g. 90, 120, 160
    height_cm = Column(Float, nullable=False)        # e.g. 180 cm for maize, 45 cm for groundnut
    canopy_type = Column(String(50), nullable=False) # Erect, Spreading, Semi-spreading, Bushy
    root_depth = Column(String(50), nullable=False)  # Shallow (0-30cm), Medium (30-60cm), Deep (60-150cm)
    water_need = Column(String(50), nullable=False)  # Low, Medium, High
    soil_ph_min = Column(Float, default=5.5)
    soil_ph_max = Column(Float, default=8.0)
    suitable_agroclimatic_zones = Column(String(255), default="Semi-Arid, Tropical, Sub-Tropical")
    recommended_spacing_cm = Column(String(50), default="45x15")  # row x plant
    solo_yield_kg_per_ha = Column(Float, default=2500.0)  # Monoculture baseline yield
    description = Column(Text, nullable=True)

    crop = relationship("Crop", back_populates="varieties")


class TrialRecord(Base):
    __tablename__ = "trial_records"

    id = Column(Integer, primary_key=True, index=True)
    crop_a_name = Column(String(100), nullable=False, index=True)
    variety_a_name = Column(String(120), nullable=False, index=True)
    crop_b_name = Column(String(100), nullable=False, index=True)
    variety_b_name = Column(String(120), nullable=False, index=True)
    row_ratio = Column(String(20), nullable=False)  # e.g. "2:1", "1:1", "4:2", "3:1"
    spacing_cm = Column(String(50), nullable=False)  # e.g. "45x15 / 90x20"
    yield_a_kg_ha = Column(Float, nullable=False)
    yield_b_kg_ha = Column(Float, nullable=False)
    solo_yield_a_kg_ha = Column(Float, nullable=False)
    solo_yield_b_kg_ha = Column(Float, nullable=False)
    ler = Column(Float, nullable=False)  # (yield_a / solo_a) + (yield_b / solo_b)
    season = Column(String(50), nullable=False)  # Kharif, Rabi, Summer
    location = Column(String(120), nullable=False)  # e.g. "Dharwad, Karnataka", "Hyderabad, Telangana"
    source = Column(String(255), nullable=False)  # e.g. "SAMPLE: UAS Dharwad AICRP Trial (2021)"
    institution = Column(String(150), default="ICAR / State Agricultural University")
    year = Column(Integer, nullable=False)
    soil_type = Column(String(80), nullable=False)  # Black Clay, Red Sandy Loam, Alluvial
    rainfall_mm = Column(Float, default=650.0)
    is_sample_data = Column(Integer, default=1)  # 1 for SAMPLE data notice


class SavedPlan(Base):
    __tablename__ = "saved_plans"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    farmer_name = Column(String(100), default="Farmer")
    land_area_acres = Column(Float, nullable=False)
    field_length_m = Column(Float, nullable=False)
    field_breadth_m = Column(Float, nullable=False)
    soil_type = Column(String(80), nullable=False)
    irrigation_source = Column(String(80), nullable=False)
    season = Column(String(50), nullable=False)
    crop_a_id = Column(Integer, nullable=False)
    variety_a_id = Column(Integer, nullable=False)
    crop_b_id = Column(Integer, nullable=False)
    variety_b_id = Column(Integer, nullable=False)
    row_ratio = Column(String(20), nullable=False)
    evidence_level = Column(String(50), nullable=False)  # OBSERVED, MODEL-PREDICTED, UNSUPPORTED
    plan_data = Column(JSON, nullable=False)  # Complete layout, LER, yields, economics, resources
    created_at = Column(DateTime, default=datetime.utcnow)
