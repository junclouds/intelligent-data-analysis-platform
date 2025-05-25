import api from './api';
import type { Dataset, UploadResponse } from '../types/index';

export const datasetService = {
  // 上传数据集
  uploadDataset: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return await api.post('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 获取数据集列表
  getDatasets: async (): Promise<Dataset[]> => {
    return await api.get('/datasets/');
  },

  // 获取数据集详情
  getDataset: async (id: number): Promise<Dataset> => {
    return await api.get(`/datasets/${id}`);
  },

  // 预览数据集
  previewDataset: async (id: number, limit: number = 100) => {
    return await api.get(`/datasets/${id}/preview?limit=${limit}`);
  },

  // 删除数据集
  deleteDataset: async (id: number): Promise<{ message: string }> => {
    return await api.delete(`/datasets/${id}`);
  },

  // 加载示例数据
  loadSampleDataset: async (sampleType: string): Promise<UploadResponse> => {
    return await api.post(`/datasets/sample/${sampleType}`);
  },
}; 