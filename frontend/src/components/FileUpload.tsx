import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import type { UploadResponse } from '../types/index';
import { datasetService } from '../services/datasetService';

interface FileUploadProps {
  onUploadSuccess: (result: UploadResponse) => void;
  onUploadError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const validTypes = ['.csv', '.xlsx', '.xls', '.json'];
    const validFiles = files.filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return validTypes.includes(ext);
    });

    if (validFiles.length !== files.length) {
      onUploadError('只支持 CSV, Excel, JSON 格式的文件');
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await datasetService.uploadDataset(file);
      onUploadSuccess(result);
      setUploadedFiles(prev => prev.filter(f => f !== file));
    } catch (error: any) {
      onUploadError(error.response?.data?.detail || '上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (file: File) => {
    setUploadedFiles(prev => prev.filter(f => f !== file));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="glass-card-solid p-8">
      <h3 className="text-xl font-bold mb-6 text-gray-800">📁 上传数据文件</h3>
      
      {/* 上传区域 */}
      <div
        className={`border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          拖拽文件到此处或点击上传
        </h4>
        <p className="text-gray-500 mb-4">
          支持 CSV, Excel, JSON 格式，最大支持 50MB
        </p>
        <button className="btn-primary">
          选择文件
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* 已选择的文件列表 */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-700 mb-3">待上传文件</h4>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-primary-500" />
                  <div>
                    <p className="font-medium text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => uploadFile(file)}
                    disabled={isUploading}
                    className="btn-secondary text-sm"
                  >
                    {isUploading ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      '上传'
                    )}
                  </button>
                  <button
                    onClick={() => removeFile(file)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 