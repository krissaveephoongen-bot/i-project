"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Filter,
  Search,
  Eye,
  CheckSquare,
  XSquare,
  Activity,
  X,
  RefreshCw,
} from "lucide-react";
import { clsx } from "clsx";
import { toast } from "react-hot-toast";
import { updateTimesheetApproval, updateExpenseApproval } from "@/app/lib/approvals";

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
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalRequest[]>([]);
  const [stats, setStats] = useState<ApprovalStats[]>([]);
  const [priorityStats, setPriorityStats] = useState<PriorityStats[]>([]);
  const [recentApprovals, setRecentApprovals] = useState<ApprovalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "history" | "stats">("pending");
  const [filterType, setFilterType] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchApprovalData = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const params = new URLSearchParams();
      if (filterType) params.append("type", filterType);
      if (filterPriority) params.append("priority", filterPriority);

      const response = await fetch(`/api/approvals/overview?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load data");
      
      const data = await response.json();
      setPendingApprovals(data.pending || []);
      setStats(data.stats || []);
      setPriorityStats(data.priorityStats || []);
      setApprovalHistory(data.history || []);
      setRecentApprovals(data.recentApprovals || []);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalData();
  }, [filterType, filterPriority]);

  const handleAction = async (request: ApprovalRequest, action: "approve" | "reject", comments?: string) => {
    try {
      const payload = { reason: comments };
      if (request.type === "timesheet") {
        await updateTimesheetApproval(request.requestId, action, payload);
      } else if (request.type === "expense") {
        await updateExpenseApproval(request.requestId, action, payload);
      } else {
        toast.error("ประเภทรายการไม่รองรับการอนุมัติในขณะนี้");
        return;
      }

      toast.success(action === "approve" ? "อนุมัติเรียบร้อย" : "ปฏิเสธรายการเรียบร้อย");
      setSelectedRequest(null);
      fetchApprovalData();
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการทำรายการ");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "timesheet": return <Clock className="w-4 h-4" />;
      case "expense": return <DollarSign className="w-4 h-4" />;
      case "task": return <CheckSquare className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "timesheet": return "bg-blue-100 text-blue-700 border-blue-200";
      case "expense": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-700 border-red-200";
      case "high": return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const filteredPendingApprovals = pendingApprovals.filter(
    (approval) =>
      approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = pendingApprovals.length;
  const urgentCount = pendingApprovals.filter((a) => a.priority === "urgent" || a.priority === "high").length;
  const totalAmount = pendingApprovals.reduce((sum, a) => sum + (a.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="ศูนย์การอนุมัติ (Approval Center)"
        breadcrumbs={[{ label: "แดชบอร์ด", href: "/" }, { label: "การอนุมัติ" }]}
      />

      <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-7xl space-y-6">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalPending}</p>
              <p className="text-sm text-slate-500">รออนุมัติทั้งหมด</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{urgentCount}</p>
              <p className="text-sm text-slate-500">ความสำคัญสูง</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.find(s => s.type === "expense")?.totalAmount?.toLocaleString() || "0"}
              </p>
              <p className="text-sm text-slate-500">ยอดเบิกจ่ายรออนุมัติ</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.find(s => s.type === "timesheet")?.totalAmount?.toLocaleString() || "0"}
              </p>
              <p className="text-sm text-slate-500">ชั่วโมงทำงานรออนุมัติ</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Tabs & Toolbar */}
          <div className="border-b border-slate-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("pending")}
                className={clsx(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  activeTab === "pending" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"
                )}
              >
                รออนุมัติ ({totalPending})
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={clsx(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  activeTab === "stats" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"
                )}
              >
                สถิติ
              </button>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button 
                onClick={fetchApprovalData}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                <RefreshCw className={clsx("w-4 h-4", isLoading && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* List Content */}
          {activeTab === "pending" && (
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
              ) : filteredPendingApprovals.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">ไม่มีรายการรออนุมัติ</h3>
                  <p className="text-slate-500">คุณจัดการงานทั้งหมดเรียบร้อยแล้ว</p>
                </div>
              ) : (
                filteredPendingApprovals.map((approval) => (
                  <div key={approval.requestId} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={clsx("px-2 py-0.5 rounded text-xs font-medium border", getTypeColor(approval.type))}>
                          {approval.type === "timesheet" ? "Timesheet" : "Expense"}
                        </span>
                        <span className={clsx("px-2 py-0.5 rounded text-xs font-medium border", getPriorityColor(approval.priority))}>
                          {approval.priority}
                        </span>
                        <span className="text-xs text-slate-400">• {new Date(approval.requestedAt).toLocaleDateString("th-TH")}</span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 truncate">{approval.title}</h3>
                      <p className="text-sm text-slate-600 truncate">{approval.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {approval.requestedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" /> {approval.projectName}
                        </span>
                        {approval.amount && (
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            {approval.type === "timesheet" ? <Clock className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                            {approval.amount.toLocaleString()} {approval.currency}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={() => setSelectedRequest(approval)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleAction(approval, "approve")}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                        title="อนุมัติ"
                      >
                        <CheckSquare className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("ระบุเหตุผลการปฏิเสธ:");
                          if (reason) handleAction(approval, "reject", reason);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                        title="ปฏิเสธ"
                      >
                        <XSquare className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Stats Content */}
          {activeTab === "stats" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold mb-4">แยกตามความสำคัญ</h3>
                <div className="space-y-3">
                  {priorityStats.map((s) => (
                    <div key={s.priority} className="flex items-center justify-between">
                      <span className="capitalize text-sm text-slate-600">{s.priority}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(s.count / totalPending) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{s.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-lg">รายละเอียดการขออนุมัติ</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">หัวข้อ</label>
                <p className="text-lg font-medium text-slate-900">{selectedRequest.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ผู้ขออนุมัติ</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-xs">
                      {selectedRequest.requestedBy.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedRequest.requestedBy}</p>
                      <p className="text-xs text-slate-500">{selectedRequest.requestedByEmail}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">วันที่</label>
                  <p className="text-sm mt-1">{new Date(selectedRequest.requestedAt).toLocaleString("th-TH")}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">รายละเอียด</label>
                <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-700">
                  {selectedRequest.description || "-"}
                </div>
              </div>

              {selectedRequest.type === "expense" && selectedRequest.metadata?.receiptUrl && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">หลักฐานแนบ</label>
                  <a 
                    href={selectedRequest.metadata.receiptUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-1 flex items-center gap-2 text-blue-600 hover:underline text-sm"
                  >
                    <FileText className="w-4 h-4" /> ดูไฟล์แนบ
                  </a>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => {
                  const reason = prompt("ระบุเหตุผลการปฏิเสธ:");
                  if (reason) handleAction(selectedRequest, "reject", reason);
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                ปฏิเสธ
              </button>
              <button
                onClick={() => handleAction(selectedRequest, "approve")}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors shadow-sm"
              >
                อนุมัติรายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
