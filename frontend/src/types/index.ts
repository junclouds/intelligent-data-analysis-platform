export interface Dataset {
  id: number;
  name: string;
  description?: string;
  file_type: string;
  file_size: number;
  row_count: number;
  column_count?: number;
  columns?: Column[];
  created_at: string;
  updated_at?: string;
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

export interface AnalysisResult {
  analysis_id: number;
  question: string;
  query_type: string;
  chart_config: ChartConfig;
  insights: Insight[];
  reasoning: string;
  created_at: string;
}

export interface ChartConfig {
  chart_type: 'line' | 'bar' | 'pie' | 'scatter' | 'histogram';
  data: any[];
  x_axis?: string;
  y_axis?: string;
  name_field?: string;
  value_field?: string;
}

export interface Insight {
  type: 'trend' | 'pattern' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
}

export interface UploadResponse {
  id: number;
  name: string;
  file_type: string;
  file_size: number;
  row_count: number;
  column_count: number;
  columns: Column[];
  message: string;
} 