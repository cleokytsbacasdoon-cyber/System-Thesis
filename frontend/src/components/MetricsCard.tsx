import React from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { ModelMetrics } from '../types';

interface MetricsCardProps {
  metric: ModelMetrics;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ metric }) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`rounded-lg shadow-md p-6 border-l-4 border-primary ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-dark'}`}>Model Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Accuracy</p>
          <p className="text-2xl font-bold text-primary">{(metric.accuracy * 100).toFixed(2)}%</p>
        </div>
        <div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Precision</p>
          <p className="text-2xl font-bold text-primary">{(metric.precision * 100).toFixed(2)}%</p>
        </div>
        <div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Recall</p>
          <p className="text-2xl font-bold text-secondary">{(metric.recall * 100).toFixed(2)}%</p>
        </div>
        <div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>F1 Score</p>
          <p className="text-2xl font-bold text-secondary">{(metric.f1Score * 100).toFixed(2)}%</p>
        </div>
      </div>
      <p className={`text-xs mt-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
        Last updated: {new Date(metric.timestamp).toLocaleString()}
      </p>
    </div>
  );
};
