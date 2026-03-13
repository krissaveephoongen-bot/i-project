"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
} from "lucide-react"
import { format, isValid } from "date-fns"
import { th } from "date-fns/locale"
import {
  PermissionGuard,
  CanCreateProjects,
  CanEditProjects,
} from "../components/PermissionGuard"
import { Permission } from "../lib/auth"
import { usePermissions } from "../hooks/usePermissions"
import { logProjectAction } from "../lib/audit"

import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Progress } from "../components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { DataTable } from "../components/data-table"
import { ProfessionalFilter } from "@/components/ProfessionalFilter"
import { EmptyState } from "@/components/ui/empty-state"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
} from "./actions"
import { Project as ProjectType } from "../lib/projects"
import ProjectSheet from "../components/ProjectSheet"
import { ColumnDef } from "@tanstack/react-table"
import { clsx } from "clsx"
import { toast } from "react-hot-toast"
import { Switch } from "../components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { getStatusDisplay, getRiskDisplay, formatCurrency } from "./statusUtils"

// Enhanced Project type with derived data
interface EnhancedProject extends ProjectType {
  riskLevel: "Low" | "Medium" | "High" | "Critical"
  statusColor: string
  daysRemaining: number
  isOverdue: boolean
}

interface ProjectManager {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface ProjectsClientProps {
  initialProjects: ProjectType[]
  initialManagers: ProjectManager[]
}

// Helper to safely format date
const safeFormatDate = (dateString: string | null | undefined, formatStr: string = "d MMM yyyy") => {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    if (!isValid(date)) return "-"
    return format(date, formatStr, { locale: th })
  } catch {
    return "-"
  }
}

