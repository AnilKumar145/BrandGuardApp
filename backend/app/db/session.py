import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..core.config import settings

db_url = settings.DATABASE_URL

# Handle Supabase / Heroku postgres:// -> postgresql://
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

try:
    if "sqlite" in db_url:
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(db_url, pool_pre_ping=True, pool_size=10, max_overflow=20)
except Exception:
    # Graceful local SQLite fallback
    fallback_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../brandguard.db"))
    db_url = f"sqlite:///{fallback_path}"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
