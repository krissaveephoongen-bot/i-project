"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import EVMDashboard from "@/app/components/EVMDashboard";
import { BarChart, TrendingUp, Download } from "lucide-react";

// Mock EVM data - would be fetched from API
const mockEVMData = [
  { week: 1, date: "2026-01-06", plannedValue: 50000, earnedValue: 45000, actualCost: 48000 },
  { week: 2, date: "2026-01-13", plannedValue: 100000, earnedValue: 95000, actualCost: 98000 },
  { week: 3, date: "2026-01-20", plannedValue: 150000, earnedValue: 145000, actualCost: 142000 },
  { week: 4, date: "2026-01-27", plannedValue: 200000, earnedValue: 190000, actualCost: 188000 },
  { week: 5, date: "2026-02-03", plannedValue: 250000, earnedValue: 235000, actualCost: 240000 },
  { week: 6, date: "2026-02-10", plannedValue: 300000, earnedValue: 280000, actualCost: 285000 },
  { week: 7, date: "2026-02-17", plannedValue: 350000, earnedValue: 320000, actualCost: 330000 },
  { week: 8, date: "2026-02-24", plannedValue: 400000, earnedValue: 360000, actualCost: 375000 },
];

const mockMetrics = {
  spi: 0.9, // 90% Schedule Performance
  cpi: 0.96, // 96% Cost Performance
  sv: -40000, // Schedule Variance (negative = behind)
  cv: -15000, // Cost Variance (negative = over budget)
  eta: "April 15, 2026",
  etcHours: 2400,
};

const budgetAt = 1200000; // Total budget

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [reportType, setReportType] = useState<"evm" | "resources" | "risks">("evm");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">
            Project performance metrics, KPIs, and trends
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Report Type Tabs */}
          <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex gap-2">
              <button
                onClick={() => setReportType("evm")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  reportType === "evm"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                EVM Analytics
              </button>
              <button
                onClick={() => setReportType("resources")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  reportType === "resources"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <BarChart className="w-4 h-4" />
                Resource Analysis
              </button>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>

          {/* Report Content */}
          {reportType === "evm" && (
            <EVMDashboard
              projectName="จัดหารถครัวประกอบอาหารชนิด 6 ล้อ"
              projectStatus="in_progress"
              data={mockEVMData}
              metrics={mockMetrics}
              budgetAt={budgetAt}
              scheduleAt={400000}
            />
          )}

          {reportType === "resources" && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resource Utilization</h2>
              <div className="text-center py-12 text-gray-500">
                <BarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Resource analysis coming soon</p>
              </div>
            </div>
          )}

          {/* Additional Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Analysis */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Trend Analysis</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Schedule Trend</p>
                  <p className="text-lg font-semibold text-red-600">
                    Declining (-0.5% per week)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Project is slipping further behind schedule
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">Cost Trend</p>
                  <p className="text-lg font-semibold text-red-600">
                    Increasing (+2% per week)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Cost growth is accelerating
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">Forecast at Completion</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ฿1,285,000
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    +฿85,000 over initial budget
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-4">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900">
                    📋 Increase team capacity
                  </p>
                  <p className="text-xs text-yellow-800 mt-1">
                    Add resources to critical path to recover schedule
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900">
                    💰 Review expenses
                  </p>
                  <p className="text-xs text-yellow-800 mt-1">
                    Identify and eliminate non-essential costs
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900">
                    ⚠️ Escalate risks
                  </p>
                  <p className="text-xs text-yellow-800 mt-1">
                    Present findings to project sponsor for mitigation
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Quality Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> EVM metrics are based on task progress updates and actual time logs. 
              Ensure timesheets are submitted and tasks are regularly updated for accurate reporting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
