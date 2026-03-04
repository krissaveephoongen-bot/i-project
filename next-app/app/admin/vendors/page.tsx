"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

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
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<Partial<Vendor>>({
    name: "",
    code: "",
    type: "",
    category: "",
    contactPerson: "",
    email: "",
    phone: "",
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", "20");
      const res = await fetch(
        `${baseUrl}/api/vendors-management?${params.toString()}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setVendors(json.vendors || []);
    } catch (e: any) {
      setError(e.message || "Failed to load vendors");
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
    setForm({
      name: "",
      code: "",
      type: "",
      category: "",
      contactPerson: "",
      email: "",
      phone: "",
    });
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
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${baseUrl}/api/vendors-management/${editing.id}`
        : `${baseUrl}/api/vendors-management`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          code: form.code || null,
          type: form.type,
          category: form.category,
          contactPerson: form.contactPerson || null,
          email: form.email || null,
          phone: form.phone || null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setModalOpen(false);
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to save vendor");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this vendor?")) return;
    try {
      const res = await fetch(`${baseUrl}/api/vendors-management/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to delete vendor");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="จัดการ Vendors"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Vendors" },
        ]}
      />
      <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Vendors</h1>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Add Vendor
          </Button>
        </div>

        <div className="flex gap-4 items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onKeyDown={(e) => {
                if (e.key === "Enter") load();
              }}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendor name/code/contact..."
              className="pl-9"
            />
          </div>
          <Button onClick={load} variant="outline">
            Search
          </Button>
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
            <Button
              onClick={load}
              variant="destructive"
              size="sm"
            >
              ลองอีกครั้ง
            </Button>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.code || "-"}</TableCell>
                    <TableCell>{v.type || "-"}</TableCell>
                    <TableCell>{v.category || "-"}</TableCell>
                    <TableCell>{v.status || "-"}</TableCell>
                    <TableCell>{v.contactPerson || "-"}</TableCell>
                    <TableCell>{v.email || "-"}</TableCell>
                    <TableCell>{v.phone || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(v)}
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(v.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {vendors.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-slate-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span>ไม่พบข้อมูล Vendor</span>
                        <Button variant="outline" size="sm" onClick={load}>
                          โหลดใหม่
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          </div>
        )}

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <Input
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Code</label>
                  <Input
                    value={form.code || ""}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Type</label>
                  <Input
                    value={form.type || ""}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <Input
                    value={form.category || ""}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Contact</label>
                  <Input
                    value={form.contactPerson || ""}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input
                    value={form.email || ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <Input
                    value={form.phone || ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
