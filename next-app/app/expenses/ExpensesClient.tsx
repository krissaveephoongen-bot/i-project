"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  Truck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  LayoutGrid,
  List,
} from "lucide-react";
import Header from "../components/Header";
import { PermissionGuard } from "@/app/components/PermissionGuard";
import { UserRole } from "@/lib/auth";
import { useAuth } from "../components/AuthProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/hooks/useLanguage";
import { getExpensePageLabels } from "@/lib/services/expenses.utils";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
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
import { Textarea } from "@/app/components/ui/textarea";
import {
  validateRequired,
  validatePositiveNumber,
  validateDateIsInPast,
} from "@/lib/validation";
import {
  toastCreateSuccess,
  toastUpdateSuccess,
  toastDeleteSuccess,
  toastError,
  toastValidationError,
} from "@/lib/toast-utils";
import {
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
  approveExpenseAction,
  rejectExpenseAction,
} from "./actions";
import { ProfessionalFilter } from "@/components/ProfessionalFilter";
import { usePermissions } from "@/app/hooks/usePermissions";
import { toast } from "react-hot-toast";

interface Expense {
  id: string;
  projectId: string;
  taskId?: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
  receiptUrl?: string;
  details?: any;
  status: "pending" | "approved" | "rejected";
  rejectedReason?: string;
  project?: { name: string };
  task?: { title: string };
}

interface Project {
  id: string;
  name: string;
}

