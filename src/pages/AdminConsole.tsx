import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Users,
  Database,
  Shield,
  Settings,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw,
  Lock,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPINModal from '@/components/AdminPINModal';
import { useAdminPIN } from '@/contexts/AdminPINContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ADMIN_ENDPOINTS } from '@/config/admin-config';

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
  database: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  cache: 'healthy' | 'warning' | 'critical';
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  user?: string;
  action?: string;
}

export default function AdminConsole() {
  const navigate = useNavigate();
  const { isPINVerified, verifyPIN, clearPINVerification, isSessionExpired } = useAdminPIN();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'logs' | 'settings'>('overview');
  const [showPINModal, setShowPINModal] = useState(!isPINVerified);
  const [sessionWarning, setSessionWarning] = useState(false);

  // Check PIN verification and session
  useEffect(() => {
    if (!isPINVerified) {
      setShowPINModal(true);
      setLoading(false);
      return;
    }

    // Check if session is expired
    if (isSessionExpired()) {
      setSessionWarning(true);
      clearPINVerification();
      return;
    }

    // Fetch metrics only if PIN is verified
    const fetchMetrics = async () => {
      try {
        setLoading(true);

        const [metricsRes, healthRes, logsRes] = await Promise.all([
          fetch(ADMIN_ENDPOINTS.METRICS, { credentials: 'include' }),
          fetch(ADMIN_ENDPOINTS.HEALTH, { credentials: 'include' }),
          fetch(`${ADMIN_ENDPOINTS.LOGS}?limit=50`, { credentials: 'include' }),
        ]);

        if (metricsRes.ok) {
          const data = await metricsRes.json();
          setMetrics(data);
        }

        if (healthRes.ok) {
          const data = await healthRes.json();
          setHealth(data);
        }

        if (logsRes.ok) {
          const data = await logsRes.json();
          setLogs(Array.isArray(data) ? data : data.data || []);
        }
      } catch (error) {
        console.error('Error fetching admin metrics:', error);
        toast.error('Failed to load admin metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [isPINVerified, isSessionExpired, clearPINVerification]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const [metricsRes, healthRes, logsRes] = await Promise.all([
        fetch(ADMIN_ENDPOINTS.METRICS, { credentials: 'include' }),
        fetch(ADMIN_ENDPOINTS.HEALTH, { credentials: 'include' }),
        fetch(`${ADMIN_ENDPOINTS.LOGS}?limit=50`, { credentials: 'include' }),
      ]);

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }

      if (healthRes.ok) {
        const data = await healthRes.json();
        setHealth(data);
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(Array.isArray(data) ? data : data.data || []);
      }

      toast.success('Metrics refreshed');
    } catch (error) {
      toast.error('Failed to refresh metrics');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDatabaseMaintenance = async () => {
    try {
      const response = await fetch(ADMIN_ENDPOINTS.MAINTENANCE_DATABASE, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Maintenance failed');
      toast.success('Database maintenance completed');
      handleRefresh();
    } catch (error) {
      toast.error('Database maintenance failed');
    }
  };

  const handleClearCache = async () => {
    try {
      const response = await fetch(ADMIN_ENDPOINTS.CACHE_CLEAR, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Cache clear failed');
      toast.success('Cache cleared');
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  // Handle PIN verification success
  const handlePINSuccess = () => {
    verifyPIN();
    setShowPINModal(false);
    toast.success('Admin Console unlocked');
  };

  // Handle PIN modal close
  const handlePINModalClose = () => {
    if (!isPINVerified) {
      navigate('/menu');
    } else {
      setShowPINModal(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    clearPINVerification();
    navigate('/menu');
    toast.success('Admin Console session ended');
  };

  // Show PIN modal if not verified
  if (showPINModal || !isPINVerified) {
    return (
      <div className="fixed inset-0 z-0">
        <AdminPINModal
          isOpen={showPINModal || !isPINVerified}
          onClose={handlePINModalClose}
          onSuccess={handlePINSuccess}
        />
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
            <p className="text-gray-600 dark:text-gray-400">Admin Console requires PIN verification</p>
          </div>
        </div>
      </div>
    );
  }

  // Show session expired warning
  if (sessionWarning) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center items-center min-h-screen"
      >
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-16 h-16 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Session Expired</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Your PIN verification session has expired. Please verify again.
          </p>
          <Button
            onClick={() => {
              setSessionWarning(false);
              setShowPINModal(true);
            }}
            className="w-full"
          >
            Verify PIN Again
          </Button>
        </div>
      </motion.div>
    );
  }

  if (loading) {
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
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
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
            End Session
          </Button>
        </div>
      </div>

      {/* Security Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="font-semibold text-green-900 dark:text-green-100">Admin Console Secured</p>
            <p className="text-sm text-green-700 dark:text-green-300">PIN verified - Session active</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-green-600 dark:text-green-400 font-mono">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </motion.div>

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
                <Zap className="h-4 w-4 text-purple-600" />
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
            {Object.entries(health).map(([service, status]) => (
              <Card key={service}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {service} Status
                  </CardTitle>
                  <div className={`${getHealthColor(status)}`}>
                    {getHealthIcon(status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold capitalize ${getHealthColor(status)}`}>
                    {status}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Maintenance Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleDatabaseMaintenance}
                variant="outline"
                className="w-full justify-start"
              >
                <Database className="w-4 h-4 mr-2" />
                Run Database Maintenance
              </Button>
              <Button onClick={handleClearCache} variant="outline" className="w-full justify-start">
                <Zap className="w-4 h-4 mr-2" />
                Clear Application Cache
              </Button>
            </CardContent>
          </Card>
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
                          : log.level === 'warning'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                      }`}
                    >
                      {log.level === 'error' && <AlertTriangle className="w-4 h-4" />}
                      {log.level === 'warning' && <AlertTriangle className="w-4 h-4" />}
                      {log.level === 'info' && <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {log.action || log.message}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        {new Date(log.timestamp).toLocaleString()} {log.user && `• ${log.user}`}
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

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Session Duration (minutes)
                </label>
                <input
                  type="number"
                  defaultValue="480"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Upload Size (MB)
                </label>
                <input
                  type="number"
                  defaultValue="100"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
