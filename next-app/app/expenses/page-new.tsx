"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/components/AuthProvider";
import PageTransition from "@/app/components/PageTransition";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";

interface Expense {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
  receiptUrl?: string;
  status: "pending" | "approved" | "rejected";
  rejectedReason?: string;
  project?: { name: string };
  task?: { title: string };
}

interface Project {
  id: string;
  name: string;
}

const CATEGORIES = [
  "Travel",
  "Meals",
  "Lodging",
  "Office Supplies",
  "Software",
  "Hardware",
  "Other",
];

export default function ExpensesPage() {
  const { user } = useAuth();

  // State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailExpense, setDetailExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    projectId: "",
    taskId: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    category: "",
    description: "",
    receiptUrl: "",
  });

  // Fetch Data
  const fetchData = async () => {
    try {
      if (!user?.id) return;
      if (!loading) setRefreshing(true);
      setError(null);

      const [expensesRes, projectsRes] = await Promise.all([
        fetch(`/api/expenses?userId=${user.id}`, { cache: "no-store" }),
        fetch("/api/projects?userId=" + user.id, { cache: "no-store" }).catch(
          () => ({ ok: false }),
        ),
      ]);

      if (!expensesRes.ok) throw new Error("Failed to fetch expenses");

      const expensesData = await (expensesRes as Response).json();
      setExpenses(Array.isArray(expensesData) ? expensesData : []);

      if (projectsRes.ok) {
        const projectsData = await (projectsRes as Response).json();
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      }
    } catch (e: any) {
      console.error("Fetch error:", e);
      setError(e?.message || "Failed to load expense data");
      toast.error(e?.message || "Error loading data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Computed Data
  const summary = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const approved = expenses
      .filter((e) => e.status === "approved")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const pending = expenses
      .filter((e) => e.status === "pending")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const rejected = expenses
      .filter((e) => e.status === "rejected")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return { total, approved, pending, rejected, count: expenses.length };
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      const key = e.category || "Other";
      map.set(key, (map.get(key) || 0) + Number(e.amount || 0));
    });
    return Array.from(map.entries()).map(([cat, amount]) => ({
      category: cat,
      amount,
    }));
  }, [expenses]);

  // Handlers
  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      projectId: "",
      taskId: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      category: "",
      description: "",
      receiptUrl: "",
    });
    setModalOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setFormData({
      projectId: expense.projectId,
      taskId: expense.taskId || "",
      date: expense.date,
      amount: String(expense.amount),
      category: expense.category,
      description: expense.description || "",
      receiptUrl: expense.receiptUrl || "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (
        !formData.projectId ||
        !formData.date ||
        !formData.amount ||
        !formData.category
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      const payload = {
        user_id: user?.id,
        project_id: formData.projectId,
        task_id: formData.taskId || null,
        date: formData.date,
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description || null,
        receiptUrl: formData.receiptUrl || null,
      };

      const url = editingId ? `/api/expenses` : "/api/expenses";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { id: editingId, ...payload } : payload,
        ),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save expense");
      }

      toast.success(editingId ? "Expense updated" : "Expense created");
      await fetchData();
      setModalOpen(false);
    } catch (e: any) {
      console.error("Save error:", e);
      toast.error(e?.message || "Error saving expense");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete");
      }

      toast.success("Expense deleted");
      await fetchData();
    } catch (e: any) {
      console.error("Delete error:", e);
      toast.error(e?.message || "Error deleting expense");
    }
  };

  const handleViewDetail = (expense: Expense) => {
    setDetailExpense(expense);
    setDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-8 pt-24 space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 p-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center max-w-md space-y-2">
          <h3 className="text-xl font-bold text-slate-900">
            Error Loading Expenses
          </h3>
          <p className="text-slate-500">{error}</p>
        </div>
        <Button onClick={fetchData} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-slate-50/50">
      <Header
        title="Expenses"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Expenses" }]}
      />

      <div className="pt-24 px-8 pb-12 max-w-[1400px] mx-auto space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Amount
              </CardTitle>
              <DollarSign className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ฿{summary.total.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {summary.count} expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Approved
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ฿{summary.approved.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Pending
              </CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                ฿{summary.pending.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Rejected
              </CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ฿{summary.rejected.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Expenses</h1>
            <p className="text-slate-500 mt-1">
              Track and manage expense claims
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchData}
              disabled={refreshing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {expenses.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No expenses yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-28">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          {expense.date}
                        </TableCell>
                        <TableCell>{expense.project?.name || "-"}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell className="text-right font-medium">
                          ฿{Number(expense.amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {expense.description}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              expense.status === "approved"
                                ? "default"
                                : expense.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {expense.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleViewDetail(expense)}
                              className="p-1 hover:bg-slate-100 rounded"
                              title="View details"
                            >
                              <Eye className="w-4 h-4 text-slate-500" />
                            </button>
                            {expense.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleEdit(expense)}
                                  className="p-1 hover:bg-slate-100 rounded"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4 text-blue-500" />
                                </button>
                                <button
                                  onClick={() => handleDelete(expense.id)}
                                  className="p-1 hover:bg-slate-100 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Expense" : "Add Expense"}
              </DialogTitle>
              <DialogDescription>Record a new expense claim</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Project *
                </label>
                <Select
                  value={formData.projectId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, projectId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category *
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  placeholder="What is this expense for?"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Receipt URL
                </label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={formData.receiptUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, receiptUrl: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Modal */}
        {detailExpense && (
          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Expense Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Date
                    </label>
                    <p className="text-lg font-semibold">
                      {detailExpense.date}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Amount
                    </label>
                    <p className="text-lg font-semibold">
                      ฿{Number(detailExpense.amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Project
                  </label>
                  <p className="text-lg font-semibold">
                    {detailExpense.project?.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Category
                  </label>
                  <p className="text-lg font-semibold">
                    {detailExpense.category}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Status
                  </label>
                  <Badge
                    className="mt-2"
                    variant={
                      detailExpense.status === "approved"
                        ? "default"
                        : detailExpense.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {detailExpense.status}
                  </Badge>
                </div>

                {detailExpense.description && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Description
                    </label>
                    <p className="text-sm text-slate-600 mt-1">
                      {detailExpense.description}
                    </p>
                  </div>
                )}

                {detailExpense.rejectedReason && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <label className="text-sm font-medium text-red-900">
                      Rejection Reason
                    </label>
                    <p className="text-sm text-red-700 mt-1">
                      {detailExpense.rejectedReason}
                    </p>
                  </div>
                )}

                {detailExpense.receiptUrl && (
                  <div>
                    <a
                      href={detailExpense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Receipt
                    </a>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button onClick={() => setDetailOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </PageTransition>
  );
}