interface ExpensesClientProps {
  initialExpenses: Expense[];
  initialProjects: Project[];
  vendorPendingAmount?: number;
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

export default function ExpensesClient({
  initialExpenses,
  initialProjects,
  vendorPendingAmount = 0,
}: ExpensesClientProps) {
  const { user } = useAuth();
  const { userRole } = usePermissions();
  const router = useRouter();
  const { language } = useLanguage();
  const labels = getExpensePageLabels(language);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    projectId: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    category: "",
    description: "",
    receiptUrl: "",
  });

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingId(expense.id);
      setFormData({
        projectId: expense.projectId,
        date: expense.date,
        amount: String(expense.amount),
        category: expense.category,
        description: expense.description || "",
        receiptUrl: expense.receiptUrl || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        projectId: "",
        date: new Date().toISOString().split("T")[0],
        amount: "",
        category: "",
        description: "",
        receiptUrl: "",
      });
    }
    setModalOpen(true);
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteExpenseAction(deletingId);
      if (res.error) {
        toastError("delete", res.error);
      } else {
        setExpenses((prev) => prev.filter((e) => e.id !== deletingId));
        toastDeleteSuccess("Expense");
      }
    } catch (error: any) {
      toastError("delete", error.message);
    } finally {
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const handleSubmit = async () => {
    // Validation
    const projectError = validateRequired(formData.projectId, "Project");
    if (projectError) {
      toastValidationError(undefined, projectError);
      return;
    }

    const dateError = validateRequired(formData.date, "Date");
    if (dateError) {
      toastValidationError(undefined, dateError);
      return;
    }

    const dateInPastError = validateDateIsInPast(formData.date, "Date");
    if (dateInPastError) {
      toastValidationError(undefined, dateInPastError);
      return;
    }

    const amountError = validateRequired(formData.amount, "Amount");
    if (amountError) {
      toastValidationError(undefined, amountError);
      return;
    }

    const amount = Number(formData.amount);
    const amountPositiveError = validatePositiveNumber(amount, "Amount");
    if (amountPositiveError) {
      toastValidationError(undefined, amountPositiveError);
      return;
    }

    const categoryError = validateRequired(formData.category, "Category");
    if (categoryError) {
      toastValidationError(undefined, categoryError);
      return;
    }

    if (!user) {
      toastError("save", "User not authenticated");
      return;
    }

    try {
      const payload = {
        userId: user.id,
        projectId: formData.projectId,
        date: formData.date,
        amount: amount,
        category: formData.category,
        description: formData.description,
        receiptUrl: formData.receiptUrl,
      };

      let result;
      if (editingId) {
        result = await updateExpenseAction(editingId, payload);
      } else {
        result = await createExpenseAction(payload);
      }

      if (result.error) {
        toastError("save", result.error);
      } else if (result.data) {
        if (editingId) {
          toastUpdateSuccess("Expense");
          setExpenses((prev) =>
            prev.map((e) => (e.id === editingId ? { ...e, ...result.data } : e))
          );
        } else {
          toastCreateSuccess("Expense");
          const newExpense = result.data;
          const project = initialProjects.find(p => p.id === newExpense.project_id);
          const expenseWithDetails = {
            ...newExpense,
            projectId: newExpense.project_id,
            project: { name: project?.name || "Unknown" }
          };
          setExpenses((prev) => [expenseWithDetails as any, ...prev]);
        }
        setModalOpen(false);
        router.refresh();
      }
    } catch (error: any) {
      toastError("save", error.message);
    }
  };

  // Approval Handlers
  const handleApprove = async (id: string) => {
    try {
      const res = await approveExpenseAction(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Expense approved successfully");
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: "approved" } : e));
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to approve");
    }
  };

  const handleRejectClick = (id: string) => {
    setRejectId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectId) return;
    try {
      const res = await rejectExpenseAction(rejectId, rejectReason);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Expense rejected");
        setExpenses(prev => prev.map(e => e.id === rejectId ? { ...e, status: "rejected", rejectedReason: rejectReason } : e));
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reject");
    } finally {
      setRejectModalOpen(false);
      setRejectId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
            Approved
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pending</Badge>;
    }
  };

  // Filter Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = !searchTerm || 
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
      const matchesProject = projectFilter === "all" || expense.projectId === projectFilter;
      
      let matchesDate = true;
      if (dateRange.from && dateRange.to) {
        const expDate = new Date(expense.date);
        matchesDate = expDate >= dateRange.from && expDate <= dateRange.to;
      }

      return matchesSearch && matchesStatus && matchesProject && matchesDate;
    });
  }, [expenses, searchTerm, statusFilter, projectFilter, dateRange]);

  // Summary Stats
  const totalPending = filteredExpenses.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0);
  const totalApproved = filteredExpenses.filter(e => e.status === "approved").reduce((sum, e) => sum + e.amount, 0);
  const countPending = filteredExpenses.filter(e => e.status === "pending").length;

  const isAdminOrManager = userRole === "admin" || userRole === "manager";

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="My Expenses"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: labels.title },
        ]}
      />

      <PermissionGuard
        roles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE]}
        fallback={
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Access Denied</h3>
            <p className="text-slate-600">You don't have permission to view this page.</p>
          </div>
        }
      >
        <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {language === "th" ? "การเรียกร้องค่าใช้จ่าย" : "Expense Claims"}
              </h1>
              <p className="text-slate-500">
                {language === "th" ? "จัดการและติดตามค่าใช้จ่ายของโครงการของคุณ" : "Manage and track your project expenses"}
              </p>
            </div>
            <div className="flex gap-2">
              <LanguageSwitcher />
            </div>
            
            {/* Action Bar */}
            <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-xl shadow-sm border border-slate-100">
              <Link href="/expenses/memo">
                <Button variant="ghost" className="gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                  <FileText className="h-4 w-4" /> {labels.viewMemo}
                </Button>
              </Link>
              <div className="w-px h-6 bg-slate-200 mx-1" />
              <Link href="/expenses/travel">
                <Button variant="ghost" className="gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                  <Truck className="h-4 w-4" /> {labels.viewTravel}
                </Button>
              </Link>
              <div className="w-px h-6 bg-slate-200 mx-1" />
              <Link href="/expenses/vendor-items">
                <Button variant="ghost" className="gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                  <List className="h-4 w-4" /> Vendor Items
                </Button>
              </Link>
              <Link href="/expenses/vendor-payments">
                <Button variant="ghost" className="gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                  <DollarSign className="h-4 w-4" /> Vendor Payments
                </Button>
              </Link>
              {isAdminOrManager && (
                <>
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  <Link href="/admin/vendors">
                    <Button variant="ghost" className="gap-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50">
                      <LayoutGrid className="h-4 w-4" /> Vendors
                    </Button>
                  </Link>
                </>
              )}
              
              <div className="flex-1" />
              
              <Button
                onClick={() => handleOpenModal()}
                className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 ml-2"
              >
                <Plus className="h-4 w-4" />
                {language === "th" ? "เรียกร้องใหม่" : "New Claim"}
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">My Pending Approval</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">฿{totalPending.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{countPending} requests waiting</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">My Approved Claims</CardTitle>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">฿{totalApproved.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total approved amount</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Vendor Payments Due</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">฿{vendorPendingAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Pending vendor payments</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Total Claims</CardTitle>
                <FileText className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  ฿{filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">{filteredExpenses.length} total records</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expense List</CardTitle>
              <CardDescription>View and manage expense claims</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProfessionalFilter
                searchPlaceholder="Search description or category..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={[
                  {
                    key: "status",
                    label: "Status",
                    value: statusFilter,
                    type: "static",
                    staticOptions: [
                      { value: "pending", label: "Pending" },
                      { value: "approved", label: "Approved" },
                      { value: "rejected", label: "Rejected" },
                    ],
                    onChange: setStatusFilter,
                  },
                  {
                    key: "project",
                    label: "Project",
                    value: projectFilter,
                    type: "static",
                    staticOptions: initialProjects.map(p => ({ value: p.id, label: p.name })),
                    onChange: setProjectFilter,
                  }
                ]}
                showDateFilter={true}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                resultCount={filteredExpenses.length}
                totalItems={expenses.length}
                onClearAll={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setProjectFilter("all");
                  setDateRange({ from: undefined, to: undefined });
                }}
              />

              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{labels.date}</TableHead>
                      <TableHead>{labels.project}</TableHead>
                      <TableHead>{labels.category}</TableHead>
                      <TableHead>{labels.description}</TableHead>
                      <TableHead className="text-right">{labels.amount}</TableHead>
                      <TableHead className="text-center">{labels.status}</TableHead>
                      <TableHead className="text-right">{language === "th" ? "การกระทำ" : "Actions"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-32 text-slate-500">
                          {labels.noExpenses}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">{expense.project?.name || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">{expense.category}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate" title={expense.description}>
                            {expense.description || "-"}
                            {expense.rejectedReason && (
                              <div className="text-xs text-red-500 mt-1">Reason: {expense.rejectedReason}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">฿{expense.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-center">{getStatusBadge(expense.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {/* Approval Actions (Admin/Manager only) */}
                              {isAdminOrManager && expense.status === "pending" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleApprove(expense.id)}
                                    title="Approve"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleRejectClick(expense.id)}
                                    title="Reject"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              
                              {/* Edit/Delete Actions (Owner or Admin if pending) */}
                              {(expense.status === "pending" || expense.status === "rejected") && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                                    onClick={() => handleOpenModal(expense)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                                    onClick={() => handleDeleteClick(expense.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Expense Modal */}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? labels.edit : (language === "th" ? "เรียกร้องค่าใช้จ่ายใหม่" : "New Expense Claim")}
                </DialogTitle>
                <DialogDescription>
                  {language === "th" ? "กรอกรายละเอียดสำหรับการเรียกร้องค่าใช้จ่ายของคุณ" : "Fill in the details for your expense claim."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{labels.date}</label>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        type="date"
                        className="pl-9"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{language === "th" ? "จำนวนเงิน (บาท)" : "Amount (THB)"}</label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        type="number"
                        className="pl-9"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{labels.project}</label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(val) => setFormData({ ...formData, projectId: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                      {initialProjects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{labels.category}</label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{labels.description}</label>
                  <Textarea
                    placeholder="Describe the expense..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {language === "th" ? "URL ใบเสร็จรับเงิน (ไม่บังคับ)" : "Receipt URL (Optional)"}
                  </label>
                  <Input
                    placeholder="https://example.com/receipt.jpg"
                    value={formData.receiptUrl}
                    onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setModalOpen(false)}>{labels.cancel}</Button>
                <Button onClick={handleSubmit}>{language === "th" ? "บันทึกการเรียกร้อง" : "Save Claim"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>{language === "th" ? "ยืนยันการลบ" : "Confirm Deletion"}</DialogTitle>
                <DialogDescription>
                  {language === "th" ? "คุณแน่ใจหรือว่าต้องการลบค่าใช้จ่ายนี้? การกระทำนี้ไม่สามารถยกเลิกได้" : "Are you sure you want to delete this expense? This action cannot be undone."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>{labels.cancel}</Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>{labels.delete}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reject Dialog */}
          <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Reject Expense</DialogTitle>
                <DialogDescription>Please provide a reason for rejection.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea
                  placeholder="Reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleConfirmReject} disabled={!rejectReason.trim()}>Reject</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PermissionGuard>
    </div>
  );
}