from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Analysis(Base):
    """分析记录模型"""
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    question = Column(Text, nullable=False)  # 用户提问
    query_type = Column(String(100))  # 查询类型：trend, comparison, distribution等
    chart_config = Column(JSON)  # 图表配置
    insights = Column(JSON)  # AI生成的洞察
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关联关系
    dataset = relationship("Dataset", backref="analyses")
    
    def __repr__(self):
        return f"<Analysis(id={self.id}, question='{self.question[:50]}...')>" 