export default function ProjectsClient({
  initialProjects = [],
  initialManagers = [],
}: ProjectsClientProps) {
  const queryClient = useQueryClient()
  // Safe permission hook usage
  let permissions = { userId: "", userName: "", userRole: "" }
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    permissions = usePermissions()
  } catch (e) {
    console.warn("usePermissions failed", e)
  }
  const { userId, userName, userRole } = permissions

  const router = useRouter()

  // State management
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [savedViews, setSavedViews] = useState<Array<{ id?: string; name: string; cfg: any }>>([])
  const [selectedView, setSelectedView] = useState<string>("")
  const [viewScope, setViewScope] = useState<"personal" | "global">("personal")

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [managerFilter, setManagerFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assignedOnly, setAssignedOnly] = useState(false)

  const projectsData = initialProjects
  const managersData = initialManagers

  // Derived filters
  const availableStatuses = useMemo(() => {
    const statuses = new Set(projectsData?.map(p => p.status) || [])
    return Array.from(statuses).map(s => ({
      value: s,
      label: getStatusDisplay(s).label,
    }))
  }, [projectsData])

  const availableManagers = useMemo(() => {
    if (managersData && managersData.length > 0) {
      return managersData.map(m => ({ value: m.id, label: m.name }))
    }
    const managers = new Map<string, string>()
    projectsData?.forEach(p => {
      if (p.managerId && p.manager_name) {
        managers.set(p.managerId, p.manager_name)
      }
    })
    return Array.from(managers.entries()).map(([id, name]) => ({ value: id, label: name }))
  }, [projectsData, managersData])

  // Enhanced projects with computed fields
  const enhancedProjects: EnhancedProject[] = useMemo(() => {
    if (!projectsData || !Array.isArray(projectsData)) return []

    return projectsData.filter(p => p && p.id).map((project) => {
      const riskLevel = calculateRiskLevel(project)
      const daysRemaining = calculateDaysRemaining(project)
      const isOverdue = daysRemaining < 0

      return {
        ...project,
        riskLevel,
        statusColor: getStatusColor(project.status),
        daysRemaining: isNaN(daysRemaining) ? 0 : Math.abs(daysRemaining),
        isOverdue,
      }
    })
  }, [projectsData])

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return enhancedProjects.filter((project) => {
      if (assignedOnly && userName) {
        const byManager =
          (project.manager_name || "").toLowerCase() ===
          (userName || "").toLowerCase()
        if (!byManager) return false
      }
      const matchesSearch =
        !searchTerm ||
        (project.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.manager_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.code || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter
      const matchesManager =
        managerFilter === "all" || project.manager_name === managerFilter
      const matchesPriority =
        priorityFilter === "all" || (project.priority || "").toLowerCase() === priorityFilter.toLowerCase()

      return matchesSearch && matchesStatus && matchesManager && matchesPriority
    })
  }, [enhancedProjects, searchTerm, statusFilter, managerFilter, priorityFilter, assignedOnly, userName])

  // Stats
  const totalCount = projectsData?.length || 0
  const activeCount = projectsData?.filter((p) => {
    const s = String(p.status || "").toLowerCase()
    return s === "active" || s === "in_progress" || s === "in progress"
  }).length || 0
  const completedCount = projectsData?.filter(
    (p) => String(p.status || "").toLowerCase() === "completed",
  ).length || 0
  const atRiskCount = enhancedProjects.filter((p) => {
    const s = String(p.status || "").toLowerCase()
    const risky = String(p.riskLevel || "").toLowerCase()
    return p.isOverdue || s === "on hold" || s === "cancelled" || risky === "high" || risky === "critical"
  }).length

  // Saved views
  const loadSavedViews = async () => {
    if (!userId) {
      setSavedViews([])
      return
    }
    try {
      const res = await fetch(
        `/api/saved-views?pageKey=projects&userId=${encodeURIComponent(userId)}&includeGlobal=1`,
        { cache: "no-store" },
      )
      if (res.ok) {
        const json = await res.json()
        const views = (json?.views || []).map((v: any) => ({
          id: v.id,
          name: v.name,
          cfg: v.filters,
        }))
        setSavedViews(views)
        if (views.length && !selectedView) setSelectedView(views[0].name)
      } else {
        throw new Error("API failed")
      }
    } catch {
      try {
        const raw = localStorage.getItem("projects_saved_views") || "[]"
        const arr = JSON.parse(raw)
        setSavedViews(Array.isArray(arr) ? arr : [])
      } catch {
        setSavedViews([])
      }
    }
  }

  const saveCurrentView = async () => {
    const name = window.prompt("ตั้งชื่อมุมมองที่บันทึก")
    if (!name) return
    const cfg = { searchTerm, statusFilter, managerFilter, priorityFilter, viewMode, assignedOnly }
    try {
      if (userId) {
        const existing = savedViews.find(v => v.name === name)
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
        })
        const json = await res.json()
        if (!json?.ok) throw new Error(json?.error || "save failed")
      } else {
        const next = savedViews.filter(v => v.name !== name).concat([{ name, cfg }])
        localStorage.setItem("projects_saved_views", JSON.stringify(next))
      }
      await loadSavedViews()
      setSelectedView(name)
    } catch {
      const next = savedViews.filter(v => v.name !== name).concat([{ name, cfg }])
      localStorage.setItem("projects_saved_views", JSON.stringify(next))
      setSavedViews(next)
      setSelectedView(name)
    }
  }

  const applyView = (name: string) => {
    setSelectedView(name)
    const v = savedViews.find(sv => sv.name === name)
    if (!v) return
    const cfg = v.cfg || {}
    setSearchTerm(cfg.searchTerm ?? "")
    setStatusFilter(cfg.statusFilter ?? "all")
    setManagerFilter(cfg.managerFilter ?? "all")
    setPriorityFilter(cfg.priorityFilter ?? "all")
    setViewMode(cfg.viewMode ?? "grid")
    setAssignedOnly(!!cfg.assignedOnly)
  }

  const deleteView = async () => {
    if (!selectedView) return
    try {
      const v = savedViews.find(sv => sv.name === selectedView)
      if (userId && v?.id) {
        await fetch(`/api/saved-views?id=${encodeURIComponent(v.id)}&userId=${encodeURIComponent(userId)}`, { method: "DELETE" })
      } else {
        const next = savedViews.filter(sv => sv.name !== selectedView)
        localStorage.setItem("projects_saved_views", JSON.stringify(next))
      }
      await loadSavedViews()
      setSelectedView("")
    } catch {
      const next = savedViews.filter(sv => sv.name !== selectedView)
      localStorage.setItem("projects_saved_views", JSON.stringify(next))
      setSavedViews(next)
      setSelectedView("")
    }
  }

  useEffect(() => {
    loadSavedViews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Filter options
  const filterOptions = [
    {
      key: "status",
      label: "สถานะ",
      value: statusFilter,
      type: "static" as const,
      staticOptions: [{ value: "all", label: "ทั้งหมด" }, ...availableStatuses],
      onChange: setStatusFilter,
    },
    {
      key: "manager",
      label: "ผู้จัดการ",
      value: managerFilter,
      type: "static" as const,
      staticOptions: [{ value: "all", label: "ทั้งหมด" }, ...availableManagers],
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
  ]

  // Table columns
  const columns: ColumnDef<EnhancedProject>[] = [
    {
      accessorKey: "name",
      header: "ชื่อโครงการ",
      cell: ({ row }) => {
        const sd = getStatusDisplay(row.original.status)
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
              {(row.original.code || row.original.name || "P").substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <Link
                href={`/projects/${row.original.id}`}
                className="font-semibold text-foreground hover:text-blue-600 transition-colors block truncate"
              >
                {row.original.name}
              </Link>
              {row.original.code && (
                <span className="text-xs text-muted-foreground font-mono">#{row.original.code}</span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "สถานะ",
      cell: ({ row }) => {
        const sd = getStatusDisplay(row.original.status)
        return (
          <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", sd.color)}>
            {sd.label}
          </span>
        )
      },
    },
    {
      accessorKey: "progress",
      header: "ความคืบหน้า",
      cell: ({ row }) => (
        <div className="min-w-[100px]">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">คืบหน้า</span>
            <span className="font-semibold">{row.original.progress}%</span>
          </div>
          <Progress value={row.original.progress} className="h-1.5" />
        </div>
      ),
    },
    {
      accessorKey: "manager_name",
      header: "ผู้รับผิดชอบ",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
            <User className="h-3 w-3 text-slate-500" />
          </div>
          <span className="text-sm truncate max-w-[120px]">
            {row.original.manager_name || "ไม่ระบุ"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "budget",
      header: "งบประมาณ",
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {formatCurrency(row.original.budget)}
        </span>
      ),
    },
    {
      accessorKey: "endDate",
      header: "กำหนดส่ง",
      cell: ({ row }) => {
        const dateStr = safeFormatDate(row.original.endDate, "d MMM yy")
        if (dateStr === "-") return <span className="text-muted-foreground text-xs">-</span>
        return (
          <div className={clsx(
            "flex items-center gap-1.5 text-sm",
            row.original.isOverdue ? "text-red-600 font-medium" : "text-muted-foreground",
          )}>
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{dateStr}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "riskLevel",
      header: "ความเสี่ยง",
      cell: ({ row }) => {
        const rd = getRiskDisplay(row.original.riskLevel)
        return (
          <span className={clsx("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", rd.color)}>
            {rd.label}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600"
            onClick={() => router.push(`/projects/${row.original.id}`)}
            title="ดูรายละเอียด"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <CanEditProjects>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-orange-600"
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
              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
              onClick={() => setDeleteConfirm(row.original.id)}
              title="ลบ"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ]

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: createProjectAction,
    onSuccess: (result) => {
      if (result.error) {
        toast.error(`สร้างไม่สำเร็จ: ${result.error}`)
        return
      }
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      if (result.data) {
        toast.success("สร้างโครงการสำเร็จแล้ว")
        logProjectAction(userId, userName, userRole, result.data.id, "create", `Created new project: ${result.data.name}`, { name: result.data.name, budget: result.data.budget, managerId: result.data.manager_id })
        router.refresh()
      }
    },
  })

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, updatedFields }: { id: string; updatedFields: Partial<ProjectType> }) =>
      updateProjectAction(id, updatedFields as any),
    onSuccess: (result, { id, updatedFields }) => {
      if (result.error) {
        toast.error(`อัปเดตไม่สำเร็จ: ${result.error}`)
        return
      }
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast.success("อัปเดตโครงการสำเร็จแล้ว")
      logProjectAction(userId, userName, userRole, id, "update", "Updated project details", updatedFields)
      router.refresh()
    },
  })

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProjectAction,
    onSuccess: (result, projectId) => {
      if (result.error) {
        toast.error(`ลบไม่สำเร็จ: ${result.error}`)
        return
      }
      toast.success("ลบโครงการสำเร็จแล้ว")
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      setDeleteConfirm(null)
      logProjectAction(userId, userName, userRole, projectId, "delete", "Deleted project", {})
      router.refresh()
    },
    onError: (error: any) => {
      toast.error(`ลบไม่สำเร็จ: ${error?.message || "เกิดข้อผิดพลาด"}`)
    },
  })

  const handleCreateProject = () => {
    setSelectedProject(null)
    setIsSheetOpen(true)
  }

  const handleEditProject = (project: ProjectType) => {
    setSelectedProject(project)
    setIsSheetOpen(true)
  }

  const handleDeleteProject = async (id: string) => {
    await deleteProjectMutation.mutateAsync(id)
  }

  const exportCSV = () => {
    const rows = filteredProjects || []
    const header = ["Name", "Code", "Status", "Progress", "Manager", "Budget", "DueDate"]
    const lines = [
      header.join(","),
      ...rows.map((p) =>
        [p.name, p.code || "", p.status, p.progress, p.manager_name || "", p.budget || 0, p.endDate || ""].join(","),
      ),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "projects.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div id="projects-header">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">รายการโครงการ</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            จัดการและติดตามโครงการทั้งหมด ({totalCount} โครงการ)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white text-sm">
            <span className="text-muted-foreground whitespace-nowrap">เฉพาะของฉัน</span>
            <Switch
              checked={assignedOnly}
              onCheckedChange={setAssignedOnly}
              aria-label="แสดงเฉพาะโครงการที่ฉันรับผิดชอบ"
            />
          </div>
          <CanCreateProjects>
            <Button id="create-project-button" onClick={handleCreateProject} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              สร้างโครงการ
            </Button>
          </CanCreateProjects>
          <Button variant="outline" size="sm" id="export-projects-button" onClick={exportCSV} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ส่งออก</span>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="โครงการทั้งหมด"
          value={totalCount}
          icon={<Folder className="h-4 w-4" />}
          iconColor="text-slate-600"
          iconBg="bg-slate-100"
        />
        <StatCard
          label="กำลังดำเนินการ"
          value={activeCount}
          icon={<Activity className="h-4 w-4" />}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          valueColor="text-blue-600"
        />
        <StatCard
          label="เสร็จสิ้น"
          value={completedCount}
          icon={<CheckCircle className="h-4 w-4" />}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          valueColor="text-green-600"
        />
        <StatCard
          label="ต้องดูแล"
          value={atRiskCount}
          icon={<AlertTriangle className="h-4 w-4" />}
          iconColor="text-red-600"
          iconBg="bg-red-50"
          valueColor="text-red-600"
        />
      </div>

      {/* Saved Views Bar */}
      {savedViews.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground whitespace-nowrap">มุมมอง:</span>
          <Select value={selectedView} onValueChange={applyView}>
            <SelectTrigger className="w-[180px] h-8 text-sm">
              <SelectValue placeholder="เลือกมุมมอง" />
            </SelectTrigger>
            <SelectContent>
              {savedViews.map(v => (
                <SelectItem key={v.name} value={v.name}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {["admin", "manager"].includes((userRole || "").toLowerCase()) && (
            <Select value={viewScope} onValueChange={(v: any) => setViewScope(v)}>
              <SelectTrigger className="w-[120px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">ส่วนตัว</SelectItem>
                <SelectItem value="global">ทุกคน</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={saveCurrentView}>
            บันทึก
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={deleteView} disabled={!selectedView}>
            ลบ
          </Button>
        </div>
      )}

      {/* Main Content */}
      <Card id="projects-list-card" className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">รายชื่อโครงการ</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {filteredProjects.length} จาก {enhancedProjects.length} โครงการ
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProfessionalFilter
                searchPlaceholder="ค้นหาชื่อโครงการ, รหัส, หรือผู้รับผิดชอบ..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filterOptions}
                resultCount={filteredProjects.length}
                totalItems={enhancedProjects.length}
                onClearAll={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setManagerFilter("all")
                  setPriorityFilter("all")
                }}
              />
            </div>
            <div className="flex bg-muted p-0.5 rounded-lg shrink-0">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode("grid")}
                title="มุมมองการ์ด"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode("list")}
                title="มุมมองตาราง"
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <EmptyState
              type="no-results"
              title="ไม่พบข้อมูลที่ตรงตามเงื่อนไข"
              description="ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือกรองข้อมูลใหม่"
              action={{
                label: "ล้างตัวกรอง",
                onClick: () => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setManagerFilter("all")
                  setPriorityFilter("all")
                },
              }}
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={() => handleEditProject(project)}
                  onDelete={() => setDeleteConfirm(project.id)}
                  onView={() => router.push(`/projects/${project.id}`)}
                />
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

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              ยืนยันการลบโครงการ
            </DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบโครงการนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDeleteProject(deleteConfirm)}
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
            await updateProjectMutation.mutateAsync({ id: selectedProject.id, updatedFields: data })
          } else {
            await createProjectMutation.mutateAsync(data as any)
          }
        }}
      />
    </div>
  )
}

