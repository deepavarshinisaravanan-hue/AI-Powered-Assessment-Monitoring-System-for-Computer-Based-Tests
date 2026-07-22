import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Assessment Monitoring System"
    
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_NAME: str = "cbt_monitoring_db"
    DATABASE_URL: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def _normalize_driver(self, url: str) -> str:
        """Ensure driver prefix compatible with installed DB driver (psycopg 3 / psycopg2)."""
        if url.startswith("postgresql://"):
            try:
                import psycopg
                return url.replace("postgresql://", "postgresql+psycopg://", 1)
            except ImportError:
                pass
        return url

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self._normalize_driver(self.DATABASE_URL)
        raw_url = f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        return self._normalize_driver(raw_url)

    def get_server_url(self) -> str:
        """Connection string to default postgres database (used for db creation check)."""
        raw_url = f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/postgres"
        return self._normalize_driver(raw_url)


settings = Settings()
