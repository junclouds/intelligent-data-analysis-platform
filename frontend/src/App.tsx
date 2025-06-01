import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Rocket, Database, Brain, ArrowUp, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isDatasetPanelOpen, setIsDatasetPanelOpen] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [isViewingData, setIsViewingData] = useState(false);
  const [datasetData, setDatasetData] = useState<any[]>([]);

  // 加载数据集列表
  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setIsLoading(true);
      const data = await datasetService.getDatasets();
      console.log('加载的数据集:', data);
      setDatasets(data || []);
      
      // 查找默认数据集
      const defaultDataset = data?.find(d => d.file_path.includes('9bdfa9d8-39f3-4428-8b23-a510d4c68179.csv'));
      console.log('默认数据集:', defaultDataset);
      
      if (defaultDataset) {
        setSelectedDataset(defaultDataset);
      } else if (data?.length > 0 && !selectedDataset) {
        setSelectedDataset(data[0]);
      } else {
        // 如果没有数据集，创建一个虚拟的默认数据集用于演示
        const mockDataset: Dataset = {
          id: 999,
          name: '演示数据集',
          file_path: '/Users/lijun/work_cursor/intelligent-data-analysis-platform/backend/uploads/9bdfa9d8-39f3-4428-8b23-a510d4c68179.csv',
          row_count: 301,
          columns: ['日期', '订单编号', '商品名称', '类别', '售价', '进价', '销售数量', '顾客类型', '支付方式', '是否退货', '店员'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          file_type: 'csv'
        };
        setSelectedDataset(mockDataset);
        console.log('使用模拟数据集');
      }
    } catch (error) {
      console.error('加载数据集失败:', error);
      setDatasets([]);
      // 即使加载失败，也提供一个模拟数据集
      const mockDataset: Dataset = {
        id: 999,
        name: '演示数据集（离线模式）',
        file_path: '/Users/lijun/work_cursor/intelligent-data-analysis-platform/backend/uploads/9bdfa9d8-39f3-4428-8b23-a510d4c68179.csv',
        row_count: 301,
        columns: ['日期', '订单编号', '商品名称', '类别', '售价', '进价', '销售数量', '顾客类型', '支付方式', '是否退货', '店员'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        file_type: 'csv'
      };
      setSelectedDataset(mockDataset);
      showNotification('error', '加载数据集失败，使用演示模式');
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

  const handleDeleteDataset = async (dataset: Dataset) => {
    if (window.confirm(`确定要删除数据集"${dataset.name}"吗？`)) {
      try {
        await datasetService.deleteDataset(dataset.id);
        showNotification('success', '数据集删除成功');
        loadDatasets();
        if (selectedDataset?.id === dataset.id) {
          setSelectedDataset(null);
        }
      } catch (error) {
        showNotification('error', '删除数据集失败');
      }
    }
  };

  const handleEditDataset = async (dataset: Dataset) => {
    setEditingDataset(dataset);
  };

  const handleViewData = async (dataset: Dataset) => {
    try {
      const data = await datasetService.previewDataset(dataset.id);
      setDatasetData(data);
      setIsViewingData(true);
    } catch (error) {
      showNotification('error', '加载数据失败');
    }
  };

  const handleSaveEdit = async (dataset: Dataset, newName: string) => {
    try {
      await datasetService.updateDataset(dataset.id, { name: newName });
      showNotification('success', '数据集更新成功');
      loadDatasets();
      setEditingDataset(null);
    } catch (error) {
      showNotification('error', '更新数据集失败');
    }
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
          {/* 数据集管理按钮 */}
          <div className="fixed top-4 right-4 z-40">
            <button
              className="p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300"
              onClick={() => setIsDatasetPanelOpen(!isDatasetPanelOpen)}
              title={isDatasetPanelOpen ? "关闭数据集管理" : "打开数据集管理"}
            >
              <Database className={`w-6 h-6 ${isDatasetPanelOpen ? 'text-primary-600' : 'text-gray-600'}`} />
            </button>
          </div>

          {/* 数据分析区域 */}
          {selectedDataset && (
            <section>
              <DataAnalysis dataset={selectedDataset} />
            </section>
          )}

          {/* 数据集管理面板 */}
          {isDatasetPanelOpen && (
            <section className="glass-card-solid">
              <div className="p-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Database className="w-6 h-6 mr-2 text-primary-500" />
                  数据集管理
                  {datasets && datasets.length > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({datasets.length} 个数据集)
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setIsDatasetPanelOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronUp className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 pt-2 space-y-6">
                {/* 数据上传区域 */}
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

                {/* 数据集选择 */}
                {!isLoading && datasets && datasets.length > 0 ? (
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                      选择数据集
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {datasets.map((dataset) => (
                        <div
                          key={dataset.id}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                            selectedDataset?.id === dataset.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                          }`}
                        >
                          {editingDataset?.id === dataset.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                defaultValue={dataset.name}
                                className="input-field text-sm"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEdit(dataset, e.currentTarget.value);
                                  }
                                }}
                                onBlur={(e) => handleSaveEdit(dataset, e.target.value)}
                              />
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-start mb-2">
                                <h4 
                                  className="font-semibold text-gray-800 cursor-pointer hover:text-primary-500"
                                  onClick={() => setSelectedDataset(dataset)}
                                >
                                  {dataset.name}
                                </h4>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewData(dataset);
                                    }}
                                    className="text-gray-500 hover:text-primary-500"
                                    title="浏览数据"
                                  >
                                    👁️
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditDataset(dataset);
                                    }}
                                    className="text-gray-500 hover:text-primary-500"
                                    title="编辑"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteDataset(dataset);
                                    }}
                                    className="text-gray-500 hover:text-red-500"
                                    title="删除"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>📊 {dataset.row_count || 0} 行数据</p>
                                <p>📋 {dataset.columns?.length || 0} 个字段</p>
                                <p>📅 {dataset.created_at ? new Date(dataset.created_at).toLocaleDateString() : '未知'}</p>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="glass-card-solid p-12 text-center">
                    <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      {isLoading ? '加载中...' : '开始您的数据分析之旅'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {isLoading ? '正在加载数据集...' : '上传您的数据文件或选择示例数据开始分析'}
                    </p>
                    {isLoading && (
                      <div className="loading-spinner mx-auto"></div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* 数据预览模态框 */}
        {isViewingData && datasetData && datasetData.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-11/12 max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold">数据预览</h3>
                <button
                  onClick={() => {
                    setIsViewingData(false);
                    setDatasetData([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
                {datasetData.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(datasetData[0] || {}).map((header) => (
                          <th
                            key={header}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {datasetData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(row || {}).map((cell: any, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              {cell?.toString() || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    暂无数据
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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