"use client";

import { useState } from "react";
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
} from "lucide-react";
import Header from "../components/Header";
import { PermissionGuard } from "@/app/components/PermissionGuard";
import { UserRole } from "@/lib/auth";
import { useAuth } from "../components/AuthProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/hooks/useLanguage";
import { getExpensePageLabels } from "@/lib/services/expenses.utils";
import { Button } from "@/app/components/ui/Button";
import {
  Card,
  CardContent,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/Select";
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
} from "@/app/components/ui/Dialog";
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
} from "./actions";

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
}: ExpensesClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const labels = getExpensePageLabels(language);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  
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
          // Add new expense to list immediately or wait for revalidate
          // Since we revalidatePath in action, router.refresh() might be needed or just rely on local update
          const newExpense = result.data;
          // Optimistically add display fields
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Approved
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

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
            <h3 className="text-lg font-semibold">
              ต้องการสิทธิ์ Admin/Manager
            </h3>
            <p className="text-slate-600">
              หน้านี้สำหรับสำหรับ Admin/Manager เท่านั้น
            </p>
          </div>
        }
      >
        <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {language === "th"
                  ? "การเรียกร้องค่าใช้จ่าย"
                  : "Expense Claims"}
              </h1>
              <p className="text-slate-500">
                {language === "th"
                  ? "จัดการและติดตามค่าใช้จ่ายของโครงการของคุณ"
                  : "Manage and track your project expenses"}
              </p>
            </div>
            <div className="flex gap-2">
              <LanguageSwitcher />
              <Link href="/expenses/memo">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" /> {labels.viewMemo}
                </Button>
              </Link>
              <Link href="/expenses/travel">
                <Button variant="outline" className="gap-2">
                  <Truck className="h-4 w-4" /> {labels.viewTravel}
                </Button>
              </Link>
              <Button
                onClick={() => handleOpenModal()}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />{" "}
                {language === "th" ? "เรียกร้องใหม่" : "New Claim"}
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{labels.date}</TableHead>
                    <TableHead>{labels.project}</TableHead>
                    <TableHead>{labels.category}</TableHead>
                    <TableHead>{labels.description}</TableHead>
                    <TableHead className="text-right">
                      {labels.amount}
                    </TableHead>
                    <TableHead className="text-center">
                      {labels.status}
                    </TableHead>
                    <TableHead className="text-right">
                      {language === "th" ? "การกระทำ" : "Actions"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center h-32 text-slate-500"
                      >
                        {labels.noExpenses}
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          {new Date(expense.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {expense.project?.name || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="max-w-[200px] truncate"
                          title={expense.description}
                        >
                          {expense.description || "-"}
                          {expense.rejectedReason && (
                            <div className="text-xs text-red-500 mt-1">
                              Reason: {expense.rejectedReason}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ฿{expense.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(expense.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          {(expense.status === "pending" ||
                            expense.status === "rejected") && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenModal(expense)}
                              >
                                <Edit2 className="h-4 w-4 text-slate-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:text-red-600"
                                onClick={() => handleDeleteClick(expense.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Expense Modal */}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingId
                    ? labels.edit
                    : language === "th"
                      ? "เรียกร้องค่าใช้จ่ายใหม่"
                      : "New Expense Claim"}
                </DialogTitle>
                <DialogDescription>
                  {language === "th"
                    ? "กรอกรายละเอียดสำหรับการเรียกร้องค่าใช้จ่ายของคุณ"
                    : "Fill in the details for your expense claim."}
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
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === "th" ? "จำนวนเงิน (บาท)" : "Amount (THB)"}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        type="number"
                        className="pl-9"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {labels.project}
                  </label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(val) =>
                      setFormData({ ...formData, projectId: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                      {initialProjects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {labels.category}
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) =>
                      setFormData({ ...formData, category: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {labels.description}
                  </label>
                  <Textarea
                    placeholder="Describe the expense..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {language === "th"
                      ? "URL ใบเสร็จรับเงิน (ไม่บังคับ)"
                      : "Receipt URL (Optional)"}
                  </label>
                  <Input
                    placeholder="https://example.com/receipt.jpg"
                    value={formData.receiptUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, receiptUrl: e.target.value })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  {labels.cancel}
                </Button>
                <Button onClick={handleSubmit}>
                  {language === "th" ? "บันทึกการเรียกร้อง" : "Save Claim"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>
                  {language === "th" ? "ยืนยันการลบ" : "Confirm Deletion"}
                </DialogTitle>
                <DialogDescription>
                  {language === "th"
                    ? "คุณแน่ใจหรือว่าต้องการลบค่าใช้จ่ายนี้? การกระทำนี้ไม่สามารถยกเลิกได้"
                    : "Are you sure you want to delete this expense? This action cannot be undone."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  {labels.cancel}
                </Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>
                  {labels.delete}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PermissionGuard>
    </div>
  );
}
