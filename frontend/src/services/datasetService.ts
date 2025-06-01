import api from './api';
import type { Dataset, UploadResponse } from '../types/index';

export const datasetService = {
  // 上传数据集
  uploadDataset: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/datasets/upload', formData);
    return response.data;
  },

  // 获取数据集列表
  getDatasets: async (): Promise<Dataset[]> => {
    const response = await api.get('/datasets/');
    return response.data;
  },

  // 获取单个数据集
  getDataset: async (id: number): Promise<Dataset> => {
    const response = await api.get(`/datasets/${id}`);
    return response.data;
  },

  // 预览数据集数据
  previewDataset: async (id: number, limit: number = 1000): Promise<any[]> => {
    const response = await api.get(`/datasets/${id}/preview?limit=${limit}`);
    return response.data;
  },

  // 删除数据集
  deleteDataset: async (id: number): Promise<void> => {
    await api.delete(`/datasets/${id}`);
  },

  // 更新数据集
  updateDataset: async (id: number, data: Partial<Dataset>): Promise<Dataset> => {
    const response = await api.patch(`/datasets/${id}`, data);
    return response.data;
  },

  // 加载示例数据集
  loadSampleDataset: async (sampleType: string): Promise<UploadResponse> => {
    const response = await api.post(`/datasets/sample/${sampleType}`);
    return response.data;
  },
}; 