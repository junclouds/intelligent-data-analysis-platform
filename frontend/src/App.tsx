import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Rocket, Database, Brain, ArrowUp } from 'lucide-react';
import FileUpload from './components/FileUpload';
import DataAnalysis from './components/DataAnalysis';
import { datasetService } from './services/datasetService';
import type { Dataset, UploadResponse } from './types/index';

const queryClient = new QueryClient();

function AppContent() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载数据集列表
  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setIsLoading(true);
      const data = await datasetService.getDatasets();
      setDatasets(data);
      if (data.length > 0 && !selectedDataset) {
        setSelectedDataset(data[0]);
      }
    } catch (error) {
      showNotification('error', '加载数据集失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (result: UploadResponse) => {
    showNotification('success', `文件 ${result.name} 上传成功！`);
    loadDatasets();
  };

  const handleUploadError = (error: string) => {
    showNotification('error', error);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadSampleData = async (sampleType: string) => {
    try {
      const result = await datasetService.loadSampleDataset(sampleType);
      showNotification('success', `${result.name} 加载成功！`);
      loadDatasets();
    } catch (error: any) {
      showNotification('error', error.response?.data?.detail || '加载示例数据失败');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 relative overflow-hidden">
      {/* 动态背景 */}
      <div className="absolute inset-0 floating-animation">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 头部 */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center">
            <Rocket className="w-12 h-12 mr-4" />
            智能数据分析平台
          </h1>
          <p className="text-xl text-white/90">
            用自然语言提问，获得深度数据洞察
          </p>
        </header>

        {/* 通知 */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {notification.message}
          </div>
        )}

        {/* 主要内容 */}
        <div className="space-y-8">
          {/* 数据上传区域 */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 文件上传 */}
              <div className="lg:col-span-2">
                <FileUpload 
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              </div>

              {/* 示例数据 */}
              <div className="glass-card-solid p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">📊 示例数据</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => loadSampleData('sales')}
                    className="w-full btn-secondary text-left"
                  >
                    🛒 电商销售数据
                  </button>
                  <button
                    onClick={() => loadSampleData('users')}
                    className="w-full btn-secondary text-left"
                  >
                    👥 用户行为数据
                  </button>
                  <button
                    onClick={() => loadSampleData('finance')}
                    className="w-full btn-secondary text-left"
                  >
                    💰 财务数据
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 数据集选择 */}
          {datasets.length > 0 && (
            <section className="glass-card-solid p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <Database className="w-6 h-6 mr-2 text-primary-500" />
                选择数据集
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    onClick={() => setSelectedDataset(dataset)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                      selectedDataset?.id === dataset.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">{dataset.name}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📊 {dataset.row_count} 行数据</p>
                      <p>📋 {dataset.columns?.length || 0} 个字段</p>
                      <p>📅 {new Date(dataset.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 数据分析区域 */}
          {selectedDataset && (
            <section>
              <DataAnalysis dataset={selectedDataset} />
            </section>
          )}

          {/* 空状态 */}
          {!isLoading && datasets.length === 0 && (
            <div className="glass-card-solid p-12 text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                开始您的数据分析之旅
              </h3>
              <p className="text-gray-500 mb-6">
                上传您的数据文件或选择示例数据开始分析
              </p>
            </div>
          )}
        </div>

        {/* 浮动按钮 */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center z-50"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App; 