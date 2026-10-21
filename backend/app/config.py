from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from pathlib import Path

class Settings(BaseSettings):
    PROJECT_NAME: str = "KrishiMix"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./krishimix.db"
    BASE_DIR: Path = Path(__file__).resolve().parent
    DATA_DIR: Path = Path(__file__).resolve().parent / "data"
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "*"
    ]
    RATE_LIMIT_PER_MINUTE: int = 120

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
