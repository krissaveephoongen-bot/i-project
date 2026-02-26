"use client";

import { useEffect, useState } from "react";

interface Item {
  id: string;
  expenseId?: string;
  vendorId?: string | null;
  vendorName?: string;
  category?: string;
  subcategory?: string | null;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  baseCost?: number | null;
  marginAmount?: number | null;
  finalPrice?: number | null;
  vendorInvoice?: string | null;
  vendorItemCode?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export default function ExpensesVendorItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<any>({
    expenseId: "",
    vendorId: "",
    category: "",
    subcategory: "",
    description: "",
    quantity: "1",
    unitPrice: "",
    baseCost: "",
    markup: "",
    vendorItemCode: "",
    vendorInvoice: "",
    notes: "",
  });

  const baseUrl = "";

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", "20");
      const res = await fetch(
        `${baseUrl}/api/expense-items?${params.toString()}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setItems(json.items || []);
    } catch (e: any) {
      setError(e.message || "Failed to load vendor items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmt = (n?: number | null) => (n != null ? n.toLocaleString() : "-");
  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString() : "-";
  const openCreate = () => {
    setEditing(null);
    setForm({
      expenseId: "",
      vendorId: "",
      category: "",
      subcategory: "",
      description: "",
      quantity: "1",
      unitPrice: "",
      baseCost: "",
      markup: "",
      vendorItemCode: "",
      vendorInvoice: "",
      notes: "",
    });
    setModalOpen(true);
  };
  const openEdit = async (it: Item) => {
    try {
      const res = await fetch(`${baseUrl}/api/expense-items/${it.id}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        const d = json.item || {};
        setEditing(it);
        setForm({
          expenseId: d.expenseId || "",
          vendorId: d.vendorId || "",
          category: d.category || "",
          subcategory: d.subcategory || "",
          description: d.description || "",
          quantity: String(d.quantity || "1"),
          unitPrice: String(d.unitPrice || ""),
          baseCost: d.baseCost != null ? String(d.baseCost) : "",
          markup: d.markup != null ? String(d.markup) : "",
          vendorItemCode: d.vendorItemCode || "",
          vendorInvoice: d.vendorInvoice || "",
          notes: d.notes || "",
        });
        setModalOpen(true);
      } else {
        setEditing(it);
        setModalOpen(true);
      }
    } catch {
      setEditing(it);
      setModalOpen(true);
    }
  };
  const save = async () => {
    if (
      !form.expenseId ||
      !form.category ||
      !form.description ||
      !form.unitPrice
    )
      return;
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${baseUrl}/api/expense-items/${editing.id}`
        : `${baseUrl}/api/expense-items`;
      const body = {
        expenseId: form.expenseId,
        vendorId: form.vendorId || null,
        category: form.category,
        subcategory: form.subcategory || null,
        description: form.description,
        quantity: parseFloat(form.quantity || "1"),
        unitPrice: parseFloat(form.unitPrice),
        baseCost: form.baseCost ? parseFloat(form.baseCost) : undefined,
        markup: form.markup ? parseFloat(form.markup) : undefined,
        vendorItemCode: form.vendorItemCode || null,
        vendorInvoice: form.vendorInvoice || null,
        notes: form.notes || null,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setModalOpen(false);
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to save item");
    } finally {
      setSaving(false);
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      const res = await fetch(`${baseUrl}/api/expense-items/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to delete item");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          Vendor Expense Items
        </h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Add Item
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหา description/invoice/vendor..."
          className="border rounded px-3 py-2 w-full"
        />
        <button
          onClick={load}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          <div className="h-8 bg-slate-100 rounded animate-pulse" />
          <div className="h-8 bg-slate-100 rounded animate-pulse" />
          <div className="h-8 bg-slate-100 rounded animate-pulse" />
        </div>
      )}
      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded p-4 flex items-center justify-between">
          <span>เกิดข้อผิดพลาด: {error}</span>
          <button
            onClick={load}
            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
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
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-left px-4 py-2">Subcategory</th>
                <th className="text-left px-4 py-2">Description</th>
                <th className="text-right px-4 py-2">Qty</th>
                <th className="text-right px-4 py-2">Unit</th>
                <th className="text-right px-4 py-2">Total</th>
                <th className="text-right px-4 py-2">Base</th>
                <th className="text-right px-4 py-2">Margin</th>
                <th className="text-right px-4 py-2">Final</th>
                <th className="text-left px-4 py-2">Invoice</th>
                <th className="text-left px-4 py-2">Created</th>
                <th className="text-right px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2">{it.vendorName || "-"}</td>
                  <td className="px-4 py-2">{it.category || "-"}</td>
                  <td className="px-4 py-2">{it.subcategory || "-"}</td>
                  <td className="px-4 py-2">{it.description || "-"}</td>
                  <td className="px-4 py-2 text-right">{fmt(it.quantity)}</td>
                  <td className="px-4 py-2 text-right">{fmt(it.unitPrice)}</td>
                  <td className="px-4 py-2 text-right">{fmt(it.totalPrice)}</td>
                  <td className="px-4 py-2 text-right">{fmt(it.baseCost)}</td>
                  <td className="px-4 py-2 text-right">
                    {fmt(it.marginAmount)}
                  </td>
                  <td className="px-4 py-2 text-right">{fmt(it.finalPrice)}</td>
                  <td className="px-4 py-2">{it.vendorInvoice || "-"}</td>
                  <td className="px-4 py-2">{formatDate(it.createdAt)}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(it)}
                        className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(it.id)}
                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-10 text-slate-500 text-center"
                    colSpan={13}
                  >
                    <div className="text-base">
                      ยังไม่มีรายการค่าใช้จ่ายจาก Vendor
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      ลองปรับเงื่อนไขค้นหาหรือเพิ่มรายการใหม่
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={load}
                        className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200"
                      >
                        โหลดใหม่
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {editing ? "Edit Item" : "Add Item"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Expense ID
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.expenseId}
                  onChange={(e) =>
                    setForm({ ...form, expenseId: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vendor ID
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.vendorId}
                  onChange={(e) =>
                    setForm({ ...form, vendorId: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Subcategory
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.subcategory}
                  onChange={(e) =>
                    setForm({ ...form, subcategory: e.target.value })
                  }
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Quantity
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Unit Price
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.unitPrice}
                  onChange={(e) =>
                    setForm({ ...form, unitPrice: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Base Cost
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.baseCost}
                  onChange={(e) =>
                    setForm({ ...form, baseCost: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Markup %
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.markup}
                  onChange={(e) => setForm({ ...form, markup: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vendor Item Code
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.vendorItemCode}
                  onChange={(e) =>
                    setForm({ ...form, vendorItemCode: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vendor Invoice
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.vendorInvoice}
                  onChange={(e) =>
                    setForm({ ...form, vendorInvoice: e.target.value })
                  }
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-slate-200">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
