import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { ModelMetrics } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PerformanceChartProps {
  latest: ModelMetrics | null;
  title?: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ latest, title = 'Latest Model Performance' }) => {
  if (!latest) {
    return <div className="bg-gray-100 p-4 rounded text-center text-gray-600">No data available</div>;
  }

  const data = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
    datasets: [
      {
        label: 'Score (%)',
        data: [
          Number((latest.accuracy * 100).toFixed(2)),
          Number((latest.precision * 100).toFixed(2)),
          Number((latest.recall * 100).toFixed(2)),
          Number((latest.f1Score * 100).toFixed(2)),
        ],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#8B5CF6',
        ],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: { size: 16, weight: 'bold' as any },
      },
    },
    scales: {
      x: {
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Bar data={data} options={options} />
    </div>
  );
};
