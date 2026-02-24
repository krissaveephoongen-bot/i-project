'use client';

import { useEffect, useState } from 'react';

interface Vendor {
  id: string;
  name: string;
  code?: string | null;
  type?: string | null;
  category?: string | null;
  status?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt?: string;
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<Partial<Vendor>>({ name: '', code: '', type: '', category: '', contactPerson: '', email: '', phone: '' });

  const baseUrl = '';

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('limit', '20');
      const res = await fetch(`${baseUrl}/api/vendors-management?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setVendors(json.vendors || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '', type: '', category: '', contactPerson: '', email: '', phone: '' });
    setModalOpen(true);
  };

  const openEdit = (v: Vendor) => {
    setEditing(v);
    setForm({ ...v });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.type || !form.category) return;
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${baseUrl}/api/vendors-management/${editing.id}` : `${baseUrl}/api/vendors-management`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          code: form.code || null,
          type: form.type,
          category: form.category,
          contactPerson: form.contactPerson || null,
          email: form.email || null,
          phone: form.phone || null
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setModalOpen(false);
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to save vendor');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this vendor?')) return;
    try {
      const res = await fetch(`${baseUrl}/api/vendors-management/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to delete vendor');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Vendors</h1>
        <button onClick={openCreate} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Add Vendor</button>
      </div>

      <div className="flex gap-2">
        <input
          value={search}
          onKeyDown={e => { if (e.key === 'Enter') load(); }}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search vendor name/code/contact..."
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
          <div className="px-4 py-2 text-sm text-slate-500">Total: {vendors.length}</div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Code</th>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Contact</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Phone</th>
                <th className="text-right px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium">{v.name}</td>
                  <td className="px-4 py-2">{v.code || '-'}</td>
                  <td className="px-4 py-2">{v.type || '-'}</td>
                  <td className="px-4 py-2">{v.category || '-'}</td>
                  <td className="px-4 py-2">{v.status || '-'}</td>
                  <td className="px-4 py-2">{v.contactPerson || '-'}</td>
                  <td className="px-4 py-2">{v.email || '-'}</td>
                  <td className="px-4 py-2">{v.phone || '-'}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(v)} className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50">Edit</button>
                      <button onClick={() => remove(v.id)} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-slate-500 text-center" colSpan={9}>
                    <div className="text-base">ยังไม่มี Vendor</div>
                    <div className="text-xs text-slate-400 mt-1">ลองปรับเงื่อนไขค้นหาหรือเพิ่ม Vendor ใหม่</div>
                    <div className="mt-3 flex justify-center gap-2">
                      <button onClick={load} className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200">โหลดใหม่</button>
                      <button onClick={openCreate} className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">เพิ่ม Vendor</button>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">{editing ? 'Edit Vendor' : 'Add Vendor'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input className="w-full border rounded px-3 py-2" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                <input className="w-full border rounded px-3 py-2" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <input className="w-full border rounded px-3 py-2" value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input className="w-full border rounded px-3 py-2" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
                <input className="w-full border rounded px-3 py-2" value={form.contactPerson || ''} onChange={e => setForm({ ...form, contactPerson: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input className="w-full border rounded px-3 py-2" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input className="w-full border rounded px-3 py-2" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
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
