"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Award,
  BarChart3,
  PieChart,
  UserCheck,
  Briefcase,
  Star,
  ChevronRight,
} from "lucide-react";
import Header from "../../components/Header";
import { clsx } from "clsx";
import { supabase } from "../../lib/supabaseClient";

interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  manager_id: string;
  created_at?: string;
  updated_at?: string;
  manager_name?: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  progress: number;
  assignee?: string;
  due_date?: string;
  phase?: string;
  start_date?: string;
  end_date?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  modified: string;
  uploaded_by: string;
  milestone?: string;
  uploaded_at: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
}

interface ProjectDetailClientProps {
  project: Project;
  tasks: Task[];
  documents: Document[];
  teamMembers: TeamMember[];
}

export default function ProjectDetailClient({
  project: initialProject,
  tasks: initialTasks,
  documents: initialDocuments,
  teamMembers: initialTeamMembers,
}: ProjectDetailClientProps) {
  const router = useRouter();

  // State
  const [project, setProject] = useState<Project>(initialProject);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // CRUD functions
  const handleUpdateProject = async (updatedProject: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .update({
          ...updatedProject,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)
        .select()
        .single();

      if (error) throw error;

      setProject(data as Project);
      setShowEditForm(false);
    } catch (err) {
      console.error("Error updating project:", err);
      alert("เกิดข้อผิดพลาดในการอัปเดต: " + (err as Error).message);
    }
  };

  const handleDeleteProject = async () => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);

      if (error) throw error;

      router.push("/projects");
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("เกิดข้อผิดพลาดในการลบ: " + (err as Error).message);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title={project?.name || "Project Details"}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: project?.name || "Project", href: `/projects/${project.id}` },
        ]}
      />

      <div className="pt-24 px-6 pb-6">
        {/* Enhanced Project Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {project.code?.substring(0, 2) || "PR"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h1 className="text-3xl font-bold text-slate-900">
                    {project.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold",
                        project.status === "Active" || project.status === "in_progress"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : project.status === "Planning" || project.status === "planning"
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : project.status === "Completed" || project.status === "completed"
                          ? "bg-gray-100 text-gray-700 border border-gray-200"
                          : "bg-red-100 text-red-700 border border-red-200",
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {project.status === "in_progress" ? "ดำเนินการ" : 
                       project.status === "planning" ? "วางแผน" :
                       project.status === "completed" ? "เสร็จสิ้น" :
                       project.status}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>อัปเดตล่าสุด: {new Date(project.updated_at || project.created_at || "2024-03-13").toLocaleDateString("th-TH", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <p className="text-base text-slate-600 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex items-center gap-6 mt-3 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>ระยะเวลา: {project.start_date && project.end_date
                      ? `${new Date(project.start_date).toLocaleDateString("th-TH", { year: 'numeric', month: 'long', day: 'numeric' })} - ${new Date(project.end_date).toLocaleDateString("th-TH", { year: 'numeric', month: 'long', day: 'numeric' })}`
                      : "ไม่ได้กำหนด"}
                  </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    <span>ผู้จัดการ: {project.manager_name || "John Doe"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowEditForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-blue-200 rounded-xl text-sm font-medium text-blue-700 hover:bg-blue-50 transition-all duration-200 shadow-sm"
              >
                <Edit className="w-4 h-4" />
                แก้ไขโปรเจคต์
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 rounded-xl text-sm font-medium text-red-700 hover:bg-red-50 transition-all duration-200 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                ลบโปรเจคต์
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-green-200 rounded-xl text-sm font-medium text-green-700 hover:bg-green-50 transition-all duration-200 shadow-sm">
                <Star className="w-4 h-4" />
                รายงาน
              </button>
            </div>
          </div>

          {/* Enhanced Progress Section */}
          <div className="mt-6 space-y-4">
            <div className="bg-white/80 backdrop-blur rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-slate-800">ความคืดหน้า</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">{project.progress}%</span>
                  <span className="text-sm text-slate-500">เสร็จแล้ว</span>
                </div>
              </div>
              <div className="relative w-full h-6 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${project.progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-white drop-shadow">{project.progress}%</span>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="text-base font-semibold text-slate-800">การใช้งบประมาณ</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    ฿{project.spent?.toLocaleString() || "0"}
                  </span>
                  <span className="text-sm text-slate-500">จาก</span>
                  <span className="text-sm text-slate-400">/</span>
                  <span className="text-lg font-semibold text-slate-600">
                    ฿{project.budget?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
              <div className="relative w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg border border-blue-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-medium text-blue-800">งบประมาณ</h3>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">ทั้งหมด</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  ฿{project.budget?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-blue-600">จัดสรร</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">ใช้ไป</p>
                <p className="text-lg font-semibold text-blue-700">
                  ฿{project.spent?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-medium text-green-800">สมาชิกทีม</h3>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">{teamMembers.length} คน</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {teamMembers.length}
                </p>
                <p className="text-xs text-green-600">คน</p>
              </div>
              <div className="flex items-center gap-2">
                {teamMembers.slice(0, 2).map((member, index) => (
                  <div key={index} className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-green-700 text-xs font-bold">
                    {member.name.split(' ')[0][0]}
                  </div>
                ))}
                {teamMembers.length > 2 && (
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-green-700 text-xs font-bold">
                    +{teamMembers.length - 2}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg border border-orange-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Target className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-medium text-orange-800">Tasks</h3>
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">{tasks.length} รายการ</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-900">
                  {tasks.length}
                </p>
                <p className="text-xs text-orange-600">รายการ</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  {tasks.filter(t => t.status === 'completed').length}
                </span>
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  <Activity className="w-3 h-3" />
                  {tasks.filter(t => t.status === 'in_progress').length}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg border border-purple-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-medium text-purple-800">เอกสาร</h3>
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{documents.length} รายการ</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-900">
                  {documents.length}
                </p>
                <p className="text-xs text-purple-600">รายการ</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-purple-600">
                  <PieChart className="w-4 h-4" />
                  <span>{documents.reduce((total, doc) => total + (parseInt(doc.size) || 0), 0) > 0 ? 
                    `${(documents.reduce((total, doc) => total + (parseInt(doc.size) || 0), 0) / 1024 / 1024).toFixed(1)} MB` : 
                    '0 MB'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex gap-1 px-6 overflow-x-auto">
              {[
                {
                  id: "overview",
                  label: "ภาพรวม",
                  icon: BarChart3,
                  href: `/projects/${project.id}`,
                },
                {
                  id: "tasks",
                  label: "Tasks",
                  icon: Target,
                  href: `/projects/${project.id}/tasks`,
                },
                {
                  id: "risks",
                  label: "ความเสี่ยง",
                  icon: AlertTriangle,
                  href: `/projects/${project.id}/risks`,
                },
                {
                  id: "milestones",
                  label: "จุดหมาย",
                  icon: CheckCircle2,
                  href: `/projects/${project.id}/milestones`,
                },
                {
                  id: "budget",
                  label: "งบประมาณ",
                  icon: DollarSign,
                  href: `/projects/${project.id}/budget`,
                },
                {
                  id: "cost-sheet",
                  label: "ต้นทุน",
                  icon: TrendingUp,
                  href: `/projects/${project.id}/cost-sheet`,
                },
                {
                  id: "documents",
                  label: "เอกสาร",
                  icon: FileText,
                  href: `/projects/${project.id}/documents`,
                },
                {
                  id: "team",
                  label: "ทีมงาน",
                  icon: Users,
                  href: `/projects/${project.id}/team`,
                },
              ].map((tab, index) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={clsx(
                    "flex items-center gap-3 px-6 py-4 text-sm font-semibold border-b-3 transition-all duration-200",
                    index === 0
                      ? "border-blue-500 text-blue-700 bg-blue-50"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {index === 0 && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">หน้าหลัก</span>
                  )}
                  {tab.id === "overview" && (
                    <Briefcase className="w-4 h-4 ml-2" />
                  )}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Tab Content Preview */}
          <div className="p-6 bg-gradient-to-b from-slate-50 to-white">
            <div className="text-center py-8">
              <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">ภาพรวจโครงการ</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                ภาพรวจภาพรวจทั่วโครงการ ทั้งหมด พร้อมกราฟิกชันและเครื่องเพิ่มเติม
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">สถานะโครงการ</h4>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-slate-600">{project.status === "in_progress" ? "ดำเนินการ" : project.status}</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">ความคืดหน้า</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">{project.progress}%</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">ทีมงาน</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-green-600">{teamMembers.length}</span>
                    <span className="text-sm text-slate-600">คน</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            แก้ไขโปรเจคต์
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateProject({
                  name: formData.get("name") as string,
                  status: formData.get("status") as string,
              });
            }}
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อโปรเจคต์
                </label>
                <input
                  name="name"
                  type="text"
                  defaultValue={project.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  สถานะ
                </label>
                <select
                  name="status"
                  defaultValue={project.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Planning">วางแผน</option>
                  <option value="in_progress">ดำเนินการ</option>
                  <option value="completed">เสร็จสิ้น</option>
                  <option value="on_hold">พักชั่วคราว</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  </div>
  );
}
