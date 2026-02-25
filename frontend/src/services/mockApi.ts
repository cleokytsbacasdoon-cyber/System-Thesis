import { v4 as uuidv4 } from 'uuid';
import { ModelMetrics, DriftAlert, RetrainingJob, APIEndpoint } from '../types';

// Generate sample data
const generateSampleMetrics = (): ModelMetrics[] => {
  const metrics: ModelMetrics[] = [];
  for (let i = 0; i < 10; i++) {
    metrics.push({
      id: uuidv4(),
      accuracy: 0.85 + Math.random() * 0.12,
      precision: 0.83 + Math.random() * 0.14,
      recall: 0.84 + Math.random() * 0.13,
      f1Score: 0.84 + Math.random() * 0.13,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    });
  }
  return metrics.reverse();
};

const generateSampleAlerts = (): DriftAlert[] => [
  {
    id: uuidv4(),
    modelId: 'sample-model-1',
    severity: 'medium',
    message: 'Drift detected: Feature distribution changed by 18%',
    threshold: 0.15,
    currentValue: 0.18,
    resolved: false,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: uuidv4(),
    modelId: 'sample-model-1',
    severity: 'low',
    message: 'Slight drift detected in prediction output',
    threshold: 0.15,
    currentValue: 0.08,
    resolved: true,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

const generateSampleJobs = (): RetrainingJob[] => [
  {
    id: uuidv4(),
    modelId: 'sample-model-1',
    status: 'completed',
    startTime: new Date(Date.now() - 7200000).toISOString(),
    endTime: new Date(Date.now() - 3600000).toISOString(),
    accuracy: 0.93,
  },
  {
    id: uuidv4(),
    modelId: 'sample-model-1',
    status: 'running',
    startTime: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: uuidv4(),
    modelId: 'sample-model-1',
    status: 'pending',
    startTime: new Date().toISOString(),
  },
];

const generateSampleEndpoints = (): APIEndpoint[] => [
  {
    id: uuidv4(),
    name: 'Model Prediction API',
    url: 'http://localhost:8000/predict',
    status: 'active',
    responseTime: 145,
    lastCheck: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Health Check',
    url: 'http://localhost:8000/health',
    status: 'active',
    responseTime: 32,
    lastCheck: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Data Pipeline',
    url: 'http://localhost:5000/status',
    status: 'inactive',
    responseTime: 0,
    lastCheck: new Date(Date.now() - 7200000).toISOString(),
  },
];

// Mock data storage
let mockMetrics = generateSampleMetrics();
let mockAlerts = generateSampleAlerts();
let mockJobs = generateSampleJobs();
let mockEndpoints = generateSampleEndpoints();

// Simulate real-time data updates
setInterval(() => {
  // Add new metric every 30 seconds
  const newMetric: ModelMetrics = {
    id: uuidv4(),
    accuracy: 0.85 + Math.random() * 0.12,
    precision: 0.83 + Math.random() * 0.14,
    recall: 0.84 + Math.random() * 0.13,
    f1Score: 0.84 + Math.random() * 0.13,
    timestamp: new Date().toISOString(),
  };
  mockMetrics.push(newMetric);
  
  // Keep only last 100 metrics
  if (mockMetrics.length > 100) {
    mockMetrics = mockMetrics.slice(-100);
  }

  // Simulate running job completion
  const runningJob = mockJobs.find(j => j.status === 'running');
  if (runningJob && Math.random() > 0.8) {
    runningJob.status = 'completed';
    runningJob.endTime = new Date().toISOString();
    runningJob.accuracy = 0.92 + Math.random() * 0.05;
  }

  // Move pending to running
  const pendingJob = mockJobs.find(j => j.status === 'pending');
  if (pendingJob && Math.random() > 0.9) {
    pendingJob.status = 'running';
  }
}, 30000);

// Mock API Service
export const mockApi = {
  getModelMetrics: async (): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return mockMetrics;
  },

  getDriftAlerts: async (): Promise<DriftAlert[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockAlerts;
  },

  resolveDriftAlert: async (alertId: string): Promise<DriftAlert> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const alert = mockAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
    return alert || mockAlerts[0];
  },

  getRetrainingJobs: async (): Promise<RetrainingJob[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockJobs;
  },

  startRetrainingJob: async (modelId: string): Promise<RetrainingJob> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newJob: RetrainingJob = {
      id: uuidv4(),
      modelId,
      status: 'pending',
      startTime: new Date().toISOString(),
    };
    mockJobs.unshift(newJob);
    return newJob;
  },

  getRetrainingJobStatus: async (jobId: string): Promise<RetrainingJob> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockJobs.find(j => j.id === jobId) || mockJobs[0];
  },

  getAPIEndpoints: async (): Promise<APIEndpoint[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockEndpoints;
  },

  checkEndpointStatus: async (endpointId: string): Promise<APIEndpoint> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const endpoint = mockEndpoints.find(e => e.id === endpointId);
    if (endpoint) {
      endpoint.responseTime = Math.floor(Math.random() * 300) + 50;
      endpoint.lastCheck = new Date().toISOString();
      endpoint.status = Math.random() > 0.2 ? 'active' : 'inactive';
    }
    return endpoint || mockEndpoints[0];
  },
};
