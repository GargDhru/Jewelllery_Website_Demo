import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aura Atelier Luxury Jewellery API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "aura_luxury_jewellery_super_secret_jwt_key_2024_secure_signature")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database: Default to SQLite for zero-friction out-of-the-box local operation,
    # or PostgreSQL / Supabase Postgres if DATABASE_URL is configured
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./aura_jewellery.db")
    
    # Firebase Firestore Cloud Database
    FIREBASE_SERVICE_ACCOUNT_KEY: str = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY", "")
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    USE_FIREBASE: bool = os.getenv("USE_FIREBASE", "true").lower() in ("true", "1", "yes")
    
    # Frontend URL for production CORS (e.g. https://aura-jewellery-frontend.onrender.com)
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "")
    
    # Supabase (optional direct integration)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # Razorpay Test Credentials (default test mode keys)
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_luxurydemo123")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "secret_luxury_razorpay_mock_key")
    
    # Admin Seed Credentials
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "dhrugar@gmail.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "Dragonp@72")
    ADMIN_NAME: str = "Aura Atelier Master Admin"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://resionaura.vercel.app"
    ]

    def get_cors_origins(self) -> List[str]:
        origins = list(self.BACKEND_CORS_ORIGINS)
        if self.FRONTEND_URL:
            # Strip trailing slash if present
            clean_url = self.FRONTEND_URL.rstrip("/")
            if clean_url not in origins:
                origins.append(clean_url)
        return origins

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

