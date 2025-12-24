import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Activity, RefreshCw, LogOut, Users, Database, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type ServiceStatus = 'up' | 'down' | 'degraded';
type LogLevel = 'info' | 'warn' | 'error';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  databaseSize: string;
  uptime: string;
  lastBackup: string;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Array<{
    name: string;
    status: ServiceStatus;
    responseTime: number;
  }>;
  database: ServiceStatus;
  api: ServiceStatus;
  cache: ServiceStatus;
  storage: ServiceStatus;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source: string;
}

const AdminConsole: React.FC = () => {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'logs' | 'settings'>('overview');

  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data - replace with actual API calls
      setMetrics({
        totalUsers: 42,
        activeUsers: 15,
        totalProjects: 8,
        activeProjects: 6,
        totalTasks: 156,
        completedTasks: 89,
        databaseSize: '2.4 GB',
        uptime: '7d 14h 32m',
        lastBackup: '2 hours ago'
      });

      setHealth({
        status: 'healthy',
        services: [
          { name: 'API', status: 'up', responseTime: 120 },
          { name: 'Database', status: 'up', responseTime: 45 },
          { name: 'Cache', status: 'up', responseTime: 5 },
          { name: 'Storage', status: 'up', responseTime: 30 }
        ],
        database: 'up',
        api: 'up',
        cache: 'up',
        storage: 'up'
      });

      // Mock logs
      setLogs([
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'System started successfully',
          source: 'system'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          level: 'warn',
          message: 'High CPU usage detected',
          source: 'monitoring'
        }
      ]);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleLogout = () => {
    logout();
    navigate('/menu');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading admin console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Admin Console
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            System monitoring and management dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} disabled={refreshing} variant="secondary" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={handleLogout}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          {(['overview', 'health', 'logs', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                <p className="text-xs text-gray-500">{metrics.activeUsers} active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalProjects}</div>
                <p className="text-xs text-gray-500">{metrics.activeProjects} active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalTasks}</div>
                <p className="text-xs text-gray-500">
                  {Math.round((metrics.completedTasks / metrics.totalTasks) * 100)}% complete
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
                <Database className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.databaseSize}</div>
                <p className="text-xs text-gray-500">Last backup: {metrics.lastBackup}</p>
              </CardContent>
            </Card>
          </div>

          {/* System Performance */}
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Uptime
                  </p>
                  <p className="text-2xl font-bold text-green-600">{metrics.uptime}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task Completion Rate
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round((metrics.completedTasks / metrics.totalTasks) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* HEALTH TAB */}
      {activeTab === 'health' && health && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {health.services.map((service) => (
              <Card key={service.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {service.name} Status
                  </CardTitle>
                  <div className={`${
                    service.status === 'up' ? 'text-green-600' :
                    service.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {service.status === 'up' ? <CheckCircle className="w-5 h-5" /> :
                     service.status === 'degraded' ? <AlertTriangle className="w-5 h-5" /> :
                     <AlertTriangle className="w-5 h-5" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold capitalize ${
                    service.status === 'up' ? 'text-green-600' :
                    service.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {service.status}
                  </div>
                  <p className="text-xs text-gray-500">{service.responseTime}ms response</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* LOGS TAB */}
      {activeTab === 'logs' && (
        <Card>
          <CardHeader>
            <CardTitle>System Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No logs available</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                  >
                    <div
                      className={`mt-1 ${
                        log.level === 'error'
                          ? 'text-red-600'
                          : log.level === 'warn'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                      }`}
                    >
                      {log.level === 'error' && <AlertTriangle className="w-4 h-4" />}
                      {log.level === 'warn' && <AlertTriangle className="w-4 h-4" />}
                      {log.level === 'info' && <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {log.message}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        {new Date(log.timestamp).toLocaleString()} • {log.source}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enable Debug Mode
                  </label>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enable Audit Logging
                  </label>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    defaultChecked
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Auto Backup Enabled
                  </label>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    defaultChecked
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rate Limiting
                  </label>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    defaultChecked
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminConsole;
