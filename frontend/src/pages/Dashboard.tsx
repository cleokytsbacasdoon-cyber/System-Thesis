import React, { useState, useEffect, useMemo } from 'react';
import { MetricsCard } from '../components/MetricsCard';
import { DriftAlertCard } from '../components/DriftAlertCard';
import { RetrainingJobCard } from '../components/RetrainingJobCard';
import { APIEndpointCard } from '../components/APIEndpointCard';
import { MetricsChart } from '../components/MetricsChart';
import { PerformanceChart } from '../components/PerformanceChart';
import { DriftStats } from '../components/DriftStats';
import { RetrainingStats } from '../components/RetrainingStats';
import { DataExport } from '../components/DataExport';
import { Tabs } from '../components/Tabs';
import { 
  getModelMetrics, 
  getDriftAlerts, 
  getRetrainingJobs, 
  getAPIEndpoints,
  resolveDriftAlert,
  startRetrainingJob,
  checkEndpointStatus 
} from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { ModelMetrics, DriftAlert, RetrainingJob, APIEndpoint } from '../types';

interface DashboardProps {
  onSettingsClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSettingsClick }) => {
  const { addToast } = useToast();
  const [metrics, setMetrics] = useState<ModelMetrics[]>([]);
  const [alerts, setAlerts] = useState<DriftAlert[]>([]);
  const [jobs, setJobs] = useState<RetrainingJob[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshInterval, setRefreshInterval] = useState(30);

  useEffect(() => {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      setRefreshInterval(settings.refreshInterval);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsData, alertsData, jobsData, endpointsData] = await Promise.all([
        getModelMetrics(),
        getDriftAlerts(),
        getRetrainingJobs(),
        getAPIEndpoints(),
      ]);

      setMetrics(metricsData);
      setAlerts(alertsData);
      setJobs(jobsData);
      setEndpoints(endpointsData);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveDriftAlert(alertId);
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a));
      addToast('Alert resolved', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to resolve alert', 'error');
    }
  };

  const handleStartRetraining = async (modelId: string) => {
    try {
      const newJob = await startRetrainingJob(modelId);
      setJobs([newJob, ...jobs]);
      addToast('Retraining job started', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to start retraining', 'error');
    }
  };

  const handleCheckEndpoint = async (endpointId: string) => {
    try {
      const updatedEndpoint = await checkEndpointStatus(endpointId);
      setEndpoints(endpoints.map(e => e.id === endpointId ? updatedEndpoint : e));
      addToast('Endpoint checked', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to check endpoint', 'error');
    }
  };

  const latestMetric = useMemo(() => metrics.length > 0 ? metrics[0] : null, [metrics]);
  const unresolvedAlerts = useMemo(() => alerts.filter(a => !a.resolved), [alerts]);

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'metrics', label: '📈 Metrics' },
    { id: 'alerts', label: '⚠️ Alerts' },
    { id: 'retraining', label: '🔄 Retraining' },
    { id: 'api', label: '🔗 API' },
    { id: 'export', label: '📥 Export' },
  ];

  if (loading && metrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">⏳</div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-dark">ML Monitoring Dashboard</h1>
            <p className="text-gray-600 mt-2">Real-time monitoring and analytics</p>
          </div>
          <button
            onClick={() => loadData()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
          >
            🔄 Refresh
          </button>
        </div>

        <Tabs activeTab={activeTab} tabs={tabs} onTabChange={setActiveTab} />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600">Total Metrics</p>
                <p className="text-3xl font-bold text-blue-500">{metrics.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-3xl font-bold text-orange-500">{unresolvedAlerts.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                <p className="text-sm text-gray-600">Retraining Jobs</p>
                <p className="text-3xl font-bold text-green-500">{jobs.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                <p className="text-sm text-gray-600">API Endpoints</p>
                <p className="text-3xl font-bold text-purple-500">{endpoints.length}</p>
              </div>
            </div>

            {latestMetric && <MetricsCard metric={latestMetric} />}

            <DriftStats alerts={alerts} />
            <RetrainingStats jobs={jobs} />
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            {latestMetric && <PerformanceChart latest={latestMetric} />}
            {metrics.length > 0 && <MetricsChart metrics={metrics} />}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Unresolved</p>
                <p className="text-2xl font-bold text-orange-500">{unresolvedAlerts.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-500">{alerts.filter(a => a.resolved).length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">High Severity</p>
                <p className="text-2xl font-bold text-red-500">{alerts.filter(a => a.severity === 'high' && !a.resolved).length}</p>
              </div>
            </div>

            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map(alert => (
                  <DriftAlertCard 
                    key={alert.id} 
                    alert={alert} 
                    onResolve={handleResolveAlert}
                  />
                ))
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <p className="text-green-800 font-medium">✓ No active drift alerts</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Retraining Tab */}
        {activeTab === 'retraining' && (
          <div className="space-y-6">
            <RetrainingStats jobs={jobs} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.length > 0 ? (
                jobs.map(job => (
                  <RetrainingJobCard 
                    key={job.id} 
                    job={job} 
                    onRetrain={handleStartRetraining}
                  />
                ))
              ) : (
                <div className="col-span-full bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-gray-600">No retraining jobs</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* API Tab */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Total Endpoints</p>
                <p className="text-3xl font-bold text-blue-500">{endpoints.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-500">{endpoints.filter(e => e.status === 'active').length}</p>
              </div>
            </div>

            <div className="space-y-4">
              {endpoints.length > 0 ? (
                endpoints.map(endpoint => (
                  <APIEndpointCard 
                    key={endpoint.id} 
                    endpoint={endpoint} 
                    onCheck={handleCheckEndpoint}
                  />
                ))
              ) : (
                <p className="text-gray-600">No endpoints found</p>
              )}
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <DataExport 
              metrics={metrics}
              alerts={alerts}
              jobs={jobs}
              endpoints={endpoints}
            />
          </div>
        )}
      </div>
    </div>
  );
};
