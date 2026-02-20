'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/Dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminCostCodesPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ code: '', description: '', category: '', isActive: true });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cost-codes', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Load failed');
      setCodes(json?.codes || []);
    } catch (e: any) {
      toast.error(e?.message || 'โหลดไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    try {
      const res = await fetch('/api/admin/cost-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Create failed');
      toast.success('เพิ่ม Cost Code สำเร็จ');
      setOpen(false);
      setForm({ code: '', description: '', category: '', isActive: true });
      load();
    } catch (e: any) {
      toast.error(e?.message || 'เพิ่มไม่สำเร็จ');
    }
  };

  const update = async () => {
    try {
      const res = await fetch(`/api/admin/cost-codes/${encodeURIComponent(editing.code)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: form.description, category: form.category, isActive: form.isActive })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Update failed');
      toast.success('อัปเดต Cost Code สำเร็จ');
      setOpen(false);
      setEditing(null);
      load();
    } catch (e: any) {
      toast.error(e?.message || 'อัปเดตไม่สำเร็จ');
    }
  };

  const remove = async (code: string) => {
    if (!confirm('ต้องการลบ Cost Code นี้หรือไม่?')) return;
    try {
      const res = await fetch(`/api/admin/cost-codes/${encodeURIComponent(code)}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Delete failed');
      toast.success('ลบสำเร็จ');
      load();
    } catch (e: any) {
      toast.error(e?.message || 'ลบไม่สำเร็จ');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ code: '', description: '', category: '', isActive: true });
    setOpen(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    setForm({ code: row.code, description: row.description || '', category: row.category || '', isActive: !!row.is_active });
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="จัดการ Cost Codes" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Cost Codes' }]} />
      <div className="pt-24 px-6 pb-12 max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Cost Code Catalog</h2>
          <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> เพิ่ม Cost Code</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายการ Cost Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((c: any) => (
                  <TableRow key={c.code}>
                    <TableCell className="font-medium">{c.code}</TableCell>
                    <TableCell>{c.description}</TableCell>
                    <TableCell>{c.category || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit2 className="w-4 h-4 text-blue-600" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(c.code)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {codes.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">ไม่พบข้อมูล</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'แก้ไข Cost Code' : 'เพิ่ม Cost Code'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!editing && (
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="เช่น G100010" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="คำอธิบาย" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="หมวดหมู่ (ถ้ามี)" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
            <Button onClick={editing ? update : create}>{editing ? 'บันทึก' : 'เพิ่ม'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

