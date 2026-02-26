"use client";

import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";

import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Filter,
  Search,
  Eye,
  CheckSquare,
  XSquare,
  BarChart3,
  Activity,
  X,
} from "lucide-react";
import { clsx } from "clsx";

interface ApprovalRequest {
  requestId: string;
  type: "timesheet" | "expense" | "task" | "purchase_order";
  title: string;
  description?: string;
  requestedBy: string;
  requestedByEmail: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "medium" | "high" | "urgent";
  amount?: number;
  currency?: string;
  projectName?: string;
  metadata?: any;
}

interface ApprovalStats {
  type: string;
  status: string;
  count: number;
  totalAmount?: number;
}

interface PriorityStats {
  priority: string;
  count: number;
}

export default function ApprovalDashboard() {
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>(
    [],
  );
  const [approvalHistory, setApprovalHistory] = useState<ApprovalRequest[]>([]);
  const [stats, setStats] = useState<ApprovalStats[]>([]);
  const [priorityStats, setPriorityStats] = useState<PriorityStats[]>([]);
  const [recentApprovals, setRecentApprovals] = useState<ApprovalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<ApprovalRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "history" | "stats">(
    "pending",
  );
  const [filterType, setFilterType] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchApprovalData();
  }, [filterType, filterPriority]);

  const fetchApprovalData = async () => {
    try {
      setIsLoading(true);

      // Get pending approvals
      const pendingResponse = await fetch(
        `/api/approval/pending?type=${filterType}&priority=${filterPriority}`,
      );
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingApprovals(pendingData);
      }

      // Get approval statistics
      const statsResponse = await fetch("/api/approval/stats");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats || []);
        setPriorityStats(statsData.priorityStats || []);
        setRecentApprovals(statsData.recentApprovals || []);
      }

      // Get approval history
      const historyResponse = await fetch("/api/approval/history");
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setApprovalHistory(historyData);
      }
    } catch (err) {
      setError("Failed to load approval data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId: string, comments?: string) => {
    try {
      const response = await fetch(`/api/approval/${requestId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("staffToken") || localStorage.getItem("vendorToken")}`,
        },
        body: JSON.stringify({ comments }),
      });

      if (response.ok) {
        fetchApprovalData();
        setSelectedRequest(null);
      } else {
        setError("Failed to approve request");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleReject = async (requestId: string, comments: string) => {
    try {
      const response = await fetch(`/api/approval/${requestId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("staffToken") || localStorage.getItem("vendorToken")}`,
        },
        body: JSON.stringify({ comments }),
      });

      if (response.ok) {
        fetchApprovalData();
        setSelectedRequest(null);
      } else {
        setError("Failed to reject request");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "timesheet":
        return <Clock className="w-4 h-4" />;
      case "expense":
        return <DollarSign className="w-4 h-4" />;
      case "task":
        return <CheckSquare className="w-4 h-4" />;
      case "purchase_order":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "timesheet":
        return "bg-blue-100 text-blue-700";
      case "expense":
        return "bg-green-100 text-green-700";
      case "task":
        return "bg-purple-100 text-purple-700";
      case "purchase_order":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredPendingApprovals = pendingApprovals.filter(
    (approval) =>
      approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPending = pendingApprovals.length;
  const urgentCount = pendingApprovals.filter(
    (a) => a.priority === "urgent",
  ).length;
  const highCount = pendingApprovals.filter(
    (a) => a.priority === "high",
  ).length;
  const totalAmount = pendingApprovals.reduce(
    (sum, a) => sum + (a.amount || 0),
    0,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading approval dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-slate-600" />
              <h1 className="text-xl font-semibold text-slate-900">
                Approval Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search approvals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {totalPending}
                </p>
                <p className="text-sm text-slate-600">Pending Approvals</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {urgentCount + highCount}
                </p>
                <p className="text-sm text-slate-600">High Priority</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ฿{totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-slate-600">Total Amount</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {recentApprovals.length}
                </p>
                <p className="text-sm text-slate-600">Recent Actions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={clsx(
                "py-2 px-1 border-b-2 font-medium text-sm",
                activeTab === "pending"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300",
              )}
            >
              Pending Approvals ({totalPending})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={clsx(
                "py-2 px-1 border-b-2 font-medium text-sm",
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300",
              )}
            >
              Approval History
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={clsx(
                "py-2 px-1 border-b-2 font-medium text-sm",
                activeTab === "stats"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300",
              )}
            >
              Statistics
            </button>
          </nav>
        </div>

        {/* Filters */}
        {activeTab === "pending" && (
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="timesheet">Timesheet</option>
                <option value="expense">Expense</option>
                <option value="task">Task</option>
                <option value="purchase_order">Purchase Order</option>
              </select>
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        )}

        {/* Pending Approvals */}
        {activeTab === "pending" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Pending Approvals
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredPendingApprovals.length === 0 ? (
                <div className="text-center py-12">
                  <CheckSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No Pending Approvals
                  </h3>
                  <p className="text-slate-600">
                    All approvals are up to date!
                  </p>
                </div>
              ) : (
                filteredPendingApprovals.map((approval) => (
                  <div
                    key={approval.requestId}
                    className="p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getTypeIcon(approval.type)}
                          <h3 className="text-base font-medium text-slate-900">
                            {approval.title}
                          </h3>
                          <span
                            className={clsx(
                              "px-2 py-1 rounded text-xs font-medium",
                              getTypeColor(approval.type),
                            )}
                          >
                            {approval.type.replace("_", " ")}
                          </span>
                          <span
                            className={clsx(
                              "px-2 py-1 rounded text-xs font-medium",
                              getPriorityColor(approval.priority),
                            )}
                          >
                            {approval.priority}
                          </span>
                        </div>
                        {approval.description && (
                          <p className="text-sm text-slate-600 mb-3">
                            {approval.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {approval.requestedBy} ({approval.requestedByEmail})
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(
                              approval.requestedAt,
                            ).toLocaleDateString()}
                          </span>
                          {approval.projectName && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {approval.projectName}
                            </span>
                          )}
                          {approval.amount && (
                            <span className="flex items-center gap-1 font-medium text-slate-900">
                              <DollarSign className="w-3 h-3" />
                              {approval.currency}{" "}
                              {approval.amount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setSelectedRequest(approval)}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(approval.requestId)}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setSelectedRequest({
                              ...approval,
                              action: "reject",
                            } as any)
                          }
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Approval History */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Approval History
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {approvalHistory.map((approval) => (
                <div
                  key={approval.requestId}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(approval.type)}
                        <h3 className="text-base font-medium text-slate-900">
                          {approval.title}
                        </h3>
                        <span
                          className={clsx(
                            "px-2 py-1 rounded text-xs font-medium",
                            getTypeColor(approval.type),
                          )}
                        >
                          {approval.type.replace("_", " ")}
                        </span>
                        <span
                          className={clsx(
                            "px-2 py-1 rounded text-xs font-medium",
                            getStatusColor(approval.status),
                          )}
                        >
                          {approval.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {approval.requestedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(approval.requestedAt).toLocaleDateString()}
                        </span>
                        {approval.amount && (
                          <span className="flex items-center gap-1 font-medium text-slate-900">
                            <DollarSign className="w-3 h-3" />
                            {approval.currency}{" "}
                            {approval.amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Approval Statistics
              </h3>
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getTypeIcon(stat.type)}
                      <div>
                        <p className="text-sm font-medium text-slate-900 capitalize">
                          {stat.type.replace("_", " ")}
                        </p>
                        <p className="text-xs text-slate-600">{stat.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {stat.count}
                      </p>
                      {stat.totalAmount && (
                        <p className="text-xs text-slate-600">
                          ฿{stat.totalAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Priority Breakdown
              </h3>
              <div className="space-y-4">
                {priorityStats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={clsx(
                          "w-3 h-3 rounded-full",
                          getPriorityColor(stat.priority),
                        )}
                      />
                      <p className="text-sm font-medium text-slate-900 capitalize">
                        {stat.priority}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {stat.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Approval Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Approval Details
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getTypeIcon(selectedRequest.type)}
                  <h4 className="text-lg font-medium text-slate-900">
                    {selectedRequest.title}
                  </h4>
                  <span
                    className={clsx(
                      "px-2 py-1 rounded text-xs font-medium",
                      getTypeColor(selectedRequest.type),
                    )}
                  >
                    {selectedRequest.type.replace("_", " ")}
                  </span>
                  <span
                    className={clsx(
                      "px-2 py-1 rounded text-xs font-medium",
                      getPriorityColor(selectedRequest.priority),
                    )}
                  >
                    {selectedRequest.priority}
                  </span>
                </div>

                {selectedRequest.description && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Description
                    </p>
                    <p className="text-sm text-slate-600">
                      {selectedRequest.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Requested By
                    </p>
                    <p className="text-sm text-slate-900">
                      {selectedRequest.requestedBy}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedRequest.requestedByEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Requested At
                    </p>
                    <p className="text-sm text-slate-900">
                      {new Date(selectedRequest.requestedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedRequest.projectName && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Project
                    </p>
                    <p className="text-sm text-slate-900">
                      {selectedRequest.projectName}
                    </p>
                  </div>
                )}

                {selectedRequest.amount && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Amount
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {selectedRequest.currency}{" "}
                      {selectedRequest.amount.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              {selectedRequest.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      const comments = prompt(
                        "Please enter rejection comments:",
                      );
                      if (comments) {
                        handleReject(selectedRequest.requestId, comments);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest.requestId)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
