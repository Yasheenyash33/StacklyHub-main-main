from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import urllib.parse

# Load environment variables from .env file in backend directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend', '.env'))

# Database URL format:
# mysql+pymysql://<username>:<password>@<host>:<port>/<database_name>

# Root credentials for database creation
ROOT_USER = 'root'
ROOT_PASSWORD = ''

DB_USER = 'training_user'
DB_PASSWORD = ''  # No password
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'training_app')

# Create database if it doesn't exist using root credentials
temp_db_url = f"mysql+pymysql://{ROOT_USER}:{ROOT_PASSWORD}@{DB_HOST}:{DB_PORT}/"
temp_engine = create_engine(temp_db_url, pool_pre_ping=True)
with temp_engine.connect() as conn:
    conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}"))
    conn.commit()
temp_engine.dispose()

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{urllib.parse.quote(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False  # Set to False to disable SQL query logging in production
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session in FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
