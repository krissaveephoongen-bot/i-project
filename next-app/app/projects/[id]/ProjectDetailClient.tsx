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
        {/* Project Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#2563EB] rounded-lg flex items-center justify-center text-white font-bold">
                {project.code?.substring(0, 2) || "PR"}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-slate-900">
                    {project.name}
                  </h1>
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      project.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : project.status === "Planning"
                        ? "bg-blue-100 text-blue-800"
                        : project.status === "Completed"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-700",
                    )}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {project.code} •
                  {project.start_date && project.end_date
                    ? `${new Date(project.start_date).toLocaleDateString("th-TH")} to ${new Date(project.end_date).toLocaleDateString("th-TH")}`
                    : "No dates set"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEditForm(true)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                แก้ไข
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                ลบ
              </button>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 w-16">
                ความคืบหน้า
              </span>
              <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-600 w-12">
                {project.progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">งบประมาณ</p>
                <p className="text-xl font-bold text-slate-900">
                  ฿{project.budget?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">สมาชิกทีม</p>
                <p className="text-xl font-bold text-slate-900">
                  {teamMembers.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-slate-600">Tasks</p>
                <p className="text-xl font-bold text-slate-900">
                  {tasks.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">เอกสาร</p>
                <p className="text-xl font-bold text-slate-900">
                  {documents.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation to separate tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-200">
            <div className="flex gap-1 px-4 overflow-x-auto">
              {[
                {
                  id: "tasks",
                  label: "Tasks",
                  icon: Target,
                  href: `/projects/${project.id}/tasks`,
                },
                {
                  id: "risks",
                  label: "Risks",
                  icon: AlertTriangle,
                  href: `/projects/${project.id}/risks`,
                },
                {
                  id: "milestones",
                  label: "Milestones",
                  icon: CheckCircle2,
                  href: `/projects/${project.id}/milestones`,
                },
                {
                  id: "budget",
                  label: "Budget",
                  icon: DollarSign,
                  href: `/projects/${project.id}/budget`,
                },
                {
                  id: "cost-sheet",
                  label: "Cost Sheet",
                  icon: TrendingUp,
                  href: `/projects/${project.id}/cost-sheet`,
                },
                {
                  id: "documents",
                  label: "Documents",
                  icon: FileText,
                  href: `/projects/${project.id}/documents`,
                },
                {
                  id: "team",
                  label: "Team",
                  icon: Users,
                  href: `/projects/${project.id}/team`,
                },
              ].map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                    "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300",
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                    <option value="Active">ดำเนินการ</option>
                    <option value="Completed">เสร็จสิ้น</option>
                    <option value="On Hold">พักชั่วคราว</option>
                    <option value="Cancelled">ยกเลิก</option>
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md m-4 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ยืนยันการลบโปรเจคต์
            </h2>
            <p className="text-gray-600 mb-6">
              {`คุณต้องการลบโปรเจคต์ "${project.name}"? การกระทำนี้ไม่สามารถกูบคืนได้`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteProject}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                ลบโปรเจคต์
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
