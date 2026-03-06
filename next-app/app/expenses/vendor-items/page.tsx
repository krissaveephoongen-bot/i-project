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
import { Plus, Search, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  getVendorItemsAction, 
  createVendorItemAction, 
  updateVendorItemAction, 
  deleteVendorItemAction 
} from "./actions";
import { PermissionGuard } from "@/app/components/PermissionGuard";
import { UserRole } from "@/lib/auth";

interface Item {
  id: string;
  expenseId: string;
  vendorId?: string | null;
  vendorName?: string;
  category: string;
  subcategory?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
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
  const [form, setForm] = useState<Partial<Item>>({
    expenseId: "",
    vendorId: "",
    category: "",
    subcategory: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    baseCost: 0,
    vendorItemCode: "",
    vendorInvoice: "",
    notes: "",
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getVendorItemsAction(search);
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setItems(res.data);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load items");
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
      expenseId: "", // User must provide ID for now, or select from list if we implemented it
      vendorId: "",
      category: "",
      subcategory: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      baseCost: 0,
      vendorItemCode: "",
      vendorInvoice: "",
      notes: "",
    });
    setModalOpen(true);
  };

  const openEdit = (it: Item) => {
    setEditing(it);
    setForm({ ...it });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.expenseId || !form.category || !form.description || form.unitPrice === undefined) {
      toast.error("Please fill in required fields (Expense ID, Category, Description, Unit Price)");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        expenseId: form.expenseId,
        vendorId: form.vendorId || null,
        category: form.category,
        subcategory: form.subcategory || null,
        description: form.description,
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
        baseCost: form.baseCost ? Number(form.baseCost) : null,
        vendorItemCode: form.vendorItemCode || null,
        vendorInvoice: form.vendorInvoice || null,
        notes: form.notes || null,
      };

      let res;
      if (editing) {
        res = await updateVendorItemAction(editing.id, payload);
      } else {
        res = await createVendorItemAction(payload);
      }

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(editing ? "Item updated" : "Item created");
        setModalOpen(false);
        load();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      const res = await deleteVendorItemAction(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Item deleted");
        load();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete item");
    }
  };

  const fmt = (n?: number | null) => (n != null ? n.toLocaleString() : "-");

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Vendor Items"
        breadcrumbs={[
          { label: "Expenses", href: "/expenses" },
          { label: "Vendor Items" },
        ]}
      />
      
      <PermissionGuard
        roles={[UserRole.ADMIN, UserRole.MANAGER]}
        fallback={
          <div className="text-center py-24">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Access Denied</h3>
            <p className="text-slate-600">Only Admins/Managers can access this page.</p>
          </div>
        }
      >
        <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Vendor Expense Items</h1>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" /> Add Item
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
                placeholder="Search description/invoice..."
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
              <span>Error: {error}</span>
              <Button onClick={load} variant="destructive" size="sm">Retry</Button>
            </div>
          )}

          {!loading && !error && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Vendor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell>{it.vendorName || "-"}</TableCell>
                        <TableCell>{it.category}</TableCell>
                        <TableCell>{it.description}</TableCell>
                        <TableCell className="text-right">{fmt(it.quantity)}</TableCell>
                        <TableCell className="text-right">{fmt(it.unitPrice)}</TableCell>
                        <TableCell className="text-right font-medium">{fmt(it.totalPrice)}</TableCell>
                        <TableCell>{it.vendorInvoice || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(it)}>
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => remove(it.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                          No items found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Item" : "Add Item"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Expense ID *</label>
                    <Input
                      value={form.expenseId || ""}
                      onChange={(e) => setForm({ ...form, expenseId: e.target.value })}
                      placeholder="UUID of Parent Expense"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Vendor ID</label>
                    <Input
                      value={form.vendorId || ""}
                      onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                      placeholder="UUID of Vendor"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Category *</label>
                    <Input
                      value={form.category || ""}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Subcategory</label>
                    <Input
                      value={form.subcategory || ""}
                      onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1 block">Description *</label>
                    <Input
                      value={form.description || ""}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Quantity</label>
                    <Input
                      type="number"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Unit Price</label>
                    <Input
                      type="number"
                      value={form.unitPrice}
                      onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Invoice #</label>
                    <Input
                      value={form.vendorInvoice || ""}
                      onChange={(e) => setForm({ ...form, vendorInvoice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Item Code</label>
                    <Input
                      value={form.vendorItemCode || ""}
                      onChange={(e) => setForm({ ...form, vendorItemCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button onClick={save} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PermissionGuard>
    </div>
  );
}