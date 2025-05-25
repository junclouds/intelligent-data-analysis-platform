from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import os

from app.core.database import get_db
from app.models.dataset import Dataset
from app.services.data_processor import data_processor
from app.core.redis import cache

router = APIRouter()


@router.post("/upload", response_model=Dict[str, Any])
async def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """上传数据集文件"""
    try:
        # 保存文件
        file_path = await data_processor.save_uploaded_file(file)
        
        # 加载并分析数据
        df = data_processor.load_data(file_path)
        data_info = data_processor.analyze_dataframe(df)
        
        # 创建数据集记录
        dataset = Dataset(
            name=file.filename,
            file_path=file_path,
            file_type=os.path.splitext(file.filename)[1].lower(),
            file_size=os.path.getsize(file_path),
            columns_info=data_info,
            row_count=data_info["row_count"]
        )
        
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        
        # 缓存数据信息
        await cache.set(f"dataset:{dataset.id}:info", data_info, expire=3600)
        
        return {
            "id": dataset.id,
            "name": dataset.name,
            "file_type": dataset.file_type,
            "file_size": dataset.file_size,
            "row_count": dataset.row_count,
            "column_count": data_info["column_count"],
            "columns": data_info["columns"],
            "message": "文件上传成功"
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[Dict[str, Any]])
async def list_datasets(db: Session = Depends(get_db)):
    """获取数据集列表"""
    datasets = db.query(Dataset).filter(Dataset.is_active == True).all()
    
    result = []
    for dataset in datasets:
        result.append({
            "id": dataset.id,
            "name": dataset.name,
            "file_type": dataset.file_type,
            "file_size": dataset.file_size,
            "row_count": dataset.row_count,
            "created_at": dataset.created_at.isoformat(),
            "updated_at": dataset.updated_at.isoformat() if dataset.updated_at else None
        })
    
    return result


@router.get("/{dataset_id}", response_model=Dict[str, Any])
async def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    """获取数据集详情"""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.is_active == True).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="数据集不存在")
    
    # 尝试从缓存获取数据信息
    data_info = await cache.get(f"dataset:{dataset_id}:info")
    
    if not data_info:
        # 如果缓存中没有，重新加载数据
        try:
            df = data_processor.load_data(dataset.file_path)
            data_info = data_processor.analyze_dataframe(df)
            await cache.set(f"dataset:{dataset_id}:info", data_info, expire=3600)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"数据加载失败: {str(e)}")
    
    return {
        "id": dataset.id,
        "name": dataset.name,
        "description": dataset.description,
        "file_type": dataset.file_type,
        "file_size": dataset.file_size,
        "row_count": dataset.row_count,
        "columns": data_info["columns"],
        "created_at": dataset.created_at.isoformat(),
        "updated_at": dataset.updated_at.isoformat() if dataset.updated_at else None
    }


@router.get("/{dataset_id}/preview", response_model=Dict[str, Any])
async def preview_dataset(
    dataset_id: int,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """预览数据集内容"""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.is_active == True).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="数据集不存在")
    
    try:
        # 加载数据
        df = data_processor.load_data(dataset.file_path)
        sample_data = data_processor.get_sample_data(df, limit)
        
        return {
            "total_rows": len(df),
            "preview_rows": len(sample_data),
            "columns": list(df.columns),
            "data": sample_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"数据预览失败: {str(e)}")


