from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.models.agronomy import Crop, Variety

class CropRepository:
    @staticmethod
    def get_all_crops(db: Session) -> List[Crop]:
        return db.query(Crop).options(joinedload(Crop.varieties)).order_by(Crop.name).all()

    @staticmethod
    def get_crop_by_id(db: Session, crop_id: int) -> Optional[Crop]:
        return db.query(Crop).options(joinedload(Crop.varieties)).filter(Crop.id == crop_id).first()

    @staticmethod
    def get_variety_by_id(db: Session, variety_id: int) -> Optional[Variety]:
        return db.query(Variety).filter(Variety.id == variety_id).first()

    @staticmethod
    def get_varieties_for_crop(db: Session, crop_id: int) -> List[Variety]:
        return db.query(Variety).filter(Variety.crop_id == crop_id).all()

crop_repository = CropRepository()
