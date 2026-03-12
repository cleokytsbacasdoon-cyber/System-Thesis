import React, { useState, useEffect, useMemo } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { MetricsCard } from '../components/MetricsCard';
import { DriftAlertCard } from '../components/DriftAlertCard';
import { RetrainingJobCard } from '../components/RetrainingJobCard';
import { APIEndpointCard } from '../components/APIEndpointCard';
import { MetricsChart } from '../components/MetricsChart';
import { PerformanceChart } from '../components/PerformanceChart';
import { DriftStats } from '../components/DriftStats';
import { RetrainingStats } from '../components/RetrainingStats';
import { DataExport } from '../components/DataExport';
import { ModelRegistry } from '../components/ModelRegistry';
import { DataQualityDashboard } from '../components/DataQualityDashboard';
import { AccuracyMonitoring } from '../components/AccuracyMonitoring';
import { ModelInsights } from '../components/ModelInsights';
import { TabNavigation } from '../components/TabNavigation';
import { 
  getForecastMetrics, 
  getDemandAlerts, 
  getRetrainingJobs, 
  getAPIEndpoints,
  getModelVersions,
  getDataQuality,
  getDemandForecasts,
  getFeatureImportance,
  getForecastInsights,
  resolveDemandAlert,
  startRetrainingJob,
  checkEndpointStatus 
} from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
  ForecastMetrics,
  DemandAlert,
  RetrainingJob,
  APIEndpoint,
  ModelVersion,
  DataQuality,
  DemandForecast,
  FeatureImportance,
  ForecastInsights as ForecastInsightsType,
} from '../types';

