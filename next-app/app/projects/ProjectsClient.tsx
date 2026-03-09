"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  LayoutGrid,
  List,
  Calendar,
  User,
  Users,
  Eye,
  AlertTriangle,
  Folder,
  Activity,
  CheckCircle,
  Download,
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import {
  PermissionGuard,
  CanCreateProjects,
  CanEditProjects,
} from "../components/PermissionGuard";
import { Permission } from "../lib/auth";
import { usePermissions } from "../hooks/usePermissions";
import { logProjectAction } from "../lib/audit";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { DataTable } from "../components/data-table";
import { ProfessionalFilter } from "@/components/ProfessionalFilter";
import { EmptyState } from "@/components/ui/empty-state";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
} from "./actions";
import {
  Project as ProjectType,
} from "../lib/projects";
import ProjectSheet from "../components/ProjectSheet";
import { ColumnDef } from "@tanstack/react-table";
import { clsx } from "clsx";
import { toast } from "react-hot-toast";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// Enhanced Project type with derived data
interface EnhancedProject extends ProjectType {
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  statusColor: string;
  daysRemaining: number;
  isOverdue: boolean;
}

interface ProjectManager {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface ProjectsClientProps {
  initialProjects: ProjectType[];
  initialManagers: ProjectManager[];
}

// Helper to safely format date
const safeFormatDate = (dateString: string | null | undefined, formatStr: string = "d MMM yyyy") => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (!isValid(date)) return "-";
    return format(date, formatStr, { locale: th });
  } catch (e) {
    console.error("Date formatting error:", e);
    return "-";
  }
};

