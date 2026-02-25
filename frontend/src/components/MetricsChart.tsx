import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { ModelMetrics } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface MetricsChartProps {
  metrics: ModelMetrics[];
  title?: string;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ metrics, title = 'Model Metrics Over Time' }) => {
  if (metrics.length === 0) {
    return <div className="bg-gray-100 p-4 rounded text-center text-gray-600">No data available</div>;
  }

  const last10Metrics = metrics.slice(-10).reverse();
  const labels = last10Metrics.map((m, i) => `${i + 1}`);

  const data = {
    labels,
    datasets: [
      {
        label: 'Accuracy',
        data: last10Metrics.map(m => (m.accuracy * 100).toFixed(2)),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Precision',
        data: last10Metrics.map(m => (m.precision * 100).toFixed(2)),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Recall',
        data: last10Metrics.map(m => (m.recall * 100).toFixed(2)),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Line data={data} options={options} />
    </div>
  );
};
