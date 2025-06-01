import pandas as pd
import json
import os
from typing import Dict, Any, List, Optional
from pathlib import Path
import aiofiles
from fastapi import UploadFile, HTTPException

from app.core.config import settings


class DataProcessor:
    """数据处理器"""
    
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(exist_ok=True)
    
    async def save_uploaded_file(self, file: UploadFile) -> str:
        """保存上传的文件"""
        try:
            # 验证文件类型
            file_ext = Path(file.filename).suffix.lower()
            if file_ext not in settings.ALLOWED_FILE_TYPES:
                raise HTTPException(
                    status_code=422,
                    detail=f"不支持的文件类型: {file_ext}，请上传 {', '.join(settings.ALLOWED_FILE_TYPES)} 格式的文件"
                )
            
            # 确保上传目录存在
            self.upload_dir.mkdir(exist_ok=True)
            
            # 生成唯一文件名
            import uuid
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = self.upload_dir / unique_filename
            
            # 读取文件内容
            content = await file.read()
            
            # 验证文件大小
            if len(content) > settings.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=422,
                    detail=f"文件大小超过限制: {len(content) / 1024 / 1024:.1f}MB > {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
                )
            
            # 保存文件
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(content)
            
            return str(file_path)
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"文件保存失败: {str(e)}"
            )
    
    def load_data(self, file_path: str) -> pd.DataFrame:
        """加载数据文件"""
        file_ext = Path(file_path).suffix.lower()
        
        try:
            if file_ext == '.csv':
                # 尝试不同的编码
                for encoding in ['utf-8', 'gbk', 'gb2312']:
                    try:
                        return pd.read_csv(file_path, encoding=encoding)
                    except UnicodeDecodeError:
                        continue
                raise ValueError("无法解析CSV文件编码")
            
            elif file_ext in ['.xlsx', '.xls']:
                return pd.read_excel(file_path)
            
            elif file_ext == '.json':
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        return pd.DataFrame(data)
                    elif isinstance(data, dict):
                        return pd.DataFrame([data])
                    else:
                        raise ValueError("JSON格式不支持")
            
            else:
                raise ValueError(f"不支持的文件格式: {file_ext}")
        
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"文件解析失败: {str(e)}"
            )
    
    def analyze_dataframe(self, df: pd.DataFrame) -> Dict[str, Any]:
        """分析DataFrame的基本信息"""
        try:
            # 基本信息
            info = {
                "row_count": len(df),
                "column_count": len(df.columns),
                "columns": []
            }
            
            # 分析每一列
            for col in df.columns:
                col_info = {
                    "name": col,
                    "dtype": str(df[col].dtype),
                    "null_count": int(df[col].isnull().sum()),
                    "unique_count": int(df[col].nunique()),
                    "sample_values": df[col].dropna().head(5).tolist()
                }
                
                # 数值型列的统计信息
                if pd.api.types.is_numeric_dtype(df[col]):
                    col_info.update({
                        "min": float(df[col].min()) if not pd.isna(df[col].min()) else None,
                        "max": float(df[col].max()) if not pd.isna(df[col].max()) else None,
                        "mean": float(df[col].mean()) if not pd.isna(df[col].mean()) else None,
                        "std": float(df[col].std()) if not pd.isna(df[col].std()) else None
                    })
                
                info["columns"].append(col_info)
            
            return info
        
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"数据分析失败: {str(e)}"
            )
    
    def get_sample_data(self, df: pd.DataFrame, limit: int = 100) -> List[Dict]:
        """获取样本数据"""
        try:
            sample_df = df.head(limit)
            # 处理NaN值
            sample_df = sample_df.fillna("")
            return sample_df.to_dict('records')
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"获取样本数据失败: {str(e)}"
            )
    
    def query_data(self, df: pd.DataFrame, query_config: Dict[str, Any]) -> Dict[str, Any]:
        """根据查询配置处理数据"""
        try:
            query_type = query_config.get("query_type", "basic")
            parameters = query_config.get("parameters", {})
            
            if query_type == "trend":
                return self._analyze_trend(df, parameters)
            elif query_type == "comparison":
                return self._analyze_comparison(df, parameters)
            elif query_type == "distribution":
                return self._analyze_distribution(df, parameters)
            else:
                return self._basic_analysis(df, parameters)
        
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"数据查询失败: {str(e)}"
            )
    
    def _analyze_trend(self, df: pd.DataFrame, config: Dict) -> Dict[str, Any]:
        """趋势分析"""
        time_col = config.get("time_column")
        value_col = config.get("value_column")
        
        if not time_col or not value_col:
            raise ValueError("趋势分析需要指定时间列和数值列")
        
        # 按时间排序并聚合
        trend_data = df.groupby(time_col)[value_col].sum().reset_index()
        
        return {
            "chart_type": "line",
            "data": trend_data.to_dict('records'),
            "x_axis": time_col,
            "y_axis": value_col
        }
    
    def _analyze_comparison(self, df: pd.DataFrame, config: Dict) -> Dict[str, Any]:
        """对比分析"""
        category_col = config.get("category_column")
        value_col = config.get("value_column")
        
        if not category_col or not value_col:
            raise ValueError("对比分析需要指定分类列和数值列")
        
        # 按分类聚合
        comparison_data = df.groupby(category_col)[value_col].sum().reset_index()
        
        return {
            "chart_type": "bar",
            "data": comparison_data.to_dict('records'),
            "x_axis": category_col,
            "y_axis": value_col
        }
    
    def _analyze_distribution(self, df: pd.DataFrame, config: Dict) -> Dict[str, Any]:
        """分布分析"""
        column = config.get("column")
        
        if not column:
            raise ValueError("分布分析需要指定列名")
        
        # 计算分布
        if pd.api.types.is_numeric_dtype(df[column]):
            # 数值型：直方图
            hist_data = df[column].value_counts().sort_index().reset_index()
            hist_data.columns = [column, 'count']
            
            return {
                "chart_type": "histogram",
                "data": hist_data.to_dict('records'),
                "x_axis": column,
                "y_axis": "count"
            }
        else:
            # 分类型：饼图
            pie_data = df[column].value_counts().reset_index()
            pie_data.columns = [column, 'count']
            
            return {
                "chart_type": "pie",
                "data": pie_data.to_dict('records'),
                "name_field": column,
                "value_field": "count"
            }
    
    def _basic_analysis(self, df: pd.DataFrame, config: Dict) -> Dict[str, Any]:
        """基础分析"""
        # 返回基本的统计信息
        numeric_cols = df.select_dtypes(include=['number']).columns
        
        if len(numeric_cols) >= 2:
            # 如果有多个数值列，创建多系列图表
            x_col = numeric_cols[0]
            y_col = numeric_cols[1]
            
            chart_data = df[[x_col, y_col]].head(20).to_dict('records')
            
            return {
                "chart_type": "scatter",
                "data": chart_data,
                "x_axis": x_col,
                "y_axis": y_col
            }
        elif len(numeric_cols) == 1:
            # 单个数值列，显示分布
            col = numeric_cols[0]
            hist_data = df[col].value_counts().sort_index().head(20).reset_index()
            hist_data.columns = [col, 'count']
            
            return {
                "chart_type": "bar",
                "data": hist_data.to_dict('records'),
                "x_axis": col,
                "y_axis": "count"
            }
        else:
            # 没有数值列，返回第一列的分布
            first_col = df.columns[0]
            dist_data = df[first_col].value_counts().head(10).reset_index()
            dist_data.columns = [first_col, 'count']
            
            return {
                "chart_type": "pie",
                "data": dist_data.to_dict('records'),
                "name_field": first_col,
                "value_field": "count"
            }


# 全局数据处理器实例
data_processor = DataProcessor() 