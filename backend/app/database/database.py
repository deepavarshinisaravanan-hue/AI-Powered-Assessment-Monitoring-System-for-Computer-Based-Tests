import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError
from app.core.config import settings

logger = logging.getLogger(__name__)

def ensure_database_exists():
    """Checks if the target PostgreSQL database exists; creates it if missing."""
    server_url = settings.get_server_url()
    target_db = settings.DB_NAME
    
    try:
        # Connect to default 'postgres' database
        temp_engine = create_engine(server_url, isolation_level="AUTOCOMMIT")
        with temp_engine.connect() as conn:
            result = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :dbname"),
                {"dbname": target_db}
            )
            exists = result.scalar()
            if not exists:
                logger.info(f"Database '{target_db}' does not exist. Creating...")
                conn.execute(text(f'CREATE DATABASE "{target_db}"'))
                logger.info(f"Database '{target_db}' created successfully.")
        temp_engine.dispose()
    except Exception as e:
        logger.warning(f"Could not check/create database automatically: {e}")

# Ensure database exists before building main engine connection
ensure_database_exists()

DATABASE_URL = settings.get_database_url()

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency yielding a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> dict:
    """Utility to test database connectivity."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            return {
                "status": "connected",
                "database": settings.DB_NAME,
                "host": settings.DB_HOST,
                "port": settings.DB_PORT,
                "query_test": result
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "database": settings.DB_NAME,
            "host": settings.DB_HOST
        }
