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
import { Plus, Search, Edit2, Trash2, AlertTriangle, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  getVendorPaymentsAction, 
  createVendorPaymentAction, 
  updateVendorPaymentAction, 
  deleteVendorPaymentAction 
} from "./actions";
import { PermissionGuard } from "@/app/components/PermissionGuard";
import { UserRole } from "@/lib/auth";
import { Badge } from "@/app/components/ui/badge";

interface Payment {
  id: string;
  vendorId: string;
  vendorName?: string;
  projectId?: string | null;
  projectName?: string;
  contractId?: string | null;
  paymentType: string;
  amount: number;
  dueDate: string;
  paidDate?: string | null;
  status: string;
  description?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export default function VendorPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState<Partial<Payment>>({
    vendorId: "",
    projectId: "",
    contractId: "",
    paymentType: "full_payment",
    amount: 0,
    dueDate: new Date().toISOString().split("T")[0],
    status: "pending",
    description: "",
    notes: "",
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getVendorPaymentsAction(search);
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setPayments(res.data);
      }
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

  const openCreate = () => {
    setEditing(null);
    setForm({
      vendorId: "",
      projectId: "",
      contractId: "",
      paymentType: "full_payment",
      amount: 0,
      dueDate: new Date().toISOString().split("T")[0],
      status: "pending",
      description: "",
      notes: "",
    });
    setModalOpen(true);
  };

  const openEdit = (p: Payment) => {
    setEditing(p);
    setForm({ 
      ...p,
      dueDate: p.dueDate ? new Date(p.dueDate).toISOString().split("T")[0] : "",
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.vendorId || !form.paymentType || !form.dueDate || form.amount === undefined) {
      toast.error("Please fill in required fields (Vendor ID, Payment Type, Due Date, Amount)");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        vendorId: form.vendorId,
        projectId: form.projectId || null,
        contractId: form.contractId || null,
        paymentType: form.paymentType,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        status: form.status,
        description: form.description || null,
        notes: form.notes || null,
      };

      let res;
      if (editing) {
        res = await updateVendorPaymentAction(editing.id, payload);
      } else {
        res = await createVendorPaymentAction(payload);
      }

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(editing ? "Payment updated" : "Payment created");
        setModalOpen(false);
        load();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to save payment");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this payment?")) return;
    try {
      const res = await deleteVendorPaymentAction(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Payment deleted");
        load();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete payment");
    }
  };

  const fmt = (n?: number | null) => (n != null ? n.toLocaleString() : "-");
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString() : "-";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Vendor Payments"
        breadcrumbs={[
          { label: "Expenses", href: "/expenses" },
          { label: "Payments" },
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
            <h1 className="text-2xl font-bold text-slate-900">Vendor Payments</h1>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" /> Add Payment
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
                placeholder="Search description..."
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
                      <TableHead>Project</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.vendorName || p.vendorId}</TableCell>
                        <TableCell>{p.projectName || "-"}</TableCell>
                        <TableCell className="capitalize">{p.paymentType.replace("_", " ")}</TableCell>
                        <TableCell>{formatDate(p.dueDate)}</TableCell>
                        <TableCell className="text-right font-semibold">฿{fmt(p.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === "paid" ? "default" : p.status === "overdue" ? "destructive" : "secondary"}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={p.description || ""}>
                          {p.description || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {payments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                          No payments found.
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
                <DialogTitle>{editing ? "Edit Payment" : "Add Payment"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Vendor ID *</label>
                    <Input
                      value={form.vendorId || ""}
                      onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                      placeholder="UUID"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Project ID</label>
                    <Input
                      value={form.projectId || ""}
                      onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                      placeholder="UUID (Optional)"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Payment Type *</label>
                    <Input
                      value={form.paymentType || ""}
                      onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Due Date *</label>
                    <Input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Amount *</label>
                    <Input
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Status</label>
                    <Input
                      value={form.status || "pending"}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Input
                      value={form.description || ""}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1 block">Notes</label>
                    <Input
                      value={form.notes || ""}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
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