@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: int, db: Session = Depends(get_db)):
    """删除数据集"""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="数据集不存在")
    
    try:
        # 软删除
        dataset.is_active = False
        db.commit()
        
        # 删除缓存
        await cache.delete(f"dataset:{dataset_id}:info")
        
        # 可选：删除物理文件
        # if os.path.exists(dataset.file_path):
        #     os.remove(dataset.file_path)
        
        return {"message": "数据集删除成功"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")


@router.post("/sample/{sample_type}")
async def load_sample_dataset(sample_type: str, db: Session = Depends(get_db)):
    """加载示例数据集"""
    sample_datasets = {
        "sales": {
            "name": "电商销售数据示例",
            "data": [
                {"时间": "2024年1月", "产品名称": "产品A", "销售额": 125000, "销量": 1250, "地区": "华东"},
                {"时间": "2024年1月", "产品名称": "产品B", "销售额": 98000, "销量": 980, "地区": "华南"},
                {"时间": "2024年1月", "产品名称": "产品C", "销售额": 86000, "销量": 860, "地区": "华北"},
                {"时间": "2024年2月", "产品名称": "产品A", "销售额": 132000, "销量": 1320, "地区": "华东"},
                {"时间": "2024年2月", "产品名称": "产品B", "销售额": 105000, "销量": 1050, "地区": "华南"},
                {"时间": "2024年2月", "产品名称": "产品C", "销售额": 92000, "销量": 920, "地区": "华北"},
                {"时间": "2024年3月", "产品名称": "产品A", "销售额": 145000, "销量": 1450, "地区": "华东"},
                {"时间": "2024年3月", "产品名称": "产品B", "销售额": 118000, "销量": 1180, "地区": "华南"},
                {"时间": "2024年3月", "产品名称": "产品C", "销售额": 103000, "销量": 1030, "地区": "华北"},
            ]
        },
        "users": {
            "name": "用户行为数据示例",
            "data": [
                {"时间": "2024年1月", "行为类型": "新用户注册", "数量": 2580, "年龄段": "18-25岁", "平台": "移动端"},
                {"时间": "2024年1月", "行为类型": "活跃用户", "数量": 15230, "年龄段": "26-35岁", "平台": "PC端"},
                {"时间": "2024年1月", "行为类型": "付费转化", "数量": 1245, "年龄段": "36-45岁", "平台": "移动端"},
                {"时间": "2024年2月", "行为类型": "新用户注册", "数量": 2890, "年龄段": "18-25岁", "平台": "移动端"},
                {"时间": "2024年2月", "行为类型": "活跃用户", "数量": 16540, "年龄段": "26-35岁", "平台": "PC端"},
                {"时间": "2024年2月", "行为类型": "付费转化", "数量": 1380, "年龄段": "36-45岁", "平台": "移动端"},
            ]
        },
        "finance": {
            "name": "财务数据示例",
            "data": [
                {"时间": "2024年1月", "科目": "营业收入", "金额": 1250000, "类型": "销售收入", "状态": "确认"},
                {"时间": "2024年1月", "科目": "营业成本", "金额": 780000, "类型": "商品成本", "状态": "确认"},
                {"时间": "2024年1月", "科目": "营业费用", "金额": 280000, "类型": "销售费用", "状态": "确认"},
                {"时间": "2024年2月", "科目": "营业收入", "金额": 1380000, "类型": "销售收入", "状态": "确认"},
                {"时间": "2024年2月", "科目": "营业成本", "金额": 850000, "类型": "商品成本", "状态": "确认"},
                {"时间": "2024年2月", "科目": "营业费用", "金额": 310000, "类型": "销售费用", "状态": "确认"},
            ]
        }
    }
    
    if sample_type not in sample_datasets:
        raise HTTPException(status_code=400, detail="不支持的示例数据类型")
    
    try:
        sample_info = sample_datasets[sample_type]
        
        # 创建DataFrame并分析
        import pandas as pd
        df = pd.DataFrame(sample_info["data"])
        data_info = data_processor.analyze_dataframe(df)
        
        # 保存为临时文件
        import tempfile
        import json
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, encoding='utf-8') as f:
            json.dump(sample_info["data"], f, ensure_ascii=False, indent=2)
            temp_file_path = f.name
        
        # 创建数据集记录
        dataset = Dataset(
            name=sample_info["name"],
            description=f"系统内置的{sample_info['name']}",
            file_path=temp_file_path,
            file_type=".json",
            file_size=os.path.getsize(temp_file_path),
            columns_info=data_info,
            row_count=data_info["row_count"]
        )
        
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        
        # 缓存数据信息
        await cache.set(f"dataset:{dataset.id}:info", data_info, expire=3600)
        
        return {
            "id": dataset.id,
            "name": dataset.name,
            "description": dataset.description,
            "row_count": dataset.row_count,
            "column_count": data_info["column_count"],
            "columns": data_info["columns"],
            "message": f"{sample_info['name']}加载成功"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"示例数据加载失败: {str(e)}") 