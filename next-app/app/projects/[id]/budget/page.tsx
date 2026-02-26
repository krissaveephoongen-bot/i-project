"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import {
  getProjectBudgetSummary,
} from "../../budgetActions";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  PieChart,
  BarChart3,
  Download,
} from "lucide-react";
import { clsx } from "clsx";
import { useParams } from "next/navigation";
import FinancialChart from "@/app/components/FinancialChart";
import ProjectTabs from "@/app/components/ProjectTabs";

type Monthly = { month: string; revenue: number; cost: number };
type Milestone = {
  id: string;
  name: string;
  amount: number;
  dueDate: string | null;
  status: string;
  percentage: number;
};

export default function ProjectBudgetPage() {
  const params = useParams() as { id?: string };
  const [monthly, setMonthly] = useState<Monthly[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [summary, setSummary] = useState({
    approvedBudget: 0,
    actualCost: 0,
    committedCost: 0,
    remainingBudget: 0,
    paidAmount: 0,
    pendingAmount: 0,
    totalBudget: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const id = params?.id || "";
        if (!id) return;
        const json = await getProjectBudgetSummary(id);
        setMonthly((json?.monthly || []) as any[]);
        setMilestones((json?.milestones || []) as any[]);
        setSummary(
          (json?.summary || {
            approvedBudget: 0,
            actualCost: 0,
            committedCost: 0,
            remainingBudget: 0,
            paidAmount: 0,
            pendingAmount: 0,
            totalBudget: 0,
          }) as any,
        );
      } catch {
        setMonthly([]);
        setMilestones([]);
      }
    };
    load();
  }, [params?.id]);

  return (
    <div className="min-h-screen">
      <Header
        title="Budget & Finance"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: "Project", href: `/projects/${params?.id || ""}` },
          { label: "Budget" },
        ]}
      />

      <div className="pt-20 px-6 pb-6">
        <ProjectTabs />
        {/* Budget Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Approved Budget</p>
                <p className="text-lg font-bold text-slate-900">
                  ฿{summary.approvedBudget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Actual Cost</p>
                <p className="text-lg font-bold text-slate-900">
                  ฿{summary.actualCost.toLocaleString()}
                </p>
                <p className="text-xs text-red-600">
                  {summary.approvedBudget
                    ? Math.round(
                        (summary.actualCost / summary.approvedBudget) * 100,
                      )
                    : 0}
                  % of budget
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Committed</p>
                <p className="text-lg font-bold text-slate-900">
                  ฿{summary.committedCost.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Remaining</p>
                <p className="text-lg font-bold text-green-600">
                  ฿{summary.remainingBudget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Utilization Chart */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Budget vs Actual
              </h2>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <FinancialChart data={monthly} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Cost Breakdown
            </h2>
            <div className="space-y-4">
              {[
                {
                  label: "Development",
                  value: 8500000,
                  percentage: 53,
                  color: "bg-blue-500",
                },
                {
                  label: "Infrastructure",
                  value: 3200000,
                  percentage: 20,
                  color: "bg-purple-500",
                },
                {
                  label: "Consulting",
                  value: 2100000,
                  percentage: 13,
                  color: "bg-yellow-500",
                },
                {
                  label: "Testing",
                  value: 1400000,
                  percentage: 9,
                  color: "bg-green-500",
                },
                {
                  label: "Other",
                  value: 1000000,
                  percentage: 6,
                  color: "bg-slate-400",
                },
              ].map((item: any, idx: number) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700">{item.label}</span>
                    <span className="text-sm font-medium text-slate-900">
                      ฿{item.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={clsx("h-full rounded-full", item.color)}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Payment Summary
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">
                  Overall Budget Utilization
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {summary.approvedBudget
                    ? Math.round(
                        (summary.actualCost / summary.approvedBudget) * 100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full transition-all"
                  style={{
                    width: `${summary.approvedBudget ? (summary.actualCost / summary.approvedBudget) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 mb-1">Paid Invoices</p>
                <p className="text-2xl font-bold text-green-700">
                  ฿{summary.paidAmount.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  {summary.totalBudget
                    ? Math.round(
                        (summary.paidAmount / summary.totalBudget) * 100,
                      )
                    : 0}
                  % of contract
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 mb-1">Invoiced Pending</p>
                <p className="text-2xl font-bold text-blue-700">
                  ฿{summary.pendingAmount.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600">
                  {summary.totalBudget
                    ? Math.round(
                        (summary.pendingAmount / summary.totalBudget) * 100,
                      )
                    : 0}
                  % of contract
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Remaining</p>
                <p className="text-2xl font-bold text-slate-700">
                  ฿{summary.remainingBudget.toLocaleString()}
                </p>
                <p className="text-xs text-slate-600">
                  {summary.totalBudget
                    ? Math.round(
                        (summary.remainingBudget / summary.totalBudget) * 100,
                      )
                    : 0}
                  % of contract
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
