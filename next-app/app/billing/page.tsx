"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import BillingDashboard from "@/app/components/BillingDashboard";
import { Plus, Filter } from "lucide-react";

// Mock data
const mockInvoices = [
  {
    id: "inv-001",
    invoiceNo: "INV-2026-001",
    date: "2026-01-15",
    dueDate: "2026-02-15",
    amount: 500000,
    currency: "THB",
    status: "paid" as const,
    projectId: "proj-001",
    projectName: "จัดหารถครัวประกอบอาหารชนิด 6 ล้อ",
    description: "Milestone 1: Initial Design & Planning",
  },
  {
    id: "inv-002",
    invoiceNo: "INV-2026-002",
    date: "2026-02-20",
    dueDate: "2026-03-20",
    amount: 300000,
    currency: "THB",
    status: "sent" as const,
    projectId: "proj-001",
    projectName: "จัดหารถครัวประกอบอาหารชนิด 6 ล้อ",
    description: "Milestone 2: Development & Integration",
  },
  {
    id: "inv-003",
    invoiceNo: "INV-2026-003",
    date: "2026-03-01",
    dueDate: "2026-03-31",
    amount: 400000,
    currency: "THB",
    status: "draft" as const,
    projectId: "proj-001",
    projectName: "จัดหารถครัวประกอบอาหารชนิด 6 ล้อ",
    description: "Milestone 3: Testing & QA",
  },
];

const mockMilestones = [
  {
    id: "ms-001",
    title: "Design Phase Completion",
    amount: 500000,
    currency: "THB",
    dueDate: "2026-01-31",
    status: "paid" as const,
    paymentTerms: "Upon Completion",
    invoiceId: "inv-001",
  },
  {
    id: "ms-002",
    title: "Development Phase Completion",
    amount: 600000,
    currency: "THB",
    dueDate: "2026-02-28",
    status: "invoiced" as const,
    paymentTerms: "Net 30",
    invoiceId: "inv-002",
  },
  {
    id: "ms-003",
    title: "Testing & UAT",
    amount: 400000,
    currency: "THB",
    dueDate: "2026-03-31",
    status: "pending" as const,
    paymentTerms: "Net 30",
  },
  {
    id: "ms-004",
    title: "Project Delivery & Support",
    amount: 200000,
    currency: "THB",
    dueDate: "2026-04-30",
    status: "pending" as const,
    paymentTerms: "Upon Delivery",
  },
];

export default function BillingPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const totalBudget = 1700000;
  const totalBilled = 1200000;
  const totalPaid = 500000;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>
              <p className="text-gray-600 mt-2">
                Manage invoices, milestones, and budget tracking
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BillingDashboard
          projectId={projectId || ""}
          invoices={mockInvoices}
          milestones={mockMilestones}
          totalBudget={totalBudget}
          totalBilled={totalBilled}
          totalPaid={totalPaid}
          onInvoiceView={(invoice) => setSelectedInvoice(invoice)}
          onGenerateInvoice={(milestoneId) => {
            console.log("Generate invoice for milestone:", milestoneId);
          }}
        />

        {/* Legal & Settings */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Billing Settings</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Configure billing details →
              </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Manage payment methods →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
