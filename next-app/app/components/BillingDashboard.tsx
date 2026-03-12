"use client";

import { useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { FileText, Download, Eye, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  projectId: string;
  projectName: string;
  description?: string;
  items?: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
}

interface Milestone {
  id: string;
  title: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: "pending" | "invoiced" | "paid" | "overdue";
  paymentTerms?: string;
  invoiceId?: string;
}

interface BillingDashboardProps {
  projectId: string;
  invoices: Invoice[];
  milestones: Milestone[];
  totalBudget: number;
  totalBilled: number;
  totalPaid: number;
  onInvoiceView?: (invoice: Invoice) => void;
  onGenerateInvoice?: (milestoneId: string) => void;
}

const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: "📝" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700", icon: "📧" },
  paid: { label: "Paid", color: "bg-green-100 text-green-700", icon: "✓" },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700", icon: "!" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-700", icon: "✗" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: "⏳" },
  invoiced: { label: "Invoiced", color: "bg-blue-100 text-blue-700", icon: "📄" },
};

function CurrencyFormatter({ amount, currency = "THB" }: { amount: number; currency?: string }) {
  const symbols: Record<string, string> = {
    THB: "฿",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return (
    <span className="font-mono">
      {symbols[currency] || currency} {amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}
    </span>
  );
}

export default function BillingDashboard({
  projectId,
  invoices,
  milestones,
  totalBudget,
  totalBilled,
  totalPaid,
  onInvoiceView,
  onGenerateInvoice,
}: BillingDashboardProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState<"invoices" | "milestones">("invoices");

  const overdueMilestones = milestones.filter((m) => m.status === "overdue").length;
  const unpaidInvoices = invoices.filter((i) => !["paid", "cancelled"].includes(i.status)).length;
  const remainingBudget = totalBudget - totalBilled;
  const billingPercentage = (totalBilled / totalBudget) * 100;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900">
            <CurrencyFormatter amount={totalBudget} />
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Total Billed</p>
          <p className="text-2xl font-bold text-blue-600">
            <CurrencyFormatter amount={totalBilled} />
          </p>
          <p className="text-xs text-gray-500 mt-2">{billingPercentage.toFixed(1)}% of budget</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">
            <CurrencyFormatter amount={totalPaid} />
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Remaining</p>
          <p className={cn("text-2xl font-bold", remainingBudget >= 0 ? "text-gray-900" : "text-red-600")}>
            <CurrencyFormatter amount={remainingBudget} />
          </p>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Budget Utilization</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Billed vs Budget</span>
            <span className="text-sm font-medium text-gray-900">{billingPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                billingPercentage > 100 ? "bg-red-500" : "bg-blue-500"
              )}
              style={{ width: `${Math.min(billingPercentage, 100)}%` }}
            />
          </div>
          {billingPercentage > 100 && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              Budget exceeded by <CurrencyFormatter amount={totalBilled - totalBudget} />
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-8">
        <button
          onClick={() => setActiveTab("invoices")}
          className={cn(
            "px-4 py-3 border-b-2 transition-colors",
            activeTab === "invoices"
              ? "border-blue-600 text-blue-600 font-medium"
              : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab("milestones")}
          className={cn(
            "px-4 py-3 border-b-2 transition-colors",
            activeTab === "milestones"
              ? "border-blue-600 text-blue-600 font-medium"
              : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          Milestones ({milestones.length})
        </button>
      </div>

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {invoices.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No invoices yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const config = statusConfig[invoice.status];
                    return (
                      <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{invoice.invoiceNo}</p>
                              <p className="text-sm text-gray-500">{invoice.projectName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {format(new Date(invoice.date), "MMM dd, yyyy", { locale: th })}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          <CurrencyFormatter amount={invoice.amount} currency={invoice.currency} />
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
                              config.color
                            )}
                          >
                            {config.icon} {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                onInvoiceView?.(invoice);
                              }}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="View invoice"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === "milestones" && (
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 px-6 py-12 text-center">
              <p className="text-gray-600">No milestones defined</p>
            </div>
          ) : (
            milestones.map((milestone) => {
              const config = statusConfig[milestone.status];
              const isOverdue = milestone.status === "overdue";
              return (
                <div
                  key={milestone.id}
                  className={cn(
                    "bg-white rounded-lg border p-6",
                    isOverdue ? "border-red-300 bg-red-50" : "border-gray-200"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
                            config.color
                          )}
                        >
                          {config.icon} {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Due: {format(new Date(milestone.dueDate), "MMM dd, yyyy", { locale: th })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        <CurrencyFormatter amount={milestone.amount} currency={milestone.currency} />
                      </p>
                      {milestone.paymentTerms && (
                        <p className="text-xs text-gray-500 mt-1">{milestone.paymentTerms}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    {milestone.status === "pending" && (
                      <button
                        onClick={() => onGenerateInvoice?.(milestone.id)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Generate Invoice
                      </button>
                    )}
                    {milestone.invoiceId && (
                      <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        View Invoice
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
