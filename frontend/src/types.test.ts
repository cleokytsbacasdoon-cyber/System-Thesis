import { describe, it, expect } from 'vitest';
import { ModelMetrics, DriftAlert, RetrainingJob } from './types';

describe('Types - MetricsCard', () => {
  it('should create valid ModelMetrics', () => {
    const metric: ModelMetrics = {
      id: '1',
      accuracy: 0.95,
      precision: 0.93,
      recall: 0.94,
      f1Score: 0.935,
      timestamp: '2026-02-25T10:30:00Z',
    };

    expect(metric.accuracy).toBeLessThanOrEqual(1);
    expect(metric.accuracy).toBeGreaterThanOrEqual(0);
  });
});

describe('Types - DriftAlert', () => {
  it('should create valid DriftAlert', () => {
    const alert: DriftAlert = {
      id: '1',
      modelId: 'model-1',
      severity: 'high',
      message: 'Drift detected',
      threshold: 0.15,
      currentValue: 0.45,
      resolved: false,
      timestamp: '2026-02-25T10:30:00Z',
    };

    expect(['low', 'medium', 'high']).toContain(alert.severity);
    expect(alert.threshold).toBeLessThan(alert.currentValue);
  });
});

describe('Types - RetrainingJob', () => {
  it('should create valid RetrainingJob', () => {
    const job: RetrainingJob = {
      id: '1',
      modelId: 'model-1',
      status: 'running',
      startTime: '2026-02-25T10:30:00Z',
    };

    expect(['pending', 'running', 'completed', 'failed']).toContain(job.status);
  });

  it('should have optional fields for completed job', () => {
    const job: RetrainingJob = {
      id: '1',
      modelId: 'model-1',
      status: 'completed',
      startTime: '2026-02-25T10:30:00Z',
      endTime: '2026-02-25T11:30:00Z',
      accuracy: 0.96,
    };

    expect(job.accuracy).toBeDefined();
    expect(job.endTime).toBeDefined();
  });
});
