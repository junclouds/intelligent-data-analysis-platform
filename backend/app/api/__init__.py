from fastapi import APIRouter
from .datasets import router as datasets_router
from .analysis import router as analysis_router

api_router = APIRouter()

# 包含各个模块的路由
api_router.include_router(datasets_router, prefix="/datasets", tags=["datasets"])
api_router.include_router(analysis_router, prefix="/analysis", tags=["analysis"]) 