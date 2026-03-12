"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EVMDataPoint {
  week: number;
  date: string;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
}

interface EVMMetrics {
  spi: number; // Schedule Performance Index (EV / PV)
  cpi: number; // Cost Performance Index (EV / AC)
  sv: number; // Schedule Variance (EV - PV)
  cv: number; // Cost Variance (EV - AC)
  eta: string; // Estimated At Completion
  etcHours: number; // Estimate To Complete
}

interface EVMDashboardProps {
  projectName: string;
  projectStatus: string;
  data: EVMDataPoint[];
  metrics: EVMMetrics;
  budgetAt: number;
  scheduleAt: number;
}

function MetricCard({
  label,
  value,
  unit = "",
  status = "neutral",
  icon: Icon = TrendingUp,
}: {
  label: string;
  value: number | string;
  unit?: string;
  status?: "good" | "warning" | "bad" | "neutral";
  icon?: React.ReactNode;
}) {
  const statusColors = {
    good: "text-green-600 bg-green-50 border-green-200",
    warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
    bad: "text-red-600 bg-red-50 border-red-200",
    neutral: "text-gray-600 bg-gray-50 border-gray-200",
  };

  return (
    <div className={cn("rounded-lg border p-6", statusColors[status])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-2xl font-bold mt-2">
            {value}
            {unit && <span className="text-lg ml-1">{unit}</span>}
          </p>
        </div>
        {Icon && typeof Icon === 'function' && <Icon className="w-8 h-8 opacity-50" />}
      </div>
    </div>
  );
}

export default function EVMDashboard({
  projectName,
  projectStatus,
  data,
  metrics,
  budgetAt,
  scheduleAt,
}: EVMDashboardProps) {
  // Determine statuses
  const spiStatus = metrics.spi >= 1 ? "good" : metrics.spi >= 0.9 ? "warning" : "bad";
  const cpiStatus = metrics.cpi >= 1 ? "good" : metrics.cpi >= 0.9 ? "warning" : "bad";
  const svStatus = metrics.sv >= 0 ? "good" : "bad";
  const cvStatus = metrics.cv >= 0 ? "good" : "bad";

  const latestData = data[data.length - 1];
  const totalEarnedValue = latestData?.earnedValue || 0;
  const totalActualCost = latestData?.actualCost || 0;
  const budgetPercentage = (totalActualCost / budgetAt) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{projectName}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">{projectStatus}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Budget</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">฿{budgetAt.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Budget Utilized</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {budgetPercentage.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ETA</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{metrics.eta}</p>
          </div>
        </div>
      </div>

      {/* S-Curve Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">S-Curve: Planned vs Earned vs Actual</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="week" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
              }}
              formatter={(value) => `฿${(value as number).toLocaleString()}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="plannedValue"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorPV)"
              name="Planned Value (PV)"
            />
            <Area
              type="monotone"
              dataKey="earnedValue"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorEV)"
              name="Earned Value (EV)"
            />
            <Area
              type="monotone"
              dataKey="actualCost"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorAC)"
              name="Actual Cost (AC)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>S-Curve Interpretation:</strong> The S-Curve shows project progress over time. PV shows planned progress, 
            EV shows actual accomplishments, and AC shows actual spending. Gaps indicate schedule or cost variance.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="SPI (Schedule Performance)"
          value={metrics.spi.toFixed(2)}
          unit="(1.0 = on track)"
          status={spiStatus}
          icon={TrendingUp}
        />
        <MetricCard
          label="CPI (Cost Performance)"
          value={metrics.cpi.toFixed(2)}
          unit="(1.0 = on budget)"
          status={cpiStatus}
          icon={TrendingUp}
        />
        <MetricCard
          label="SV (Schedule Variance)"
          value={`฿${metrics.sv.toLocaleString()}`}
          status={svStatus}
          icon={Clock}
        />
        <MetricCard
          label="CV (Cost Variance)"
          value={`฿${metrics.cv.toLocaleString()}`}
          status={cvStatus}
          icon={AlertTriangle}
        />
      </div>

      {/* Variance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Schedule Analysis
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Schedule Variance</span>
                <span className={cn(
                  "text-sm font-semibold",
                  metrics.sv >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {metrics.sv >= 0 ? "+" : ""}฿{metrics.sv.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {metrics.sv >= 0 
                  ? "Project is ahead of schedule" 
                  : "Project is behind schedule"}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">SPI</span>
                <span className={cn(
                  "text-sm font-semibold",
                  metrics.spi >= 1 ? "text-green-600" : "text-red-600"
                )}>
                  {metrics.spi.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    metrics.spi >= 1 ? "bg-green-500" : "bg-red-500"
                  )}
                  style={{ width: `${Math.min(metrics.spi * 100, 100)}%` }}
                />
              </div>
            </div>

            {metrics.etcHours > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Estimated Time to Completion:</strong> {metrics.etcHours.toFixed(0)} hours
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Cost Analysis
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Cost Variance</span>
                <span className={cn(
                  "text-sm font-semibold",
                  metrics.cv >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {metrics.cv >= 0 ? "+" : ""}฿{metrics.cv.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {metrics.cv >= 0 
                  ? "Project is under budget" 
                  : "Project is over budget"}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">CPI</span>
                <span className={cn(
                  "text-sm font-semibold",
                  metrics.cpi >= 1 ? "text-green-600" : "text-red-600"
                )}>
                  {metrics.cpi.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    metrics.cpi >= 1 ? "bg-green-500" : "bg-red-500"
                  )}
                  style={{ width: `${Math.min(metrics.cpi * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Budget at Completion (BAC):</strong> ฿{budgetAt.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Project Health Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full",
              metrics.spi >= 0.95 ? "bg-green-500" : metrics.spi >= 0.85 ? "bg-yellow-500" : "bg-red-500"
            )} />
            <div>
              <p className="text-sm font-medium text-gray-700">Schedule</p>
              <p className="text-xs text-gray-600">
                {metrics.spi >= 0.95 ? "On Track" : metrics.spi >= 0.85 ? "At Risk" : "Critical"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full",
              metrics.cpi >= 0.95 ? "bg-green-500" : metrics.cpi >= 0.85 ? "bg-yellow-500" : "bg-red-500"
            )} />
            <div>
              <p className="text-sm font-medium text-gray-700">Budget</p>
              <p className="text-xs text-gray-600">
                {metrics.cpi >= 0.95 ? "On Track" : metrics.cpi >= 0.85 ? "At Risk" : "Critical"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full",
              budgetPercentage <= 80 ? "bg-green-500" : budgetPercentage <= 90 ? "bg-yellow-500" : "bg-red-500"
            )} />
            <div>
              <p className="text-sm font-medium text-gray-700">Budget Burn</p>
              <p className="text-xs text-gray-600">
                {budgetPercentage.toFixed(1)}% utilized
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
