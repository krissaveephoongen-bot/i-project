import React, { useState, useEffect } from 'react';
import { customerService, Customer } from '@/services/customerService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataLoader } from '@/components/DataLoader';
import EmptyState from '@/components/EmptyState';
import { Plus, Pencil, XCircle, User2, Building2 } from 'lucide-react';

const fields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'contact_person', label: 'Contact Person' },
  { name: 'email', label: 'Email' },
  { name: 'phone', label: 'Phone' },
  { name: 'address', label: 'Address' },
  { name: 'type', label: 'Type', type: 'select', options: ['government', 'private', 'individual'] },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    setError(null);
    const res = await customerService.getCustomers();
    setLoading(false);
    if (!res.success) setError(res.message);
    setCustomers(res.data || []);
  }

  function openCreate() {
    setForm({});
    setEditing(null);
    setShowModal(true);
  }
  
  function openEdit(cust: Customer) {
    setForm({ ...cust });
    setEditing(cust);
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    let res;
    if (editing) {
      res = await customerService.updateCustomer(editing.id, form);
    } else {
      res = await customerService.createCustomer(form);
    }
    setSaving(false);
    if (res.success) {
      setShowModal(false);
      fetchCustomers();
    } else {
      alert(res.message || 'Failed to save customer');
    }
  }

  async function handleDelete(cust: Customer) {
    if (!window.confirm(`Delete customer ${cust.name}?`)) return;
    setSaving(true);
    const res = await customerService.deleteCustomer(cust.id);
    setSaving(false);
    if (res.success) fetchCustomers();
    else alert(res.message || 'Failed to delete customer');
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-2">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Building2 className="inline h-7 w-7" /> Customers</h1>
        <Button variant="primary" onClick={openCreate}><Plus className="mr-2" />Add Customer</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <DataLoader loading={loading} error={error} data={customers}>
            {customers.length === 0 ? (
              <EmptyState title="No Customers" description="ยังไม่มีลูกค้าในระบบ" action={{ label: 'Add Customer', onClick: openCreate }} />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Contact</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Phone</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{c.name}</td>
                        <td className="px-4 py-2 capitalize">{c.type}</td>
                        <td className="px-4 py-2">{c.contact_person}</td>
                        <td className="px-4 py-2">{c.email}</td>
                        <td className="px-4 py-2">{c.phone}</td>
                        <td className="px-4 py-2 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(c)}><XCircle className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DataLoader>
        </CardContent>
      </Card>

      {/* Modal แบบง่าย */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute right-4 top-4" onClick={() => setShowModal(false)}><XCircle className="h-6 w-6 text-gray-400" /></button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><User2 /> {editing ? 'Edit Customer' : 'Add Customer'}</h2>
            <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-4">
              {fields.map(f => (
                <div key={f.name}>
                  <label className="block text-sm mb-1 font-medium">{f.label}{f.required && <span className="text-red-500">*</span>}</label>
                  {f.type === 'select' ? (
                    <select value={form[f.name] || ''} onChange={e => setForm((form:any) => ({ ...form, [f.name]: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">Select type</option>
                      {f.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form[f.name] || ''}
                      required={f.required}
                      onChange={e => setForm((form:any) => ({ ...form, [f.name]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
                <Button type="submit" variant="primary" isLoading={saving}>Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
