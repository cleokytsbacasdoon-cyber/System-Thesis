export interface ModelMetrics {
  id: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  timestamp: string;
}

export interface DriftAlert {
  id: string;
  modelId: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  resolved: boolean;
}

export interface RetrainingJob {
  id: string;
  modelId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  accuracy?: number;
  errorMessage?: string;
}

export interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive';
  responseTime: number;
  lastCheck: string;
}

export interface DashboardData {
  modelMetrics: ModelMetrics[];
  driftAlerts: DriftAlert[];
  retrainingJobs: RetrainingJob[];
  apiEndpoints: APIEndpoint[];
}
