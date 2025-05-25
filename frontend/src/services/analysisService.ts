import api from './api';
import type { AnalysisRequest, AnalysisResult } from '../types/index';

export const analysisService = {
  // 分析数据
  analyzeData: async (request: AnalysisRequest): Promise<AnalysisResult> => {
    return await api.post('/analysis/query', request);
  },

  // 获取分析历史
  getAnalysisHistory: async (datasetId: number, limit: number = 20) => {
    return await api.get(`/analysis/history/${datasetId}?limit=${limit}`);
  },

  // 获取分析详情
  getAnalysisDetail: async (analysisId: number): Promise<AnalysisResult> => {
    return await api.get(`/analysis/detail/${analysisId}`);
  },

  // 重新生成洞察
  regenerateInsights: async (analysisId: number) => {
    return await api.post(`/analysis/regenerate/${analysisId}`);
  },

  // 获取分析建议
  getAnalysisSuggestions: async (datasetId: number) => {
    return await api.get(`/analysis/suggestions/${datasetId}`);
  },
}; 