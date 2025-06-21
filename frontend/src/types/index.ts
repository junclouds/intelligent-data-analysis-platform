export interface Dataset {
  id: number;
  name: string;
  description?: string;
  file_path: string;
  file_type: string;
  file_size: number;
  columns_info: Record<string, any>;
  row_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Column {
  name: string;
  dtype: string;
  null_count: number;
  unique_count: number;
  sample_values: any[];
  min?: number;
  max?: number;
  mean?: number;
  std?: number;
}

export interface AnalysisRequest {
  dataset_id: number;
  question: string;
}

export interface AnalysisParameters {
  time_column?: string;
  value_column?: string;
  category_column?: string;
  column?: string;
}

export interface AnalysisResult {
  id: number;
  dataset_id: number;
  question: string;
  query_type: 'trend' | 'comparison' | 'distribution' | 'correlation' | 'ranking' | 'proportion' | 'stat_summary' | 'basic' | 'other';
  parameters: AnalysisParameters;
  chart_config: ChartConfig;
  insights: Insight[];
  reasoning: string;
  created_at: string;
}

export interface BoxplotData {
  boxData: number[];
  outliers: number[];
  name?: string;
}

export interface ChartConfig {
  chart_type: 'line' | 'bar' | 'pie' | 'scatter' | 'histogram' | 'boxplot' | 'table';
  data: any[];
  x_axis?: string;
  y_axis?: string;
  name_field?: string;
  value_field?: string;
  category_column?: string;
  title?: string;
  subtitle?: string;
}

export interface Insight {
  title: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
}

export interface UploadResponse {
  dataset: Dataset;
  message: string;
} 