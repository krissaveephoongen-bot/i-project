"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/app/components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Search, Filter, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useThaiLocale } from "@/lib/hooks/useThaiLocale";
import { useTranslation } from "react-i18next";

export const dynamic = "force-dynamic";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

interface ApprovalRequest {
  id: string;
  type: "timesheet" | "expense" | "leave";
  userId: string;
  userName: string;
  date: string;
  amount?: number;
  hours?: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reason?: string;
  isConcurrent?: boolean;
  concurrentCount?: number;
  concurrentReason?: string;
}

interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

async function fetchAllApprovals(): Promise<ApprovalRequest[]> {
  try {
    // Fetch pending timesheets
    const tsRes = await fetch(`${API_BASE}/api/timesheet/approvals`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const timesheets = tsRes.ok ? await tsRes.json() : [];

    // Fetch pending expenses
    const expRes = await fetch(`${API_BASE}/api/expenses/approvals`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const expenses = expRes.ok ? await expRes.json() : [];

    // Fetch pending leave
    const leaveRes = await fetch(
      `${API_BASE}/api/leave/requests/for-approval`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    const leaves = leaveRes.ok ? await leaveRes.json() : [];

    const allRequests: ApprovalRequest[] = [];

    // Add timesheets
    if (Array.isArray(timesheets)) {
      timesheets.forEach((ts: any) => {
        allRequests.push({
          id: ts.id,
          type: "timesheet",
          userId: ts.userId,
          userName: ts.user?.name || "Unknown",
          date: ts.date || new Date().toISOString(),
          hours: ts.hours,
          status: ts.approvalStatus || "pending",
          createdAt: ts.createdAt || new Date().toISOString(),
        });
      });
    }

    // Add expenses
    if (Array.isArray(expenses)) {
      expenses.forEach((exp: any) => {
        allRequests.push({
          id: exp.id,
          type: "expense",
          userId: exp.userId,
          userName: exp.user?.name || "Unknown",
          date: exp.date || new Date().toISOString(),
          amount: exp.amount,
          status: exp.status || "pending",
          createdAt: exp.createdAt || new Date().toISOString(),
        });
      });
    }

    // Add leave
    if (Array.isArray(leaves)) {
      leaves.forEach((leave: any) => {
        allRequests.push({
          id: leave.id,
          type: "leave",
          userId: leave.userId,
          userName: leave.user?.name || "Unknown",
          date: leave.startDate || new Date().toISOString(),
          status: leave.status || "pending",
          createdAt: leave.createdAt || new Date().toISOString(),
        });
      });
    }

    return allRequests.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.error("Error fetching approvals:", error);
    return [];
  }
}

export default function ApprovalStatusPage() {
  const { formatThaiDate, getStatusLabel } = useThaiLocale();
  const { t } = useTranslation();

  const { data: allApprovals = [], isLoading } = useQuery({
    queryKey: ["admin:approvals:all"],
    queryFn: fetchAllApprovals,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "timesheet" | "expense" | "leave"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  // Filter data
  const filtered = allApprovals.filter((item) => {
    const matchesSearch =
      item.userName.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats
  const stats: ApprovalStats = {
    total: allApprovals.length,
    pending: allApprovals.filter((a) => a.status === "pending").length,
    approved: allApprovals.filter((a) => a.status === "approved").length,
    rejected: allApprovals.filter((a) => a.status === "rejected").length,
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      timesheet: "ไทม์ชีท",
      expense: "ค่าใช้จ่าย",
      leave: "ลากิจ",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      timesheet: "bg-blue-50 text-blue-700 border-blue-200",
      expense: "bg-green-50 text-green-700 border-green-200",
      leave: "bg-purple-50 text-purple-700 border-purple-200",
    };
    return colors[type] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      approved: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getLinkForType = (type: string, id: string) => {
    const links: Record<string, string> = {
      timesheet: `/approvals/timesheets?id=${id}`,
      expense: `/approvals/expenses?id=${id}`,
      leave: `/approvals/leave?id=${id}`,
    };
    return links[type] || "#";
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title={
          t("timesheet.approvalPending") || "สรุปสถานะคำร้องการอนุมัติทั้งหมด"
        }
        breadcrumbs={[
          { label: "Workspace", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: t("navigation.approvals") || "Approval Status" },
        ]}
      />

      <div className="container mx-auto px-6 py-8 pt-24 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {t("common.total")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {stats.total}
              </div>
              <p className="text-xs text-slate-500 mt-1">{t("common.all")}</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">
                {t("common.pending")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-700">
                {stats.pending}
              </div>
              <p className="text-xs text-yellow-600 mt-1">
                {t("timesheet.approvalPending")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                {t("common.approved")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">
                {stats.approved}
              </div>
              <p className="text-xs text-green-600 mt-1">
                {t("timesheet.approvalApproved")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700">
                {t("common.rejected")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">
                {stats.rejected}
              </div>
              <p className="text-xs text-red-600 mt-1">
                {t("timesheet.approvalRejected")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={t("placeholders.search")}
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Select
                value={typeFilter}
                onValueChange={(v: any) => setTypeFilter(v)}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="timesheet">
                    {t("timesheet.title")}
                  </SelectItem>
                  <SelectItem value="expense">
                    {t("navigation.expenses")}
                  </SelectItem>
                  <SelectItem value="leave">
                    {t("navigation.approvals")}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(v: any) => setStatusFilter(v)}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="pending">{t("common.pending")}</SelectItem>
                  <SelectItem value="approved">
                    {t("common.approved")}
                  </SelectItem>
                  <SelectItem value="rejected">
                    {t("common.rejected")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">
                      {t("common.type")}
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">
                      {t("common.name")}
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">
                      {t("common.date")}
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">
                      {t("common.total")}
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">
                      {t("common.status")}
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">
                      {t("common.date")}
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 px-6 text-center text-slate-500"
                      >
                        {t("common.loading")}
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 px-6 text-center text-slate-500"
                      >
                        {t("timesheet.noEntries")}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr
                        key={`${item.type}-${item.id}`}
                        className={`hover:bg-slate-50 transition-colors ${item.isConcurrent ? "bg-yellow-50/30" : ""}`}
                      >
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={getTypeColor(item.type)}
                            >
                              {getTypeLabel(item.type)}
                            </Badge>
                            {item.isConcurrent && (
                              <Badge
                                variant="outline"
                                className="bg-yellow-100 border-yellow-300 text-yellow-700"
                              >
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {t("timesheet.parallelWorkDetected")}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-6 text-sm font-medium text-slate-900">
                          <div className="flex flex-col gap-1">
                            <span>{item.userName}</span>
                            {item.concurrentReason && (
                              <span className="text-xs text-slate-500 italic">
                                💬 {item.concurrentReason}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-6 text-sm text-slate-600">
                          {formatThaiDate(new Date(item.date))}
                        </td>
                        <td className="py-3 px-6 text-sm text-slate-600">
                          {item.amount
                            ? `฿${item.amount.toLocaleString()}`
                            : item.hours
                              ? `${item.hours} ${t("timesheet.hours")}`
                              : "-"}
                        </td>
                        <td className="py-3 px-6">
                          <Badge
                            variant="outline"
                            className={getStatusColor(item.status)}
                          >
                            {getStatusLabel(item.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-6 text-sm text-slate-600">
                          {formatThaiDate(new Date(item.createdAt))}
                        </td>
                        <td className="py-3 px-6 text-right">
                          <Link href={getLinkForType(item.type, item.id)}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              {t("common.view")}{" "}
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>{t("common.total")}:</strong>{" "}
            {t("timesheet.filterByStatus")} {filtered.length} {t("common.of")}{" "}
            {stats.total}
            {stats.pending > 0 && (
              <span className="block mt-1">
                ⚠️ {t("timesheet.maxConcurrentProjects")}{" "}
                <strong>{stats.pending}</strong>
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