/* ─── Stat Card ─── */

function StatCard({
  label,
  value,
  icon,
  iconColor,
  iconBg,
  valueColor,
}: {
  label: string
  value: number
  icon: React.ReactNode
  iconColor: string
  iconBg: string
  valueColor?: string
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className={clsx("text-2xl font-bold mt-1", valueColor || "text-foreground")}>{value}</p>
          </div>
          <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center", iconBg, iconColor)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Project Card ─── */

function ProjectCard({
  project,
  onEdit,
  onDelete,
  onView,
}: {
  project: EnhancedProject
  onEdit: () => void
  onDelete: () => void
  onView: () => void
}) {
  const sd = getStatusDisplay(project.status)
  const rd = getRiskDisplay(project.riskLevel)

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Top color bar based on status */}
      <div className={clsx(
        "h-1",
        project.status.toLowerCase() === "completed" || project.status.toLowerCase() === "done"
          ? "bg-slate-300"
          : project.isOverdue
            ? "bg-red-500"
            : project.riskLevel === "High" || project.riskLevel === "Critical"
              ? "bg-amber-500"
              : "bg-blue-500",
      )} />

      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
              {(project.code || project.name || "P").substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <Link
                href={`/projects/${project.id}`}
                className="font-semibold text-foreground hover:text-blue-600 transition-colors block truncate text-sm"
              >
                {project.name}
              </Link>
              {project.code && (
                <span className="text-xs text-muted-foreground font-mono">#{project.code}</span>
              )}
            </div>
          </div>
          <span className={clsx("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border shrink-0", sd.color)}>
            {sd.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">ความคืบหน้า</span>
            <span className="font-semibold">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1.5" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">งบประมาณ</p>
            <p className="text-sm font-semibold">{formatCurrency(project.budget)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">กำหนดส่ง</p>
            <div className={clsx(
              "text-sm font-medium flex items-center gap-1",
              project.isOverdue ? "text-red-600" : "text-foreground",
            )}>
              <Calendar className="h-3 w-3 shrink-0" />
              {safeFormatDate(project.endDate, "d MMM yy")}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{project.manager_name || "ไม่ระบุ"}</span>
          </div>

          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onView} title="ดู">
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <CanEditProjects>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEdit} title="แก้ไข">
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </CanEditProjects>
            <PermissionGuard permission={Permission.PROJECT_DELETE}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-red-600" onClick={onDelete} title="ลบ">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Helper functions ─── */

function calculateRiskLevel(project: ProjectType): "Low" | "Medium" | "High" | "Critical" {
  if (project.status === "Completed") return "Low"
  if (project.status === "Planning") return "Medium"

  let riskScore = 0
  if (project.progress < 30) riskScore += 2
  if (project.progress < 70) riskScore += 1

  if (project.endDate) {
    const daysRemaining = calculateDaysRemaining(project)
    if (isNaN(daysRemaining)) return "Medium"
    if (daysRemaining < 0) riskScore += 2
    else if (daysRemaining < 7) riskScore += 1
  }

  if (riskScore >= 3) return "Critical"
  if (riskScore >= 2) return "High"
  if (riskScore >= 1) return "Medium"
  return "Low"
}

function calculateDaysRemaining(project: ProjectType): number {
  if (!project.endDate) return Infinity
  try {
    const endDate = new Date(project.endDate)
    if (!isValid(endDate)) return NaN
    return Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  } catch {
    return NaN
  }
}

function getStatusColor(status: string): string {
  switch ((status || "").toLowerCase()) {
    case "completed":
      return "default"
    case "active":
      return "default"
    case "planning":
      return "secondary"
    case "on hold":
      return "secondary"
    case "cancelled":
      return "destructive"
    default:
      return "secondary"
  }
}
