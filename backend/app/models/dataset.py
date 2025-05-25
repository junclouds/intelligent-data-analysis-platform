from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Boolean
from sqlalchemy.sql import func
from app.core.database import Base


class Dataset(Base):
    """数据集模型"""
    __tablename__ = "datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    file_path = Column(String(500))
    file_type = Column(String(50))  # csv, xlsx, json
    file_size = Column(Integer)
    columns_info = Column(JSON)  # 存储列信息
    row_count = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Dataset(id={self.id}, name='{self.name}')>" 