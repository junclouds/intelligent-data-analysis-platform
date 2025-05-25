from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from pydantic import BaseModel

from app.core.database import get_db
from app.models.dataset import Dataset
from app.models.analysis import Analysis
from app.services.data_processor import data_processor
from app.services.ai_analyzer import ai_analyzer
from app.core.redis import cache

router = APIRouter()


class AnalysisRequest(BaseModel):
    dataset_id: int
    question: str


@router.post("/query", response_model=Dict[str, Any])
async def analyze_data(
    request: AnalysisRequest,
    db: Session = Depends(get_db)
):
    """分析数据并生成图表和洞察"""
    try:
        # 获取数据集
        dataset = db.query(Dataset).filter(
            Dataset.id == request.dataset_id,
            Dataset.is_active == True
        ).first()
        
        if not dataset:
            raise HTTPException(status_code=404, detail="数据集不存在")
        
        # 检查缓存
        cache_key = f"analysis:{request.dataset_id}:{hash(request.question)}"
        cached_result = await cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # 加载数据
        df = data_processor.load_data(dataset.file_path)
        
        # 获取数据信息
        data_info = await cache.get(f"dataset:{request.dataset_id}:info")
        if not data_info:
            data_info = data_processor.analyze_dataframe(df)
            await cache.set(f"dataset:{request.dataset_id}:info", data_info, expire=3600)
        
        # AI分析问题
        query_analysis = await ai_analyzer.analyze_question(request.question, data_info)
        
        # 根据分析结果查询数据
        chart_data = data_processor.query_data(df, query_analysis)
        
        # 生成AI洞察
        insights = await ai_analyzer.generate_insights(
            request.question,
            chart_data,
            data_info
        )
        
        # 保存分析记录
        analysis = Analysis(
            dataset_id=request.dataset_id,
            question=request.question,
            query_type=query_analysis.get("query_type"),
            chart_config=chart_data,
            insights={"insights": insights}
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        result = {
            "analysis_id": analysis.id,
            "question": request.question,
            "query_type": query_analysis.get("query_type"),
            "chart_config": chart_data,
            "insights": insights,
            "reasoning": query_analysis.get("reasoning", ""),
            "created_at": analysis.created_at.isoformat()
        }
        
        # 缓存结果
        await cache.set(cache_key, result, expire=1800)  # 30分钟缓存
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"分析失败: {str(e)}")


@router.get("/history/{dataset_id}")
async def get_analysis_history(
    dataset_id: int,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """获取数据集的分析历史"""
    # 验证数据集存在
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.is_active == True
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="数据集不存在")
    
    # 获取分析历史
    analyses = db.query(Analysis).filter(
        Analysis.dataset_id == dataset_id
    ).order_by(Analysis.created_at.desc()).limit(limit).all()
    
    result = []
    for analysis in analyses:
        result.append({
            "id": analysis.id,
            "question": analysis.question,
            "query_type": analysis.query_type,
            "created_at": analysis.created_at.isoformat()
        })
    
    return {
        "dataset_id": dataset_id,
        "dataset_name": dataset.name,
        "total_analyses": len(result),
        "analyses": result
    }


@router.get("/detail/{analysis_id}")
async def get_analysis_detail(analysis_id: int, db: Session = Depends(get_db)):
    """获取分析详情"""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="分析记录不存在")
    
    return {
        "id": analysis.id,
        "dataset_id": analysis.dataset_id,
        "question": analysis.question,
        "query_type": analysis.query_type,
        "chart_config": analysis.chart_config,
        "insights": analysis.insights,
        "created_at": analysis.created_at.isoformat()
    }


@router.post("/regenerate/{analysis_id}")
async def regenerate_insights(analysis_id: int, db: Session = Depends(get_db)):
    """重新生成洞察"""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="分析记录不存在")
    
    try:
        # 获取数据集信息
        data_info = await cache.get(f"dataset:{analysis.dataset_id}:info")
        if not data_info:
            dataset = db.query(Dataset).filter(Dataset.id == analysis.dataset_id).first()
            df = data_processor.load_data(dataset.file_path)
            data_info = data_processor.analyze_dataframe(df)
        
        # 重新生成洞察
        new_insights = await ai_analyzer.generate_insights(
            analysis.question,
            analysis.chart_config,
            data_info
        )
        
        # 更新分析记录
        analysis.insights = {"insights": new_insights}
        db.commit()
        
        return {
            "analysis_id": analysis.id,
            "insights": new_insights,
            "message": "洞察重新生成成功"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"重新生成失败: {str(e)}")


@router.get("/suggestions/{dataset_id}")
async def get_analysis_suggestions(dataset_id: int, db: Session = Depends(get_db)):
    """获取分析建议"""
    # 验证数据集存在
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.is_active == True
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="数据集不存在")
    
    # 获取数据信息
    data_info = await cache.get(f"dataset:{dataset_id}:info")
    if not data_info:
        df = data_processor.load_data(dataset.file_path)
        data_info = data_processor.analyze_dataframe(df)
        await cache.set(f"dataset:{dataset_id}:info", data_info, expire=3600)
    
    # 基于数据特征生成建议问题
    suggestions = []
    columns = data_info.get("columns", [])
    
    # 寻找数值列
    numeric_cols = [col for col in columns if 'int' in col['dtype'] or 'float' in col['dtype']]
    # 寻找时间列
    time_cols = [col for col in columns if any(time_word in col['name'].lower() 
                for time_word in ['时间', '日期', '月', '年', 'time', 'date'])]
    # 寻找分类列
    category_cols = [col for col in columns if col['unique_count'] < data_info['row_count'] * 0.5]
    
    if time_cols and numeric_cols:
        suggestions.append({
            "question": f"{numeric_cols[0]['name']}随{time_cols[0]['name']}的变化趋势如何？",
            "type": "trend",
            "description": "分析数值指标的时间趋势"
        })
    
    if category_cols and numeric_cols:
        suggestions.append({
            "question": f"不同{category_cols[0]['name']}的{numeric_cols[0]['name']}对比情况？",
            "type": "comparison",
            "description": "比较不同分类的数值差异"
        })
    
    if category_cols:
        suggestions.append({
            "question": f"{category_cols[0]['name']}的分布情况如何？",
            "type": "distribution",
            "description": "分析分类数据的分布特征"
        })
    
    if len(numeric_cols) >= 2:
        suggestions.append({
            "question": f"{numeric_cols[0]['name']}和{numeric_cols[1]['name']}之间有什么关系？",
            "type": "correlation",
            "description": "分析两个数值指标的相关性"
        })
    
    # 添加一些通用建议
    suggestions.extend([
        {
            "question": "数据中有哪些异常值或特殊模式？",
            "type": "anomaly",
            "description": "发现数据中的异常情况"
        },
        {
            "question": "数据的整体质量如何？",
            "type": "quality",
            "description": "评估数据完整性和质量"
        }
    ])
    
    return {
        "dataset_id": dataset_id,
        "dataset_name": dataset.name,
        "suggestions": suggestions[:6]  # 返回最多6个建议
    } 