import React, { useState, useEffect } from 'react';
import { Search, Brain, TrendingUp, BarChart3 } from 'lucide-react';
import { analysisService } from '../services/analysisService';
import type { AnalysisResult, Dataset } from '../types/index';
import ChartDisplay from './ChartDisplay';

interface DataAnalysisProps {
  dataset: Dataset;
}

const DataAnalysis: React.FC<DataAnalysisProps> = ({ dataset }) => {
  const [question, setQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exampleQuestions = [
    '销售额趋势如何？',
    '哪个地区表现最好？',
    '用户年龄分布情况？',
    '产品销量排行榜？'
  ];

  const handleAnalyze = async () => {
    if (!question.trim()) {
      setError('请输入您的问题');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analysisService.analyzeData({
        dataset_id: dataset.id,
        question: question.trim()
      });
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || '分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExampleClick = (exampleQuestion: string) => {
    setQuestion(exampleQuestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  return (
    <div className="space-y-6">
      {/* 问题输入区域 */}
      <div className="glass-card-solid p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <Brain className="w-6 h-6 mr-2 text-primary-500" />
          智能数据分析
        </h3>
        
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的问题，例如：上个月销售趋势如何？"
            className="input-field flex-1"
          />
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="btn-primary flex items-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <div className="loading-spinner"></div>
                <span>分析中...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>分析数据</span>
              </>
            )}
          </button>
        </div>

        {/* 示例问题 */}
        <div className="flex flex-wrap gap-2">
          {exampleQuestions.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="btn-secondary text-sm"
            >
              {example}
            </button>
          ))}
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* 分析结果 */}
      {analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 图表区域 */}
          <div className="glass-card-solid p-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary-500" />
              数据可视化
            </h4>
            <ChartDisplay chartConfig={analysisResult.chart_config} />
          </div>

          {/* 洞察区域 */}
          <div className="glass-card-solid p-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-500" />
              智能洞察
            </h4>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {analysisResult.insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500"
                >
                  <h5 className="font-semibold text-gray-800 mb-2">
                    {insight.title}
                  </h5>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {insight.description}
                  </p>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                    insight.importance === 'high' 
                      ? 'bg-red-100 text-red-800'
                      : insight.importance === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {insight.importance === 'high' ? '高重要性' : 
                     insight.importance === 'medium' ? '中等重要性' : '低重要性'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnalysis; 