import React from 'react';
import { RetrainingJob } from '../types';

interface RetrainingJobCardProps {
  job: RetrainingJob;
  onRetrain: (modelId: string) => void;
}

export const RetrainingJobCard: React.FC<RetrainingJobCardProps> = ({ job, onRetrain }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-dark">{job.modelId}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Start: {new Date(job.startTime).toLocaleString()}
        </p>
        {job.endTime && (
          <p className="text-sm text-gray-600">
            End: {new Date(job.endTime).toLocaleString()}
          </p>
        )}
        {job.accuracy !== undefined && (
          <p className="text-sm text-gray-600">
            Accuracy: <span className="font-semibold">{(job.accuracy * 100).toFixed(2)}%</span>
          </p>
        )}
        {job.errorMessage && (
          <p className="text-sm text-red-600">Error: {job.errorMessage}</p>
        )}
      </div>

      <button
        onClick={() => onRetrain(job.modelId)}
        className="mt-4 w-full px-4 py-2 bg-primary text-white rounded hover:bg-blue-600"
      >
        Start New Retraining
      </button>
    </div>
  );
};
