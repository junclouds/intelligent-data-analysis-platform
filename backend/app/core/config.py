from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path


class Settings(BaseSettings):
    # 应用基础配置
    APP_NAME: str = "智能数据分析平台"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # 获取项目根目录
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    
    # 数据库配置
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/data_analysis.db"
    
    # Redis配置
    REDIS_URL: str = "redis://localhost:6379"
    
    # OpenAI配置
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    
    # CORS配置
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"]
    
    # 文件上传配置
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_FILE_TYPES: List[str] = [".csv", ".xlsx", ".xls", ".json"]
    
    # JWT配置
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings() 