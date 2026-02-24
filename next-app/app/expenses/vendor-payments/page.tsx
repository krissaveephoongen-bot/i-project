'use client';

import { useEffect, useState } from 'react';

interface Payment {
  id: string;
  vendorId?: string;
  projectId?: string | null;
  contractId?: string | null;
  vendorName?: string;
  projectName?: string;
  paymentType?: string;
  amount?: number;
  currency?: string;
  dueDate?: string;
  paidDate?: string | null;
  status?: string;
  paymentMethod?: string | null;
  description?: string | null;
}

export default function ExpensesVendorPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState<any>({
    vendorId: '',
    projectId: '',
    contractId: '',
    paymentType: '',
    amount: '',
    currency: 'THB',
    dueDate: '',
    paymentMethod: '',
    description: ''
  });

  const baseUrl = '';

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('limit', '20');
      const res = await fetch(`${baseUrl}/api/vendor-payments?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPayments(json.payments || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (d?: string | null) => d ? new Date(d).toLocaleDateString() : '-';
  const openCreate = () => {
    setEditing(null);
    setForm({
      vendorId: '',
      projectId: '',
      contractId: '',
      paymentType: '',
      amount: '',
      currency: 'THB',
      dueDate: '',
      paymentMethod: '',
      description: ''
    });
    setModalOpen(true);
  };
  const openEdit = async (p: Payment) => {
    try {
      const res = await fetch(`${baseUrl}/api/vendor-payments/${p.id}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const pd = json.payment || {};
        setEditing(p);
        setForm({
          vendorId: pd.vendorId || '',
          projectId: pd.projectId || '',
          contractId: pd.contractId || '',
          paymentType: pd.paymentType || '',
          amount: pd.amount || '',
          currency: pd.currency || 'THB',
          dueDate: pd.dueDate ? new Date(pd.dueDate).toISOString().slice(0, 10) : '',
          paymentMethod: pd.paymentMethod || '',
          description: pd.description || ''
        });
        setModalOpen(true);
      } else {
        setEditing(p);
        setModalOpen(true);
      }
    } catch (e: any) {
      setEditing(p);
      setModalOpen(true);
    }
  };
  const save = async () => {
    if (!form.vendorId || !form.paymentType || !form.amount || !form.dueDate) return;
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${baseUrl}/api/vendor-payments/${editing.id}` : `${baseUrl}/api/vendor-payments`;
      const body = {
        vendorId: form.vendorId,
        contractId: form.contractId || null,
        projectId: form.projectId || null,
        paymentType: form.paymentType,
        amount: parseFloat(form.amount),
        currency: form.currency || 'THB',
        dueDate: form.dueDate,
        paymentMethod: form.paymentMethod || null,
        description: form.description || null
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setModalOpen(false);
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to save payment');
    } finally {
      setSaving(false);
    }
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this payment?')) return;
    try {
      const res = await fetch(`${baseUrl}/api/vendor-payments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to delete payment');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Vendor Payments</h1>
        <button onClick={openCreate} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Add Payment</button>
      </div>

      <div className="flex gap-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหา description/transaction/receipt/vendor..."
          className="border rounded px-3 py-2 w-full"
        />
        <button onClick={load} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
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
          <button onClick={load} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">ลองอีกครั้ง</button>
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
                <th className="text-right px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2">{p.vendorName || '-'}</td>
                  <td className="px-4 py-2">{p.projectName || '-'}</td>
                  <td className="px-4 py-2">{p.paymentType || '-'}</td>
                  <td className="px-4 py-2 text-right">
                    {p.amount != null ? `${p.currency || 'THB'} ${p.amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-2">{formatDate(p.dueDate)}</td>
                  <td className="px-4 py-2">{formatDate(p.paidDate)}</td>
                  <td className="px-4 py-2">{p.status || '-'}</td>
                  <td className="px-4 py-2">{p.paymentMethod || '-'}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50">Edit</button>
                      <button onClick={() => remove(p.id)} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-slate-500 text-center" colSpan={9}>
                    <div className="text-base">ยังไม่มีรายการชำระเงิน</div>
                    <div className="text-xs text-slate-400 mt-1">ลองปรับเงื่อนไขค้นหาหรือเพิ่มข้อมูลภายหลัง</div>
                    <button onClick={load} className="mt-3 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200">โหลดใหม่</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">{editing ? 'Edit Payment' : 'Add Payment'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vendor ID</label>
                <input className="w-full border rounded px-3 py-2" value={form.vendorId} onChange={e => setForm({ ...form, vendorId: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project ID</label>
                <input className="w-full border rounded px-3 py-2" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contract ID</label>
                <input className="w-full border rounded px-3 py-2" value={form.contractId} onChange={e => setForm({ ...form, contractId: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <input className="w-full border rounded px-3 py-2" value={form.paymentType} onChange={e => setForm({ ...form, paymentType: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                <input className="w-full border rounded px-3 py-2" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                <input className="w-full border rounded px-3 py-2" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
                <input className="w-full border rounded px-3 py-2" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input className="w-full border rounded px-3 py-2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-slate-200">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