interface DashboardProps {
  onSettingsClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSettingsClick }) => {
  const { addToast } = useToast();
  const { isDarkMode } = useDarkMode();
  const [metrics, setMetrics] = useState<ForecastMetrics[]>([]);
  const [alerts, setAlerts] = useState<DemandAlert[]>([]);
  const [jobs, setJobs] = useState<RetrainingJob[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [modelVersions, setModelVersions] = useState<ModelVersion[]>([]);
  const [dataQuality, setDataQuality] = useState<DataQuality | null>(null);
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [features, setFeatures] = useState<FeatureImportance[]>([]);
  const [_forecastInsights, setForecastInsights] = useState<ForecastInsightsType | null>(null);
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
      const [metricsData, alertsData, jobsData, endpointsData, versionsData, qualityData, forecastsData, featuresData, insightsData] = await Promise.all([
        getForecastMetrics(),
        getDemandAlerts(),
        getRetrainingJobs(),
        getAPIEndpoints(),
        getModelVersions(),
        getDataQuality(),
        getDemandForecasts(),
        getFeatureImportance(),
        getForecastInsights(),
      ]);

      setMetrics(metricsData);
      setAlerts(alertsData);
      setJobs(jobsData);
      setEndpoints(endpointsData);
      setModelVersions(versionsData);
      setDataQuality(qualityData);
      setForecasts(forecastsData);
      setFeatures(featuresData);
      setForecastInsights(insightsData);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveDemandAlert(alertId);
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

  const tabGroups = [
    {
      category: 'Monitoring',
      tabs: [
        { id: 'overview', label: '📊 Overview' },
        { id: 'metrics', label: '📈 Metrics' },
        { id: 'alerts', label: '⚠️ Alerts' },
      ],
    },
    {
      category: 'Operations',
      tabs: [
        { id: 'retraining', label: '🔄 Retraining' },
        { id: 'api', label: '🔗 API' },
      ],
    },
    {
      category: 'Analytics',
      tabs: [
        { id: 'registry', label: '📦 Registry' },
        { id: 'quality', label: '✅ Quality' },
        { id: 'accuracy', label: '🎯 Accuracy' },
        { id: 'insights', label: '💡 Insights' },
      ],
    },
    {
      category: 'Utilities',
      tabs: [{ id: 'export', label: '📥 Export' }],
    },
  ];

  if (loading && metrics.length === 0) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDarkMode ? 'dark' : ''}`}>
        <div className="text-center">
          <div className="animate-spin mb-4">⏳</div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}>Tourism Demand Forecasting Dashboard</h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Real-time accommodation demand monitoring and forecasting</p>
          </div>
          <div className="flex items-center gap-4 border border-transparent rounded p-1">
            <button
              onClick={() => loadData()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
            >
              🔄 Refresh
            </button>
            <button
              onClick={onSettingsClick}
              className={`px-4 py-2 rounded-lg transition ${isDarkMode ? 'bg-slate-700 text-gray-200 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              ⚙ Settings
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 py-2 rounded-lg transition ${activeTab === 'export' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              📥 Export
            </button>
          </div>
        </div>

        <TabNavigation 
          activeTab={activeTab} 
          tabGroups={tabGroups} 
          onTabChange={setActiveTab} 
        />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className={`space-y-6 rounded-lg p-6 ${isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white border'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`rounded-lg shadow p-4 border-l-4 border-blue-500 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Forecast Accuracy</p>
                <p className="text-3xl font-bold text-blue-500">{metrics.length}</p>
              </div>
              <div className={`rounded-lg shadow p-4 border-l-4 border-orange-500 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Demand Alerts</p>
                <p className="text-3xl font-bold text-orange-500">{unresolvedAlerts.length}</p>
              </div>
              <div className={`rounded-lg shadow p-4 border-l-4 border-green-500 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Retraining Jobs</p>
                <p className="text-3xl font-bold text-green-500">{jobs.length}</p>
              </div>
              <div className={`rounded-lg shadow p-4 border-l-4 border-purple-500 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Data Endpoints</p>
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
          <div className={`space-y-6 rounded-lg p-6 ${isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white border'}`}>
            {latestMetric && <PerformanceChart latest={latestMetric} />}
            {metrics.length > 0 && <MetricsChart metrics={metrics} />}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className={`space-y-6 rounded-lg p-6 ${isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white border'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`rounded-lg shadow p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Alerts</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : ''}`}>{alerts.length}</p>
              </div>
              <div className={`rounded-lg shadow p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Unresolved</p>
                <p className="text-2xl font-bold text-orange-500">{unresolvedAlerts.length}</p>
              </div>
              <div className={`rounded-lg shadow p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Resolved</p>
                <p className="text-2xl font-bold text-green-500">{alerts.filter(a => a.resolved).length}</p>
              </div>
              <div className={`rounded-lg shadow p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>High Severity</p>
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
                <div className={`border rounded-lg p-6 text-center ${isDarkMode ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'}`}>
                  <p className={`font-medium ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>✓ No active demand alerts</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Retraining Tab */}
        {activeTab === 'retraining' && (
          <div className={`space-y-6 rounded-lg p-6 ${isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white border'}`}>
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
                <div className={`col-span-full rounded-lg p-8 text-center ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No retraining jobs</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* API Tab */}
        {activeTab === 'api' && (
          <div className={`space-y-6 rounded-lg p-6 ${isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white border'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`rounded-lg shadow p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Endpoints</p>
                <p className="text-3xl font-bold text-blue-500">{endpoints.length}</p>
              </div>
              <div className={`rounded-lg shadow p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active</p>
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
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No endpoints found</p>
              )}
            </div>
          </div>
        )}

        {/* Model Registry Tab */}
        {activeTab === 'registry' && modelVersions.length > 0 && (
          <div className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <ModelRegistry versions={modelVersions} />
          </div>
        )}

        {/* Data Quality Tab */}
        {activeTab === 'quality' && dataQuality && (
          <div className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <DataQualityDashboard quality={dataQuality} />
          </div>
        )}

        {/* Accuracy Monitoring Tab */}
        {activeTab === 'accuracy' && forecasts.length > 0 && (
          <div className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <AccuracyMonitoring forecasts={forecasts} />
          </div>
        )}

        {/* Model Insights Tab */}
        {activeTab === 'insights' && features.length > 0 && forecasts.length > 0 && (
          <div className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <ModelInsights features={features} forecasts={forecasts} />
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