export default function ProjectsClient({
  initialProjects = [],
  initialManagers = [],
}: ProjectsClientProps) {
  const queryClient = useQueryClient();
  // Safe permission hook usage
  let permissions = { userId: "", userName: "", userRole: "" };
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    permissions = usePermissions();
  } catch (e) {
    console.warn("usePermissions failed", e);
  }
  const { userId, userName, userRole } = permissions;
  
  const router = useRouter();

  // State management
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [savedViews, setSavedViews] = useState<Array<{ id?: string; name: string; cfg: any }>>([]);
  const [selectedView, setSelectedView] = useState<string>("");
  const [viewScope, setViewScope] = useState<"personal" | "global">("personal");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assignedOnly, setAssignedOnly] = useState(false);

  // Use initial data directly since we don't have client-side fetching setup in this component properly 
  // (the original code used useQuery with initialData but getProjects was async)
  const projectsData = initialProjects;
  
  // Managers might be static or fetched
  const managersData = initialManagers;

  // Derived filters from project data to ensure all options are available
  const availableStatuses = useMemo(() => {
    const statuses = new Set(projectsData?.map(p => p.status) || []);
    return Array.from(statuses).map(s => ({ value: s, label: s }));
  }, [projectsData]);

  const availableManagers = useMemo(() => {
    if (managersData && managersData.length > 0) {
      return managersData.map(m => ({ value: m.id, label: m.name }));
    }
    const managers = new Map();
    projectsData?.forEach(p => {
      if (p.managerId && p.manager_name) {
        managers.set(p.managerId, p.manager_name);
      }
    });
    return Array.from(managers.entries()).map(([id, name]) => ({ value: id, label: name }));
  }, [projectsData, managersData]);

  // Enhanced projects with computed fields
  const enhancedProjects: EnhancedProject[] = useMemo(() => {
    if (!projectsData || !Array.isArray(projectsData)) return [];

    return projectsData.filter(p => p && p.id).map((project) => {
      const riskLevel = calculateRiskLevel(project);
      const daysRemaining = calculateDaysRemaining(project);
      const isOverdue = daysRemaining < 0;

      return {
        ...project,
        riskLevel,
        statusColor: getStatusColor(project.status),
        daysRemaining: isNaN(daysRemaining) ? 0 : Math.abs(daysRemaining),
        isOverdue,
      };
    });
  }, [projectsData]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return enhancedProjects.filter((project) => {
      if (assignedOnly && userName) {
        const byManager =
          (project.manager_name || "").toLowerCase() ===
          (userName || "").toLowerCase();
        if (!byManager) return false;
      }
      const matchesSearch =
        !searchTerm ||
        (project.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.manager_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (project.code || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      const matchesManager =
        managerFilter === "all" || project.manager_name === managerFilter;
      const matchesPriority =
        priorityFilter === "all" || (project.priority || "").toLowerCase() === priorityFilter.toLowerCase();

      return (
        matchesSearch && matchesStatus && matchesManager && matchesPriority
      );
    });
  }, [
    enhancedProjects,
    searchTerm,
    statusFilter,
    managerFilter,
    priorityFilter,
    assignedOnly,
    userName,
  ]);

  const loadSavedViews = async () => {
    if (!userId) {
      setSavedViews([]);
      return;
    }
    try {
      const res = await fetch(`/api/saved-views?pageKey=projects&userId=${encodeURIComponent(userId)}&includeGlobal=1`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const views = (json?.views || []).map((v: any) => ({
          id: v.id,
          name: v.name,
          cfg: v.filters,
        }));
        setSavedViews(views);
        if (views.length && !selectedView) setSelectedView(views[0].name);
      } else {
         // Fallback to local storage
         throw new Error("API failed");
      }
    } catch {
      try {
        const raw = localStorage.getItem("projects_saved_views") || "[]";
        const arr = JSON.parse(raw);
        setSavedViews(Array.isArray(arr) ? arr : []);
      } catch {
        setSavedViews([]);
      }
    }
  };

  const saveCurrentView = async () => {
    const name = window.prompt("ตั้งชื่อมุมมองที่บันทึก");
    if (!name) return;
    const cfg = {
      searchTerm,
      statusFilter,
      managerFilter,
      priorityFilter,
      viewMode,
      assignedOnly,
    };
    try {
      if (userId) {
        const existing = savedViews.find(v => v.name === name);
        const res = await fetch("/api/saved-views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: existing?.id,
            userId: viewScope === "global" ? "*" : userId,
            pageKey: "projects",
            name,
            filters: cfg,
          }),
        });
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error || "save failed");
      } else {
        const next = savedViews.filter(v => v.name !== name).concat([{ name, cfg }]);
        localStorage.setItem("projects_saved_views", JSON.stringify(next));
      }
      await loadSavedViews();
      setSelectedView(name);
    } catch {
      const next = savedViews.filter(v => v.name !== name).concat([{ name, cfg }]);
      localStorage.setItem("projects_saved_views", JSON.stringify(next));
      setSavedViews(next);
      setSelectedView(name);
    }
  };

  const applyView = (name: string) => {
    setSelectedView(name);
    const v = savedViews.find(v => v.name === name);
    if (!v) return;
    const cfg = v.cfg || {};
    setSearchTerm(cfg.searchTerm ?? "");
    setStatusFilter(cfg.statusFilter ?? "all");
    setManagerFilter(cfg.managerFilter ?? "all");
    setPriorityFilter(cfg.priorityFilter ?? "all");
    setViewMode(cfg.viewMode ?? "grid");
    setAssignedOnly(!!cfg.assignedOnly);
  };

  const deleteView = async () => {
    if (!selectedView) return;
    try {
      const v = savedViews.find(v => v.name === selectedView);
      if (userId && v?.id) {
        await fetch(`/api/saved-views?id=${encodeURIComponent(v.id)}&userId=${encodeURIComponent(userId)}`, { method: "DELETE" });
      } else {
        const next = savedViews.filter(v => v.name !== selectedView);
        localStorage.setItem("projects_saved_views", JSON.stringify(next));
      }
      await loadSavedViews();
      setSelectedView("");
    } catch {
      const next = savedViews.filter(v => v.name !== selectedView);
      localStorage.setItem("projects_saved_views", JSON.stringify(next));
      setSavedViews(next);
      setSelectedView("");
    }
  };

  useEffect(() => {
    loadSavedViews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Filter options
  const filterOptions = [
    {
      key: "status",
      label: "สถานะ",
      value: statusFilter,
      type: "static" as const,
      staticOptions: [
        { value: "all", label: "ทั้งหมด" },
        ...availableStatuses,
      ],
      onChange: setStatusFilter,
    },
    {
      key: "manager",
      label: "ผู้จัดการ",
      value: managerFilter,
      type: "static" as const,
      staticOptions: [
        { value: "all", label: "ทั้งหมด" },
        ...availableManagers,
      ],
      onChange: setManagerFilter,
    },
    {
      key: "priority",
      label: "ความสำคัญ",
      value: priorityFilter,
      type: "static" as const,
      staticOptions: [
        { value: "all", label: "ทั้งหมด" },
        { value: "low", label: "ต่ำ" },
        { value: "medium", label: "ปานกลาง" },
        { value: "high", label: "สูง" },
      ],
      onChange: setPriorityFilter,
    },
  ];

  // Table columns definition
  const columns: ColumnDef<EnhancedProject>[] = [
    {
      accessorKey: "name",
      header: "ชื่อโครงการ",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.original.name || "Project")}`}
            />
            <AvatarFallback>{(row.original.name || "P").charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={`/projects/${row.original.id}`}
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              {row.original.name}
            </Link>
            <div className="text-xs text-muted-foreground font-mono mt-0.5">
              {row.original.code && `#${row.original.code}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "สถานะ",
      cell: ({ row }) => (
        <Badge variant={row.original.statusColor as any} className="shadow-sm">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "progress",
      header: "ความคืบหน้า",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 min-w-[120px]">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-bold text-foreground">
              {row.original.progress}%
            </span>
          </div>
          <Progress value={row.original.progress} className="h-2" />
        </div>
      ),
    },
    {
      accessorKey: "manager_name",
      header: "ผู้รับผิดชอบ",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-muted rounded-full">
            <User className="h-3 w-3 text-muted-foreground" />
          </div>
          <span className="text-sm text-foreground">
            {row.original.manager_name || "ไม่ระบุ"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "budget",
      header: "งบประมาณ",
      cell: ({ row }) => (
        <div className="flex items-center space-x-1 font-medium text-foreground">
          <span className="text-muted-foreground">฿</span>
          <span>
            {row.original.budget ? row.original.budget.toLocaleString() : "-"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "endDate",
      header: "กำหนดส่ง",
      cell: ({ row }) => {
        const isOverdue = row.original.isOverdue;
        const dateStr = safeFormatDate(row.original.endDate, "d MMM yyyy");

        if (dateStr === "-") return <span className="text-muted-foreground text-xs">-</span>;

        return (
          <div
            className={clsx(
              "flex items-center space-x-1.5 rounded-md w-fit px-2 py-1",
              isOverdue
                ? "text-destructive bg-destructive/10"
                : "text-muted-foreground",
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-sm">
              {dateStr}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "riskLevel",
      header: "ความเสี่ยง",
      cell: ({ row }) => (
        <Badge
          variant={getRiskVariant(row.original.riskLevel)}
          className="shadow-sm"
        >
          {row.original.riskLevel}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() =>
              window.open(`/projects/${row.original.id}`, "_blank")
            }
            title="ดูรายละเอียด"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <CanEditProjects>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-orange-600 hover:bg-orange-50"
              onClick={() => handleEditProject(row.original)}
              title="แก้ไข"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CanEditProjects>
          <PermissionGuard permission={Permission.PROJECT_DELETE}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteConfirm(row.original.id)}
              title="ลบ"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: createProjectAction,
    onSuccess: (result) => {
      if (result.error) {
        toast.error(`Create failed: ${result.error}`);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (result.data) {
        toast.success("✅ สร้างโครงการสำเร็จแล้ว");
        logProjectAction(
          userId,
          userName,
          userRole,
          result.data.id,
          "create",
          `Created new project: ${result.data.name}`,
          { name: result.data.name, budget: result.data.budget, managerId: result.data.manager_id },
        );
        router.refresh();
      }
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({
      id,
      updatedFields,
    }: {
      id: string;
      updatedFields: Partial<ProjectType>;
    }) => updateProjectAction(id, updatedFields as any),
    onSuccess: (result, { id, updatedFields }) => {
      if (result.error) {
        toast.error(`Update failed: ${result.error}`);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("✅ อัปเดตโครงการสำเร็จแล้ว");
      // Audit logging
      logProjectAction(
        userId,
        userName,
        userRole,
        id,
        "update",
        `Updated project details`,
        updatedFields,
      );
      router.refresh();
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProjectAction,
    onSuccess: (result, projectId) => {
      if (result.error) {
        toast.error(`Delete failed: ${result.error}`);
        return;
      }
      toast.success("✅ ลบโครงการสำเร็จแล้ว");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setDeleteConfirm(null);
      logProjectAction(
        userId,
        userName,
        userRole,
        projectId,
        "delete",
        `Deleted project`,
        {},
      );
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(`❌ ลบไม่สำเร็จ: ${error?.message || "เกิดข้อผิดพลาด"}`);
    },
  });

  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsSheetOpen(true);
  };

  const handleEditProject = (project: ProjectType) => {
    setSelectedProject(project);
    setIsSheetOpen(true);
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProjectMutation.mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div id="projects-header">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            รายการโครงการ
          </h1>
          <p className="text-muted-foreground mt-1">
            จัดการและติดตามโครงการทั้งหมดของคุณได้ที่นี่
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Select value={selectedView} onValueChange={applyView}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Saved views" />
              </SelectTrigger>
              <SelectContent>
                {savedViews.length === 0 ? (
                  <SelectItem value="" disabled>ไม่มีมุมมองที่บันทึก</SelectItem>
                ) : (
                  savedViews.map(v => (
                    <SelectItem key={v.name} value={v.name}>{v.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {["admin", "manager"].includes((userRole || "").toLowerCase()) && (
              <Select value={viewScope} onValueChange={(v: any) => setViewScope(v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">ส่วนตัว</SelectItem>
                  <SelectItem value="global">สำหรับทุกคน</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" onClick={saveCurrentView}>
              บันทึกมุมมอง
            </Button>
            <Button variant="ghost" onClick={deleteView} disabled={!selectedView}>
              ลบมุมมอง
            </Button>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border bg-white">
            <span className="text-sm text-muted-foreground">Assigned to me</span>
            <Switch
              checked={assignedOnly}
              onCheckedChange={setAssignedOnly}
              aria-label="แสดงเฉพาะโครงการที่ฉันรับผิดชอบ"
            />
          </div>
          <CanCreateProjects>
            <Button id="create-project-button" onClick={handleCreateProject} className="gap-2">
              <Plus className="h-4 w-4" />
              สร้างโครงการใหม่
            </Button>
          </CanCreateProjects>
          <Button
            variant="outline"
            id="export-projects-button"
            onClick={() => {
              const rows = filteredProjects || [];
              const header = [
                "Name",
                "Code",
                "Status",
                "Progress",
                "Manager",
                "Budget",
                "DueDate",
              ];
              const lines = [
                header.join(","),
                ...rows.map((p) =>
                  [
                    p.name,
                    p.code || "",
                    p.status,
                    p.progress,
                    p.manager_name || "",
                    p.budget || 0,
                    p.endDate || "",
                  ].join(","),
                ),
              ];
              const blob = new Blob([lines.join("\n")], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "projects.csv";
              a.click();
              window.URL.revokeObjectURL(url);
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => router.push("/stakeholders")}>
            <Users className="w-4 h-4 mr-2" />
            Stakeholders
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              โครงการทั้งหมด
            </CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {projectsData?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              กำลังดำเนินการ
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {projectsData?.filter((p: any) => {
                const s = String(p.status || "").toLowerCase();
                return (
                  s === "active" || s === "in_progress" || s === "in progress"
                );
              }).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              เสร็จสิ้น
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {projectsData?.filter(
                (p: any) => String(p.status || "").toLowerCase() === "completed",
              ).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ต้องแก้ไข/เสี่ยง
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {enhancedProjects.filter((p) => {
                const s = String(p.status || "").toLowerCase();
                const risky = String(p.riskLevel || "").toLowerCase();
                return (
                  p.isOverdue ||
                  s === "on hold" ||
                  s === "cancelled" ||
                  risky === "high" ||
                  risky === "critical"
                );
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card id="projects-list-card">
        <CardHeader>
          <CardTitle>รายชื่อโครงการ</CardTitle>
          <CardDescription>ค้นหาและกรองข้อมูลโครงการ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProfessionalFilter
            searchPlaceholder="ค้นหาชื่อโครงการ, รหัส, หรือผู้รับผิดชอบ..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filterOptions}
            resultCount={filteredProjects.length}
            totalItems={enhancedProjects.length}
            onClearAll={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setManagerFilter("all");
              setPriorityFilter("all");
            }}
          >
            <div className="flex bg-muted p-1 rounded-lg ml-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("grid")}
                title="มุมมองการ์ด"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("list")}
                title="มุมมองตาราง"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </ProfessionalFilter>

          {filteredProjects.length === 0 ? (
            <EmptyState
              type="no-results"
              title="ไม่พบข้อมูลที่ตรงตามเงื่อนไข"
              description="ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือกรองข้อมูลใหม่"
              action={{
                label: "ล้างตัวกรอง",
                onClick: () => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setManagerFilter("all");
                  setPriorityFilter("all");
                },
              }}
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(project.name || "P")}`}
                          />
                          <AvatarFallback>{(project.name || "P").charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base font-semibold leading-tight">
                            <Link href={`/projects/${project.id}`} className="hover:text-primary transition-colors">
                              {project.name}
                            </Link>
                          </CardTitle>
                          {project.code && (
                            <CardDescription className="font-mono text-xs">
                              #{project.code}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <Badge variant={project.statusColor as any} className="ml-2 whitespace-nowrap">
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground text-xs">ความคืบหน้า</span>
                        <span className="font-bold text-xs">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">งบประมาณ</p>
                        <p className="text-sm font-semibold">
                          ฿{project.budget ? project.budget.toLocaleString() : "0"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">กำหนดส่ง</p>
                        <div className={clsx(
                          "text-sm font-medium flex items-center gap-1.5",
                          project.isOverdue ? "text-destructive" : "text-foreground"
                        )}>
                          <Calendar className="h-3.5 w-3.5" />
                          {safeFormatDate(project.endDate, "d MMM yy")}
                        </div>
                      </div>
                    </div>

                    {/* Manager & Actions */}
                    <div className="flex items-center justify-between pt-4 border-t mt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[120px]">
                          {project.manager_name || "ไม่ระบุ"}
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => window.open(`/projects/${project.id}`, "_blank")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <CanEditProjects>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </CanEditProjects>
                        <PermissionGuard permission={Permission.PROJECT_DELETE}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:text-destructive"
                            onClick={() => setDeleteConfirm(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredProjects}
              searchKey="name"
              searchPlaceholder="ค้นหา..."
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              ยืนยันการลบโครงการ
            </DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบโครงการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirm && handleDeleteProject(deleteConfirm)
              }
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? "กำลังลบ..." : "ยืนยันลบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Sheet */}
      <ProjectSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        project={selectedProject}
        onSave={async (data) => {
          if (selectedProject) {
            await updateProjectMutation.mutateAsync({
              id: selectedProject.id,
              updatedFields: data,
            });
          } else {
            await createProjectMutation.mutateAsync(data as any);
          }
        }}
      />
    </div>
  );
}

// Helper functions (duplicated from original but necessary for client logic)
function calculateRiskLevel(
  project: ProjectType,
): "Low" | "Medium" | "High" | "Critical" {
  if (project.status === "Completed") return "Low";
  if (project.status === "Planning") return "Medium";

  let riskScore = 0;
  if (project.progress < 30) riskScore += 2;
  if (project.progress < 70) riskScore += 1;

  if (project.endDate) {
    const daysRemaining = calculateDaysRemaining(project);
    // Handle NaN (invalid date) safely
    if (isNaN(daysRemaining)) return "Medium";
    
    if (daysRemaining < 0) riskScore += 2;
    else if (daysRemaining < 7) riskScore += 1;
  }

  if (riskScore >= 3) return "Critical";
  if (riskScore >= 2) return "High";
  if (riskScore >= 1) return "Medium";
  return "Low";
}

function calculateDaysRemaining(project: ProjectType): number {
  if (!project.endDate) return Infinity;
  try {
    const endDate = new Date(project.endDate);
    if (!isValid(endDate)) return NaN;
    const today = new Date();
    return Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  } catch {
    return NaN;
  }
}

function getStatusColor(status: string): string {
  switch ((status || "").toLowerCase()) {
    case "completed":
      return "default";
    case "active":
      return "default";
    case "planning":
      return "secondary";
    case "on hold":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

function getRiskVariant(
  risk: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch ((risk || "").toLowerCase()) {
    case "low":
      return "secondary";
    case "medium":
      return "default";
    case "high":
      return "destructive";
    case "critical":
      return "destructive";
    default:
      return "secondary";
  }
}
