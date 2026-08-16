from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Medication Management API"
    DATABASE_URL: str = "sqlite:///./medmanage.db"
    
    # Auth
    GOOGLE_CLIENT_ID: str = "717818816381-fhuud0lguf7djggk4nq2d3l38g8cejki.apps.googleusercontent.com"
    JWT_SECRET: str = "supersecretkey_for_local_dev"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    # Supabase (optional for local, required for prod storage)
    SUPABASE_URL: str | None = None
    SUPABASE_KEY: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()
