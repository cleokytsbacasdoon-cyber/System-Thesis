import React from 'react';
import { ModelMetrics } from '../types';

interface MetricsCardProps {
  metric: ModelMetrics;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ metric }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary">
      <h3 className="text-lg font-semibold text-dark mb-4">Model Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Accuracy</p>
          <p className="text-2xl font-bold text-primary">{(metric.accuracy * 100).toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Precision</p>
          <p className="text-2xl font-bold text-primary">{(metric.precision * 100).toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Recall</p>
          <p className="text-2xl font-bold text-secondary">{(metric.recall * 100).toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">F1 Score</p>
          <p className="text-2xl font-bold text-secondary">{(metric.f1Score * 100).toFixed(2)}%</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-4">
        Last updated: {new Date(metric.timestamp).toLocaleString()}
      </p>
    </div>
  );
};
