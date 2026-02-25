import axios from 'axios';
import { ModelMetrics, DriftAlert, RetrainingJob, APIEndpoint } from '../types';
import { mockApi } from './mockApi';

// Use mock API in development (no backend needed)
const USE_MOCK_API = true; // Set to false when backend is ready

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Model Metrics APIs
export const getModelMetrics = async (): Promise<ModelMetrics[]> => {
  if (USE_MOCK_API) return mockApi.getModelMetrics();
  const response = await apiClient.get('/metrics/models');
  return response.data;
};

export const getModelMetricsById = async (modelId: string): Promise<ModelMetrics> => {
  if (USE_MOCK_API) {
    const metrics = await mockApi.getModelMetrics();
    return metrics.find(m => m.id === modelId) || metrics[0];
  }
  const response = await apiClient.get(`/metrics/models/${modelId}`);
  return response.data;
};

// Drift Detection APIs
export const getDriftAlerts = async (): Promise<DriftAlert[]> => {
  if (USE_MOCK_API) return mockApi.getDriftAlerts();
  const response = await apiClient.get('/drift/alerts');
  return response.data;
};

export const resolveDriftAlert = async (alertId: string): Promise<DriftAlert> => {
  if (USE_MOCK_API) return mockApi.resolveDriftAlert(alertId);
  const response = await apiClient.put(`/drift/alerts/${alertId}/resolve`);
  return response.data;
};

// Retraining APIs
export const getRetrainingJobs = async (): Promise<RetrainingJob[]> => {
  if (USE_MOCK_API) return mockApi.getRetrainingJobs();
  const response = await apiClient.get('/retraining/jobs');
  return response.data;
};

export const startRetrainingJob = async (modelId: string): Promise<RetrainingJob> => {
  if (USE_MOCK_API) return mockApi.startRetrainingJob(modelId);
  const response = await apiClient.post('/retraining/jobs', { modelId });
  return response.data;
};

export const getRetrainingJobStatus = async (jobId: string): Promise<RetrainingJob> => {
  if (USE_MOCK_API) return mockApi.getRetrainingJobStatus(jobId);
  const response = await apiClient.get(`/retraining/jobs/${jobId}`);
  return response.data;
};

// API Endpoint APIs
export const getAPIEndpoints = async (): Promise<APIEndpoint[]> => {
  if (USE_MOCK_API) return mockApi.getAPIEndpoints();
  const response = await apiClient.get('/api/endpoints');
  return response.data;
};

export const checkEndpointStatus = async (endpointId: string): Promise<APIEndpoint> => {
  if (USE_MOCK_API) return mockApi.checkEndpointStatus(endpointId);
  const response = await apiClient.post(`/api/endpoints/${endpointId}/check`);
  return response.data;
};

export default apiClient;
