import React, { useState, useEffect } from 'react';
import { Search, Brain, TrendingUp, BarChart3, Database, Eye, X } from 'lucide-react';
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // 根据数据集类型获取推荐问题
  const getRecommendedQuestions = (dataset: Dataset) => {
    // 根据数据集名称或内容判断类型
    if (dataset.name.toLowerCase().includes('sales') || dataset.name.toLowerCase().includes('销售')) {
      return [
        '销售额趋势如何？',
        '哪个地区销售表现最好？',
        '最畅销的产品有哪些？',
        '各季度销售对比如何？'
      ];
    } else if (dataset.name.toLowerCase().includes('user') || dataset.name.toLowerCase().includes('用户')) {
      return [
        '用户年龄分布情况？',
        '用户活跃度分析',
        '用户增长趋势如何？',
        '用户留存率分析'
      ];
    } else if (dataset.name.toLowerCase().includes('finance') || dataset.name.toLowerCase().includes('财务')) {
      return [
        '收入支出趋势分析',
        '主要支出类别分布',
        '月度利润分析',
        '成本结构分析'
      ];
    }
    
    // 默认问题
    return [
      '数据总体趋势如何？',
      '数据分布情况？',
      '异常值分析',
      '关键指标统计'
    ];
  };

  const exampleQuestions = getRecommendedQuestions(dataset);

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
      console.log('Analysis result:', result);
      console.log('Chart config:', result.chart_config);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Analysis error:', err);
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

  // 获取数据预览
  const handlePreviewData = async () => {
    setIsLoadingPreview(true);
    try {
      // 如果是模拟数据集，使用本地数据
      if (dataset.id === 999) {
        // 模拟前10条数据
        const mockData = [
          { '日期': '2025-05-19', '订单编号': 'ORD1001', '商品名称': '短袖T恤', '类别': '上衣', '售价': 79, '进价': 40, '销售数量': 3, '顾客类型': '会员', '支付方式': '现金', '是否退货': '否', '店员': '小王' },
          { '日期': '2025-05-09', '订单编号': 'ORD1002', '商品名称': '长袖衬衫', '类别': '上衣', '售价': 119, '进价': 65, '销售数量': 2, '顾客类型': '普通顾客', '支付方式': '现金', '是否退货': '否', '店员': '小李' },
          { '日期': '2025-04-07', '订单编号': 'ORD1003', '商品名称': '风衣外套', '类别': '外套', '售价': 299, '进价': 180, '销售数量': 2, '顾客类型': '会员', '支付方式': '微信', '是否退货': '否', '店员': '小李' },
          { '日期': '2025-04-15', '订单编号': 'ORD1004', '商品名称': '半身裙', '类别': '裙装', '售价': 129, '进价': 70, '销售数量': 1, '顾客类型': '普通顾客', '支付方式': '现金', '是否退货': '否', '店员': '小王' },
          { '日期': '2025-04-11', '订单编号': 'ORD1005', '商品名称': '连衣裙', '类别': '裙装', '售价': 169, '进价': 95, '销售数量': 3, '顾客类型': '普通顾客', '支付方式': '现金', '是否退货': '否', '店员': '小王' },
          { '日期': '2025-05-17', '订单编号': 'ORD1006', '商品名称': '短袖T恤', '类别': '上衣', '售价': 79, '进价': 40, '销售数量': 1, '顾客类型': '会员', '支付方式': '微信', '是否退货': '否', '店员': '小李' },
          { '日期': '2025-04-11', '订单编号': 'ORD1007', '商品名称': '运动裤', '类别': '裤装', '售价': 99, '进价': 55, '销售数量': 3, '顾客类型': '普通顾客', '支付方式': '微信', '是否退货': '是', '店员': '小张' },
          { '日期': '2025-05-31', '订单编号': 'ORD1008', '商品名称': '长袖衬衫', '类别': '上衣', '售价': 119, '进价': 65, '销售数量': 1, '顾客类型': '会员', '支付方式': '微信', '是否退货': '否', '店员': '小王' },
          { '日期': '2025-05-24', '订单编号': 'ORD1009', '商品名称': '连衣裙', '类别': '裙装', '售价': 169, '进价': 95, '销售数量': 2, '顾客类型': '普通顾客', '支付方式': '支付宝', '是否退货': '否', '店员': '小李' },
          { '日期': '2025-04-12', '订单编号': 'ORD1010', '商品名称': '连衣裙', '类别': '裙装', '售价': 169, '进价': 95, '销售数量': 2, '顾客类型': '普通顾客', '支付方式': '支付宝', '是否退货': '否', '店员': '小王' }
        ];
        setPreviewData(mockData);
      } else {
        // 如果是真实数据集，从API获取
        try {
          const { datasetService } = await import('../services/datasetService');
          const data = await datasetService.previewDataset(dataset.id, 10);
          setPreviewData(data.slice(0, 10)); // 确保只显示前10条
        } catch (error) {
          console.error('获取数据失败:', error);
          setError('获取数据预览失败');
        }
      }
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('预览数据失败:', error);
      setError('预览数据失败');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 问题输入区域 */}
      <div className="glass-card-solid p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Database className="w-6 h-6 mr-2 text-primary-500" />
            <h3 className="text-xl font-bold text-gray-800">{dataset.name}</h3>
            <button
              onClick={handlePreviewData}
              disabled={isLoadingPreview}
              className="ml-3 p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all duration-200"
              title="查看数据预览"
            >
              {isLoadingPreview ? (
                <div className="w-5 h-5 loading-spinner"></div>
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="text-sm text-gray-600">
            <span className="mr-4">📊 {dataset.row_count} 行</span>
            <span>📋 {Object.keys(dataset.columns_info || {}).length} 列</span>
          </div>
        </div>
        
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的问题，或从下方选择推荐问题"
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

        {/* 推荐问题 */}
        <div>
          <p className="text-sm text-gray-600 mb-2">💡 推荐问题：</p>
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
          {/* 分析类型和推理过程 */}
          <div className="glass-card-solid p-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-primary-500" />
              分析方法
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="mb-3">
                  <span className="font-semibold text-gray-700">分析类型：</span>
                  <span className="ml-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                    {(() => {
                      switch (analysisResult.query_type) {
                        case 'trend': return '趋势分析';
                        case 'comparison': return '对比分析';
                        case 'distribution': return '分布分析';
                        case 'correlation': return '相关性分析';
                        case 'ranking': return '排名分析';
                        case 'proportion': return '占比分析';
                        case 'stat_summary': return '统计摘要';
                        case 'basic': return '基础分析';
                        default: return '其他分析';
                      }
                    })()}
                  </span>
                </div>
                <div className="mb-3">
                  <span className="font-semibold text-gray-700">使用字段：</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {analysisResult.parameters?.time_column && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        时间：{analysisResult.parameters.time_column}
                      </span>
                    )}
                    {analysisResult.parameters?.value_column && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        数值：{analysisResult.parameters.value_column}
                      </span>
                    )}
                    {analysisResult.parameters?.category_column && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                        分类：{analysisResult.parameters.category_column}
                      </span>
                    )}
                    {analysisResult.parameters?.column && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                        目标列：{analysisResult.parameters.column}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">分析推理：</span>
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                    {analysisResult.reasoning || '暂无分析推理说明'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="glass-card-solid p-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary-500" />
              数据可视化
            </h4>
            <ChartDisplay chartConfig={analysisResult.chart_config} />
          </div>

          {/* 洞察区域 */}
          <div className="glass-card-solid p-6 lg:col-span-2">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-500" />
              智能洞察
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* 数据预览模态框 */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-11/12 max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold">数据预览 - {dataset.name}</h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
              {previewData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(previewData[0] || {}).map((header) => (
                          <th
                            key={header}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {Object.values(row || {}).map((cell: any, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            >
                              {cell?.toString() || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>暂无数据</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnalysis; 