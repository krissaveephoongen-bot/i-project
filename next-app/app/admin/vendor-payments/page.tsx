"use client";

import { useEffect, useState } from "react";

interface Payment {
  id: string;
  vendorName?: string;
  contractNumber?: string;
  projectName?: string;
  paymentType?: string;
  amount?: number;
  currency?: string;
  dueDate?: string;
  paidDate?: string | null;
  status?: string;
  paymentMethod?: string | null;
}

export default function AdminVendorPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", "20");
      const res = await fetch(
        `${baseUrl}/api/vendor-payments?${params.toString()}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPayments(json.payments || []);
    } catch (e: any) {
      setError(e.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString() : "-";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          Vendor Payments
        </h1>
      </div>

      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหา description/transaction/receipt/vendor..."
          className="border rounded px-3 py-2 w-full"
        />
        <button
          onClick={load}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {loading && <div className="text-slate-500">กำลังโหลดข้อมูล...</div>}
      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded p-3 flex items-center justify-between">
          <div>เกิดข้อผิดพลาด: {error}</div>
          <button
            onClick={load}
            className="px-3 py-1 rounded border border-red-300 hover:bg-red-100"
          >
            ลองอีกครั้ง
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-2">Vendor</th>
                <th className="text-left px-4 py-2">Project</th>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-right px-4 py-2">Amount</th>
                <th className="text-left px-4 py-2">Due</th>
                <th className="text-left px-4 py-2">Paid</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Method</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2">{p.vendorName || "-"}</td>
                  <td className="px-4 py-2">{p.projectName || "-"}</td>
                  <td className="px-4 py-2">{p.paymentType || "-"}</td>
                  <td className="px-4 py-2 text-right">
                    {p.amount != null
                      ? `${p.currency || "THB"} ${p.amount.toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="px-4 py-2">{formatDate(p.dueDate)}</td>
                  <td className="px-4 py-2">{formatDate(p.paidDate)}</td>
                  <td className="px-4 py-2">{p.status || "-"}</td>
                  <td className="px-4 py-2">{p.paymentMethod || "-"}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-10 text-slate-500 text-center"
                    colSpan={8}
                  >
                    <div className="text-base">ยังไม่มีรายการชำระเงิน</div>
                    <div className="text-xs text-slate-400 mt-1">
                      ลองปรับเงื่อนไขค้นหาหรือเพิ่มข้อมูลภายหลัง
                    </div>
                    <button
                      onClick={load}
                      className="mt-3 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200"
                    >
                      โหลดใหม่
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
