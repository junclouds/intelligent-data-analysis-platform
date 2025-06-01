import openai
import json
from typing import Dict, Any, List
import pandas as pd
from app.core.config import settings


class AIAnalyzer:
    """AI分析器"""
    
    def __init__(self):
        if settings.OPENAI_API_KEY:
            openai.api_key = settings.OPENAI_API_KEY
        self.model = settings.OPENAI_MODEL
    
    async def analyze_question(self, question: str, data_info: Dict[str, Any]) -> Dict[str, Any]:
        """分析用户问题，确定查询类型和参数"""
        try:
            # 构建提示词
            prompt = self._build_question_analysis_prompt(question, data_info)
            
            if not settings.OPENAI_API_KEY:
                # 如果没有配置OpenAI API，返回默认分析
                return self._default_question_analysis(question, data_info)
            
            # 调用OpenAI API
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个数据分析专家，擅长理解用户的数据分析需求。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            # 解析响应
            result = response.choices[0].message.content
            return json.loads(result)
        
        except Exception as e:
            print(f"AI question analysis error: {e}")
            return self._default_question_analysis(question, data_info)
    
    async def generate_insights(self, question: str, chart_data: Dict[str, Any], data_summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        """生成数据洞察"""
        try:
            # 构建提示词
            prompt = self._build_insights_prompt(question, chart_data, data_summary)
            
            if not settings.OPENAI_API_KEY:
                # 如果没有配置OpenAI API，返回默认洞察
                return self._default_insights(question, chart_data)
            
            # 调用OpenAI API
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个数据分析专家，擅长从数据中发现洞察并提供建议。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=1500
            )
            
            # 解析响应
            result = response.choices[0].message.content
            return json.loads(result)
        
        except Exception as e:
            print(f"AI insights generation error: {e}")
            return self._default_insights(question, chart_data)
    
    def _build_question_analysis_prompt(self, question: str, data_info: Dict[str, Any]) -> str:
        """构建问题分析提示词"""
        columns_info = "\n".join([
            f"- {col['name']}: {col['dtype']} (样本值: {col['sample_values'][:3]})"
            for col in data_info.get('columns', [])
        ])
        
        prompt = f"""
用户问题: "{question}"

数据集信息:
- 总行数: {data_info.get('row_count', 0)}
- 总列数: {data_info.get('column_count', 0)}
- 列信息:
{columns_info}

请分析用户问题，确定最适合的分析类型和参数。返回JSON格式，包含:
{{
    "query_type": "trend|comparison|distribution|basic",
    "parameters": {{
        "time_column": "时间列名(如果是趋势分析)",
        "value_column": "数值列名",
        "category_column": "分类列名(如果是对比分析)",
        "column": "目标列名(如果是分布分析)"
    }},
    "chart_suggestion": "line|bar|pie|scatter|histogram",
    "reasoning": "选择理由"
}}
"""
        return prompt
    
    def _build_insights_prompt(self, question: str, chart_data: Dict[str, Any], data_summary: Dict[str, Any]) -> str:
        """构建洞察生成提示词"""
        prompt = f"""
用户问题: "{question}"

图表数据:
{json.dumps(chart_data, ensure_ascii=False, indent=2)}

数据摘要:
{json.dumps(data_summary, ensure_ascii=False, indent=2)}

请基于以上数据生成3-5个有价值的洞察，返回JSON格式:
{{
    "insights": [
        {{
            "type": "trend|pattern|anomaly|recommendation",
            "title": "洞察标题",
            "description": "详细描述",
            "importance": "high|medium|low"
        }}
    ]
}}
"""
        return prompt
    
    def _default_question_analysis(self, question: str, data_info: Dict[str, Any]) -> Dict[str, Any]:
        """默认问题分析（当没有AI时）"""
        columns = data_info.get('columns', [])
        numeric_cols = [col for col in columns if 'int' in col['dtype'] or 'float' in col['dtype']]
        
        # 简单的关键词匹配
        question_lower = question.lower()
        
        if any(keyword in question_lower for keyword in ['趋势', '变化', '时间', '月份', '年份']):
            # 趋势分析
            time_col = None
            value_col = None
            
            # 寻找时间列
            for col in columns:
                if any(time_word in col['name'].lower() for time_word in ['时间', '日期', '月', '年', 'time', 'date']):
                    time_col = col['name']
                    break
            
            # 寻找数值列
            if numeric_cols:
                value_col = numeric_cols[0]['name']
            
            return {
                "query_type": "trend",
                "parameters": {
                    "time_column": time_col,
                    "value_column": value_col
                },
                "chart_suggestion": "line",
                "reasoning": "检测到趋势分析关键词"
            }
        
        elif any(keyword in question_lower for keyword in ['对比', '比较', '地区', '产品', '分类']):
            # 对比分析
            category_col = None
            value_col = None
            
            # 寻找分类列
            for col in columns:
                if col['unique_count'] < data_info.get('row_count', 0) * 0.5:  # 唯一值较少的列
                    category_col = col['name']
                    break
            
            # 寻找数值列
            if numeric_cols:
                value_col = numeric_cols[0]['name']
            
            return {
                "query_type": "comparison",
                "parameters": {
                    "category_column": category_col,
                    "value_column": value_col
                },
                "chart_suggestion": "bar",
                "reasoning": "检测到对比分析关键词"
            }
        
        elif any(keyword in question_lower for keyword in ['分布', '分析', '统计']):
            # 分布分析
            target_col = columns[0]['name'] if columns else None
            
            return {
                "query_type": "distribution",
                "parameters": {
                    "column": target_col
                },
                "chart_suggestion": "pie" if target_col else "bar",
                "reasoning": "检测到分布分析关键词"
            }
        
        else:
            # 基础分析
            return {
                "query_type": "basic",
                "parameters": {},
                "chart_suggestion": "bar",
                "reasoning": "默认基础分析"
            }
    
    def _default_insights(self, question: str, chart_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """默认洞察生成（当没有AI时）"""
        insights = [
            {
                "type": "pattern",
                "title": "📈 数据概览",
                "description": f"根据您的问题「{question}」，我们分析了相关数据。数据显示了明显的模式和趋势。",
                "importance": "high"
            },
            {
                "type": "trend",
                "title": "💡 关键发现",
                "description": "数据中存在一些有趣的模式，建议进一步深入分析以获得更多洞察。",
                "importance": "medium"
            },
            {
                "type": "recommendation",
                "title": "🎯 建议行动",
                "description": "基于当前数据分析结果，建议关注数据中的异常值和趋势变化，制定相应的策略。",
                "importance": "medium"
            }
        ]
        
        return insights


# 全局AI分析器实例
ai_analyzer = AIAnalyzer() 