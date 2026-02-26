"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "../components/Header";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import {
  getUsers,
  updateUserAction,
  deleteUserAction,
  createUserAction,
  type User,
} from "./actions";
import PageTransition from "@/app/components/PageTransition";
import { Skeleton } from "@/app/components/ui/Skeleton";
import {
  toastCreateSuccess,
  toastUpdateSuccess,
  toastDeleteSuccess,
  toastError,
  toastValidationError,
} from "@/lib/toast-utils";
import {
  Search,
  Plus,
  MoreHorizontal,
  User as UserIcon,
  Mail,
  Shield,
  Clock,
  Trash2,
  Edit,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

// Shadcn UI
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateEmail } from "@/lib/validation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  employeeCode?: string;
}

export default function UsersPage() {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "employee" | "manager" | "admin"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "employee",
    isActive: true,
    employeeCode: 0 as any,
    timezone: "Asia/Bangkok",
  });
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const queryClient = useQueryClient();

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUserAction(userId),
    onSuccess: () => {
      toastDeleteSuccess("User");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toastError("delete", error?.message);
    },
  });

  // Fetch Users
  const usersQuery = useQuery({
    queryKey: ["users", search, roleFilter, statusFilter],
    queryFn: async () => {
      const rows = await getUsers({
        q: search || "",
        role: roleFilter === "all" ? "" : roleFilter,
        status: statusFilter === "all" ? "" : statusFilter,
      });
      return rows;
    },
  });

  useEffect(() => {
    setLoading(usersQuery.isLoading);
    setUsers(usersQuery.data || []);
    setError(
      usersQuery.isError
        ? (usersQuery.error as any)?.message || "Failed to load users"
        : null,
    );
  }, [
    usersQuery.isLoading,
    usersQuery.data,
    usersQuery.isError,
    usersQuery.error,
  ]);

  // Client-side filtering (optional, if server filtering isn't enough or for immediate feedback)
  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? u.isActive : !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Validation function
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name?.trim()) {
      errors.name = "ชื่อเป็นข้อมูลที่จำเป็น";
    } else if (formData.name.length < 2) {
      errors.name = "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร";
    }

    if (!formData.email?.trim()) {
      errors.email = "อีเมลเป็นข้อมูลที่จำเป็น";
    } else if (!EMAIL_REGEX.test(formData.email)) {
      errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!editingUser && !password) {
      errors.password = "กรุณาตั้งรหัสผ่านสำหรับผู้ใช้ใหม่";
    } else if (password && password.length < 6) {
      errors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }

    if (formData.employeeCode && Number(formData.employeeCode) <= 0) {
      errors.employeeCode = "รหัสพนักงานต้องมากกว่า 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        employeeCode: user.employeeCode,
        timezone: user.timezone,
      });
      setPassword("");
      setShowPassword(false);
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        role: "employee",
        isActive: true,
        employeeCode: 0 as any,
        timezone: "Asia/Bangkok",
      });
      setPassword("");
      setShowPassword(true);
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toastValidationError();
      return;
    }

    try {
      if (editingUser) {
        // Update
        const payload: any = { ...formData };
        if (showPassword && password) payload.password = password;
        const result = await updateUserAction(editingUser.id, payload);
        if (result.error) throw new Error(result.error);
        toastUpdateSuccess("User");
      } else {
        // Create
        const payload: any = { ...formData, password };
        const result = await createUserAction(payload);
        if (result.error) throw new Error(result.error);
        toastCreateSuccess("User");
      }

      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsModalOpen(false);
    } catch (e: any) {
      toastError("save", e?.message);
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeleteConfirm({ id: user.id, name: user.name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    deleteUserMutation.mutate(deleteConfirm.id);
  };

  const exportCsv = () => {
    const header = [
      "Name",
      "Email",
      "Role",
      "Active",
      "EmployeeCode",
      "Timezone",
    ];
    const lines = [
      header.join(","),
      ...filteredUsers.map((u) =>
        [
          u.name,
          u.email,
          u.role,
          String(u.isActive),
          u.employeeCode || "",
          u.timezone,
        ].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Helper for Badge colors
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"; // Red/High
      case "manager":
        return "default"; // Blue/Primary
      default:
        return "secondary"; // Grey
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="การจัดการผู้ใช้งาน"
          breadcrumbs={[
            { label: "แดชบอร์ด", href: "/" },
            { label: "ผู้ใช้งาน" },
          ]}
        />

        <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
          {/* Top Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                ผู้ใช้งาน
              </h1>
              <p className="text-slate-500 mt-1">
                จัดการสิทธิ์การเข้าถึงและข้อมูลพนักงาน
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportCsv} className="gap-2">
                <Download className="h-4 w-4" /> ส่งออก CSV
              </Button>
              <Button
                onClick={() => handleOpenModal()}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4" /> เพิ่มผู้ใช้
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="ค้นหาชื่อ, อีเมล..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <Select
                  value={roleFilter}
                  onValueChange={(val: any) => setRoleFilter(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ทุกบทบาท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกบทบาท</SelectItem>
                    <SelectItem value="employee">พนักงาน (Employee)</SelectItem>
                    <SelectItem value="manager">ผู้จัดการ (Manager)</SelectItem>
                    <SelectItem value="admin">ผู้ดูแลระบบ (Admin)</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(val: any) => setStatusFilter(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ทุกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกสถานะ</SelectItem>
                    <SelectItem value="active">ใช้งานอยู่</SelectItem>
                    <SelectItem value="inactive">ระงับการใช้งาน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">
                      ผู้ใช้
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      บทบาท
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      สถานะ
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      รหัสพนักงาน
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      โซนเวลา
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">
                      จัดการ
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Skeleton Loading Rows
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-8 ml-auto rounded-md" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">
                              {user.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getRoleBadgeVariant(user.role)}
                            className="uppercase text-[10px]"
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                              <CheckCircle2 className="h-4 w-4" /> ใช้งานอยู่
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                              <XCircle className="h-4 w-4" /> ระงับการใช้งาน
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-mono text-slate-600">
                          {user.employeeCode || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {user.timezone || "Asia/Bangkok"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-slate-100"
                              >
                                <MoreHorizontal className="h-4 w-4 text-slate-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>จัดการ</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleOpenModal(user)}
                                className="cursor-pointer"
                              >
                                <Edit className="h-4 w-4 mr-2" /> แก้ไขผู้ใช้
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 cursor-pointer"
                                onClick={() => handleDeleteClick(user)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> ลบผู้ใช้
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add/Edit Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "แก้ไขผู้ใช้" : "สร้างผู้ใช้ใหม่"}
                </DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? "อัปเดตข้อมูลผู้ใช้และสิทธิ์"
                    : "เพิ่มผู้ใช้ใหม่เข้าสู่ระบบ"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name)
                        setFormErrors({ ...formErrors, name: undefined });
                    }}
                    placeholder="สมชาย ใจดี"
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (formErrors.email)
                        setFormErrors({ ...formErrors, email: undefined });
                    }}
                    placeholder="somchai@example.com"
                    className={formErrors.email ? "border-red-500" : ""}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">บทบาท</label>
                    <Select
                      value={formData.role}
                      onValueChange={(val: any) =>
                        setFormData({ ...formData, role: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกบทบาท" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">พนักงาน</SelectItem>
                        <SelectItem value="manager">ผู้จัดการ</SelectItem>
                        <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">รหัสพนักงาน</label>
                    <Input
                      type="number"
                      value={formData.employeeCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          employeeCode: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {editingUser ? "รหัสผ่านใหม่ (ไม่บังคับ)" : "รหัสผ่าน"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      {editingUser && (
                        <>
                          <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={(e) => setShowPassword(e.target.checked)}
                          />
                          <span>เปลี่ยนรหัสผ่าน</span>
                        </>
                      )}
                    </label>
                  </div>
                  {(!editingUser || showPassword) && (
                    <>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (formErrors.password)
                            setFormErrors({
                              ...formErrors,
                              password: undefined,
                            });
                        }}
                        placeholder={
                          editingUser
                            ? "เว้นว่างไว้หากไม่ต้องการเปลี่ยน"
                            : "ตั้งรหัสผ่านเริ่มต้น"
                        }
                        className={formErrors.password ? "border-red-500" : ""}
                      />
                      {formErrors.password && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.password}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">สถานะ</label>
                  <Select
                    value={formData.isActive ? "active" : "inactive"}
                    onValueChange={(val) =>
                      setFormData({ ...formData, isActive: val === "active" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">ใช้งานอยู่</SelectItem>
                      <SelectItem value="inactive">ระงับการใช้งาน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingUser ? "บันทึก" : "สร้างผู้ใช้"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationDialog
            open={!!deleteConfirm}
            title="ยืนยันการลบผู้ใช้"
            description="เมื่อลบผู้ใช้นี้ จะไม่สามารถกู้คืนข้อมูลได้"
            entityName={deleteConfirm?.name}
            isLoading={deleteUserMutation.isPending}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeleteConfirm(null)}
            isDangerous={true}
          />
        </div>
      </div>
    </PageTransition>
  );
}
