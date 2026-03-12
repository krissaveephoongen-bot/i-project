"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BillingDashboard from "@/app/components/BillingDashboard";
import { Plus, Filter } from "lucide-react";

function BillingPageContent() {
  const searchParams = useSearchParams();
  const [invoices] = useState(mockInvoices);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
          <p className="text-gray-600">Manage project invoices and payments</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Dashboard */}
      <BillingDashboard invoices={invoices} />
    </div>
  );
}

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
  return (
    <Suspense fallback={<div>Loading billing page...</div>}>
      <BillingPageContent />
    </Suspense>
  );
}
