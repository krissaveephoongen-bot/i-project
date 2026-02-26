import React, { useState, useEffect } from "react";

interface DatabaseStatusProps {
  onStatusChange?: (isHealthy: boolean) => void;
  showDetails?: boolean;
  compact?: boolean;
}

interface HealthStatus {
  status: "healthy" | "unhealthy" | "error" | "loading";
  message?: string;
  database?: string;
  provider?: string;
  currentTime?: string;
  postgresVersion?: string;
  error?: string;
  lastChecked?: string;
}

export const DatabaseStatus: React.FC<DatabaseStatusProps> = ({
  onStatusChange,
  showDetails = false,
  compact = false,
}) => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    status: "loading",
    message: "Checking database connection...",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkDatabaseHealth = async () => {
    try {
      setIsRefreshing(true);
      setHealthStatus((prev) => ({
        ...prev,
        status: "loading",
        message: "Checking database connection...",
        lastChecked: new Date().toISOString(),
      }));

      const response = await fetch("/api/health/db");
      const data = await response.json();

      if (data.success && data.data.status === "healthy") {
        const statusData = {
          status: "healthy" as const,
          message: "Database connection is healthy and ready for operations",
          database: data.data.database,
          provider: data.data.provider,
          currentTime: data.data.currentTime,
          postgresVersion: data.data.postgresVersion,
          lastChecked: new Date().toISOString(),
        };
        setHealthStatus(statusData);
        onStatusChange?.(true);
      } else {
        const statusData = {
          status: "unhealthy" as const,
          message: data.message || "Database connection is unhealthy",
          error: data.error || "Unknown error",
          lastChecked: new Date().toISOString(),
        };
        setHealthStatus(statusData);
        onStatusChange?.(false);
      }
    } catch (error) {
      const statusData = {
        status: "error" as const,
        message: "Failed to check database health",
        error: error instanceof Error ? error.message : "Network error",
        lastChecked: new Date().toISOString(),
      };
      setHealthStatus(statusData);
      onStatusChange?.(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkDatabaseHealth();

    // Check every 30 seconds
    const interval = setInterval(checkDatabaseHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (healthStatus.status) {
      case "healthy":
        return "bg-green-500";
      case "unhealthy":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "loading":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (healthStatus.status) {
      case "healthy":
        return "Healthy";
      case "unhealthy":
        return "Unhealthy";
      case "error":
        return "Error";
      case "loading":
        return "Checking...";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = () => {
    switch (healthStatus.status) {
      case "healthy":
        return "check-circle";
      case "unhealthy":
        return "alert-triangle";
      case "error":
        return "alert-circle";
      case "loading":
        return "loader";
      default:
        return "help-circle";
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleString("th-TH", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
        <div
          className={`w-2 h-2 rounded-full ${getStatusColor()} ${healthStatus.status === "loading" ? "animate-pulse" : ""}`}
        ></div>
        <span className="text-xs font-medium">
          {getStatusText()} -{" "}
          {healthStatus.message?.split(" ").slice(0, 3).join(" ")}...
        </span>
        <button
          onClick={checkDatabaseHealth}
          disabled={isRefreshing}
          className={`text-xs ${isRefreshing ? "animate-spin" : ""}`}
          title="Refresh status"
        >
          <div className="icon-refresh-cw"></div>
        </button>
      </div>
    );
  }

  return (
    <div className="database-status-component bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center space-x-3 p-4">
        <div
          className={`w-4 h-4 rounded-full ${getStatusColor()} ${healthStatus.status === "loading" ? "animate-pulse" : ""} flex items-center justify-center`}
        >
          {healthStatus.status !== "loading" && (
            <div className={`icon-${getStatusIcon()} text-white text-xs`}></div>
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900">
            Database Status:{" "}
            <span className="font-semibold">{getStatusText()}</span>
          </div>
          {healthStatus.message && (
            <div className="text-xs text-gray-600 mt-1">
              {healthStatus.message}
            </div>
          )}
        </div>
        <button
          onClick={checkDatabaseHealth}
          disabled={isRefreshing}
          className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${isRefreshing ? "animate-spin" : ""}`}
          title="Refresh status"
        >
          <div className="icon-refresh-cw text-gray-600"></div>
        </button>
      </div>

      {showDetails && healthStatus.status === "healthy" && (
        <div className="mt-2 p-4 bg-green-50 rounded-lg text-xs border-t border-green-100">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <div className="icon-database text-green-600"></div>
              <div>
                <div className="text-gray-500 text-xs">Provider</div>
                <div className="font-medium text-green-700">
                  {healthStatus.provider}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="icon-server text-green-600"></div>
              <div>
                <div className="text-gray-500 text-xs">Database</div>
                <div className="font-medium text-green-700">
                  {healthStatus.database}
                </div>
              </div>
            </div>
            <div className="col-span-2 flex items-center space-x-2">
              <div className="icon-info text-green-600"></div>
              <div>
                <div className="text-gray-500 text-xs">Version</div>
                <div className="font-medium text-green-700 text-xs">
                  {healthStatus.postgresVersion}
                </div>
              </div>
            </div>
            <div className="col-span-2 flex items-center space-x-2">
              <div className="icon-clock text-green-600"></div>
              <div>
                <div className="text-gray-500 text-xs">Server Time</div>
                <div className="font-medium text-green-700 text-xs">
                  {healthStatus.currentTime}
                </div>
              </div>
            </div>
            <div className="col-span-2 flex items-center space-x-2 pt-2 border-t border-green-100 mt-2">
              <div className="icon-check-circle text-green-600"></div>
              <div className="text-green-700 text-xs">
                Last checked: {formatTime(healthStatus.lastChecked)}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetails &&
        healthStatus.status !== "healthy" &&
        healthStatus.error && (
          <div className="mt-2 p-4 bg-red-50 rounded-lg text-xs border-t border-red-100">
            <div className="flex items-center space-x-2 text-red-700">
              <div className="icon-alert-triangle text-red-600"></div>
              <div>
                <div className="font-medium">Connection Issue</div>
                <div className="mt-1 text-red-600">{healthStatus.error}</div>
                <div className="mt-2 text-red-500 text-xs">
                  Last checked: {formatTime(healthStatus.lastChecked)}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default DatabaseStatus;
