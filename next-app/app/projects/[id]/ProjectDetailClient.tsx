"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  Target,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  UserCheck,
  Star,
  ChevronRight,
} from "lucide-react"
import Header from "../../components/Header"
import { clsx } from "clsx"
import { supabase } from "../../lib/supabaseClient"
import { getStatusDisplay, formatThaiDate as fmtDate, formatCurrency } from "../statusUtils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"

interface Project {
  id: string
  code: string
  name: string
  description: string
  status: string
  progress: number
  budget: number
  spent: number
  start_date: string
  end_date: string
  manager_id: string
  created_at?: string
  updated_at?: string
  manager_name?: string
}

interface Task {
  id: string
  title: string
  status: string
  progress: number
  assignee?: string
  due_date?: string
  phase?: string
  start_date?: string
  end_date?: string
}

interface Document {
  id: string
  name: string
  type: string
  size: string
  modified: string
  uploaded_by: string
  milestone?: string
  uploaded_at: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  phone?: string
}

interface ProjectDetailClientProps {
  project: Project
  tasks: Task[]
  documents: Document[]
  teamMembers: TeamMember[]
}

function formatThaiDate(dateStr: string) {
  return fmtDate(dateStr, { year: "numeric", month: "long", day: "numeric" })
}

export default function ProjectDetailClient({
  project: initialProject,
  tasks: initialTasks,
  documents: initialDocuments,
  teamMembers: initialTeamMembers,
}: ProjectDetailClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [project, setProject] = useState<Project>(initialProject)
  const [tasks] = useState<Task[]>(initialTasks)
  const [documents] = useState<Document[]>(initialDocuments)
  const [teamMembers] = useState<TeamMember[]>(initialTeamMembers)

  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const budgetUsagePercent = project.budget > 0
    ? Math.min((project.spent / project.budget) * 100, 100)
    : 0

  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length

  // CRUD functions
  const handleUpdateProject = async (updatedProject: Partial<Project>) => {
    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("projects")
        .update({
          ...updatedProject,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)
        .select()
        .single()

      if (error) throw error

      setProject(data as Project)
      setShowEditForm(false)
    } catch (err) {
      console.error("Error updating project:", err)
      alert("เกิดข้อผิดพลาดในการอัปเดต: " + (err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProject = async () => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id)

      if (error) throw error

      router.push("/projects")
    } catch (err) {
      console.error("Error deleting project:", err)
      alert("เกิดข้อผิดพลาดในการลบ: " + (err as Error).message)
      setIsSubmitting(false)
    }
  }

  const statusConfig = getStatusDisplay(project.status)

  const tabs = [
    { id: "overview", label: "ภาพรวม", icon: BarChart3, href: `/projects/${project.id}` },
    { id: "tasks", label: "งาน", icon: Target, href: `/projects/${project.id}/tasks` },
    { id: "risks", label: "ความเสี่ยง", icon: AlertTriangle, href: `/projects/${project.id}/risks` },
    { id: "milestones", label: "จุดหมาย", icon: CheckCircle2, href: `/projects/${project.id}/milestones` },
    { id: "budget", label: "งบประมาณ", icon: DollarSign, href: `/projects/${project.id}/budget` },
    { id: "cost-sheet", label: "ต้นทุน", icon: TrendingUp, href: `/projects/${project.id}/cost-sheet` },
    { id: "documents", label: "เอกสาร", icon: FileText, href: `/projects/${project.id}/documents` },
    { id: "team", label: "ทีมงาน", icon: Users, href: `/projects/${project.id}/team` },
  ]

  function isActiveTab(tab: typeof tabs[number]) {
    if (tab.id === "overview") {
      return pathname === `/projects/${project.id}` || pathname === `/projects/${project.id}/overview`
    }
    return pathname?.startsWith(tab.href)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title={project?.name || "Project Details"}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: project?.name || "Project", href: `/projects/${project.id}` },
        ]}
      />

      <div className="pt-24 px-4 sm:px-6 pb-6 max-w-[1400px] mx-auto">
        {/* Project Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-6 sm:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Project Info */}
            <div className="flex items-start gap-4 sm:gap-6 flex-1 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg shrink-0">
                {project.code?.substring(0, 2) || "PR"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">
                    {project.name}
                  </h1>
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border shrink-0",
                      statusConfig.color,
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>
                      {project.start_date && project.end_date
                        ? `${formatThaiDate(project.start_date)} - ${formatThaiDate(project.end_date)}`
                        : "ไม่ได้กำหนด"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <span>{project.manager_name || "ไม่ระบุ"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>
                      อัปเดต: {formatThaiDate(project.updated_at || project.created_at || new Date().toISOString())}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-row lg:flex-col gap-2 shrink-0">
              <button
                onClick={() => setShowEditForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-xl text-sm font-medium text-blue-700 hover:bg-blue-50 transition-all duration-200 shadow-sm"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">แก้ไข</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-xl text-sm font-medium text-red-700 hover:bg-red-50 transition-all duration-200 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">ลบ</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 rounded-xl text-sm font-medium text-green-700 hover:bg-green-50 transition-all duration-200 shadow-sm">
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">รายงาน</span>
              </button>
            </div>
          </div>

          {/* Progress & Budget Bars */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/80 backdrop-blur rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-800">ความคืบหน้า</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{project.progress}%</span>
              </div>
              <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-slate-800">งบประมาณ</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-bold text-green-600">
                    ฿{project.spent?.toLocaleString() || "0"}
                  </span>
                  <span className="text-slate-400">/</span>
                  <span className="font-semibold text-slate-600">
                    ฿{project.budget?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
              <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    budgetUsagePercent > 90
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : budgetUsagePercent > 70
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                        : "bg-gradient-to-r from-green-500 to-emerald-500",
                  )}
                  style={{ width: `${budgetUsagePercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            iconBg="bg-blue-600"
            label="งบประมาณ"
            value={`฿${project.budget?.toLocaleString() || "0"}`}
            sub={`ใช้ไป ฿${project.spent?.toLocaleString() || "0"}`}
            color="blue"
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            iconBg="bg-green-600"
            label="สมาชิกทีม"
            value={`${teamMembers.length} คน`}
            color="green"
            extra={
              <div className="flex items-center gap-1 mt-2">
                {teamMembers.slice(0, 3).map((member, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 bg-green-200 rounded-full flex items-center justify-center text-green-700 text-xs font-bold"
                    title={member.name}
                  >
                    {member.name.split(" ")[0][0]}
                  </div>
                ))}
                {teamMembers.length > 3 && (
                  <div className="w-7 h-7 bg-green-200 rounded-full flex items-center justify-center text-green-700 text-xs font-bold">
                    +{teamMembers.length - 3}
                  </div>
                )}
              </div>
            }
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            iconBg="bg-orange-600"
            label="งาน"
            value={`${tasks.length} รายการ`}
            color="orange"
            extra={
              <div className="flex items-center gap-1.5 mt-2">
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  {completedTasks}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  <Activity className="w-3 h-3" />
                  {inProgressTasks}
                </span>
              </div>
            }
          />
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            iconBg="bg-purple-600"
            label="เอกสาร"
            value={`${documents.length} รายการ`}
            color="purple"
            extra={
              <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-600">
                <PieChart className="w-3.5 h-3.5" />
                <span>
                  {documents.reduce((total, doc) => total + (parseInt(doc.size) || 0), 0) > 0
                    ? `${(documents.reduce((total, doc) => total + (parseInt(doc.size) || 0), 0) / 1024 / 1024).toFixed(1)} MB`
                    : "0 MB"}
                </span>
              </div>
            }
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <nav className="flex gap-1 px-4 sm:px-6 overflow-x-auto scrollbar-thin" aria-label="แท็บโครงการ">
              {tabs.map((tab) => {
                const active = isActiveTab(tab)
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={clsx(
                      "flex items-center gap-2 px-4 sm:px-5 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap",
                      active
                        ? "border-blue-500 text-blue-700 bg-blue-50/50"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Tab Content — Overview */}
          <div className="p-6 bg-gradient-to-b from-slate-50 to-white">
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">ภาพรวมโครงการ</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                ดูข้อมูลสรุปภาพรวมทั้งหมดของโครงการ พร้อมกราฟและรายละเอียดเพิ่มเติม
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 text-sm mb-2">สถานะโครงการ</h4>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-current" style={{ color: "currentColor" }} />
                    <span className="text-sm text-slate-600">{statusConfig.label}</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 text-sm mb-2">ความคืบหน้า</h4>
                  <span className="text-2xl font-bold text-blue-600">{project.progress}%</span>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 text-sm mb-2">ทีมงาน</h4>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl font-bold text-green-600">{teamMembers.length}</span>
                    <span className="text-sm text-slate-500">คน</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>แก้ไขโปรเจกต์</DialogTitle>
            <DialogDescription>
              อัปเดตข้อมูลโปรเจกต์ด้านล่าง แล้วกดบันทึก
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleUpdateProject({
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                status: formData.get("status") as string,
              })
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-name" className="text-sm font-medium text-slate-700">
                  ชื่อโปรเจกต์
                </label>
                <input
                  id="edit-name"
                  name="name"
                  type="text"
                  defaultValue={project.name}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-description" className="text-sm font-medium text-slate-700">
                  รายละเอียด
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  defaultValue={project.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-status" className="text-sm font-medium text-slate-700">
                  สถานะ
                </label>
                <select
                  id="edit-status"
                  name="status"
                  defaultValue={project.status}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                >
                  <option value="planning">วางแผน</option>
                  <option value="in_progress">ดำเนินการ</option>
                  <option value="completed">เสร็จสิ้น</option>
                  <option value="on_hold">พักชั่วคราว</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบโปรเจกต์</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบโปรเจกต์ &quot;{project.name}&quot; ใช่หรือไม่?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดที่เกี่ยวข้องจะถูกลบอย่างถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isSubmitting}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            >
              {isSubmitting ? "กำลังลบ..." : "ลบโปรเจกต์"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ─── Reusable Stat Card ─── */

interface StatCardProps {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  sub?: string
  color: "blue" | "green" | "orange" | "purple"
  extra?: React.ReactNode
}

const COLOR_MAP = {
  blue: { gradient: "from-blue-50 to-blue-100", border: "border-blue-200", text: "text-blue-900" },
  green: { gradient: "from-green-50 to-green-100", border: "border-green-200", text: "text-green-900" },
  orange: { gradient: "from-orange-50 to-orange-100", border: "border-orange-200", text: "text-orange-900" },
  purple: { gradient: "from-purple-50 to-purple-100", border: "border-purple-200", text: "text-purple-900" },
}

function StatCard({ icon, iconBg, label, value, sub, color, extra }: StatCardProps) {
  const c = COLOR_MAP[color]
  return (
    <div
      className={clsx(
        "bg-gradient-to-br rounded-xl shadow border p-4 sm:p-5 hover:shadow-md transition-shadow duration-200",
        c.gradient,
        c.border,
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={clsx(
            "w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm",
            iconBg,
          )}
        >
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <p className={clsx("text-xl sm:text-2xl font-bold", c.text)}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      {extra}
    </div>
  )
}
