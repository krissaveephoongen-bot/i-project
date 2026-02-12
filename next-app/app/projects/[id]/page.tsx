'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ChevronDown, 
  UserPlus, 
  FileText, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  ExternalLink,
  DollarSign,
  Users,
  Paperclip,
  TrendingUp,
  FolderOpen,
  Target,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import Header from '../../components/Header';
import SCurveChart from './SCurveChart';
import { clsx } from 'clsx';
import { supabase } from '../../lib/supabaseClient';

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
  name: string;
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

type TabType = 'dashboard' | 'tasks' | 'risks' | 'milestones' | 'budget' | 'documents' | 'team';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showStakeholderMap, setShowStakeholderMap] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    router.replace(`/projects/${params.id}/overview`);
    setRedirected(true);
  }, [params.id]);

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Fetch project details
        let projectData: any = null;
        const { data: projectData0, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.id)
          .single();

        if (projectError) {
          const res = await fetch(`/api/projects/?q=${encodeURIComponent(params.id)}`, { cache: 'no-store' });
          const rows = res.ok ? await res.json() : [];
          projectData = (rows || []).find((p: any) => p.id === params.id) || rows[0] || null;
          if (!projectData) throw projectError;
        } else {
          projectData = projectData0;
        }
        setProject(projectData as any);

        // Fetch tasks
        const { data: taskData } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', params.id)
          .order('created_at', { ascending: false });

        setTasks(taskData || []);

        // Fetch documents
        const { data: documentData } = await supabase
          .from('documents')
          .select('*')
          .eq('project_id', params.id)
          .order('created_at', { ascending: false });

        setDocuments(documentData || []);

        // Fetch team members
        const { data: memberData } = await supabase
          .from('project_members')
          .select('*')
          .eq('project_id', params.id);

        setTeamMembers(memberData || []);

        setError(null);
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching project data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [params.id]);

  // CRUD functions
  const handleUpdateProject = async (updatedProject: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updatedProject,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      
      setProject(data as Project);
      setShowEditForm(false);
    } catch (err) {
      console.error('Error updating project:', err);
      alert('เกิดข้อผิดพลาดในการอัปเดต: ' + (err as Error).message);
    }
  };

  const handleDeleteProject = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', params.id);

      if (error) throw error;
      
      router.push('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('เกิดข้อผิดพลาดในการลบ: ' + (err as Error).message);
    }
  };

  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          project_id: params.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => [data, ...prev]);
    } catch (err) {
      console.error('Error adding task:', err);
      alert('เกิดข้อผิดพลาดในการเพิ่ม task: ' + (err as Error).message);
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => prev.map(task => task.id === taskId ? data : task));
    } catch (err) {
      console.error('Error updating task:', err);
      alert('เกิดข้อผิดพลาดในการอัปเดต task: ' + (err as Error).message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('เกิดข้อผิดพลาดในการลบ task: ' + (err as Error).message);
    }
  };

  const handleAddDocument = async (documentData: Partial<Document>) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...documentData,
          project_id: params.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      setDocuments(prev => [data, ...prev]);
    } catch (err) {
      console.error('Error adding document:', err);
      alert('เกิดข้อผิดพลาดในการเพิ่มเอกสาร: ' + (err as Error).message);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('เกิดข้อผิดพลาดในการลบเอกสาร: ' + (err as Error).message);
    }
  };

  const handleAddTeamMember = async (memberData: Partial<TeamMember>) => {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .insert({
          ...memberData,
          project_id: params.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      setTeamMembers(prev => [data, ...prev]);
    } catch (err) {
      console.error('Error adding team member:', err);
      alert('เกิดข้อผิดพลาดในการเพิ่มสมาชิก: ' + (err as Error).message);
    }
  };

  const handleDeleteTeamMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (err) {
      console.error('Error deleting team member:', err);
      alert('เกิดข้อผิดพลาดในการลบสมาชิก: ' + (err as Error).message);
    }
  };

  // Loading and error states
  if (redirected) {
    return null;
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-slate-600 mb-4">เกิดข้อผิดพลาด: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            <Target className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-slate-600">ไม่พบข้อมูลโปรเจคต์</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        title={project?.name || 'Project Details'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: project?.name || 'Project', href: `/projects/${params.id}` }
        ]}
      />
      
      {project && (
        <>
          <div className="pt-20 px-6 pb-6">
            {/* Project Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#2563EB] rounded-lg flex items-center justify-center text-white font-bold">
                    {project.code?.substring(0, 2) || 'PR'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
                      <span className={clsx('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                        project.status === 'Active' ? 'bg-green-100 text-green-700' :
                        project.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-700'
                      )}>
                        <CheckCircle2 className="w-3 h-3" />
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {project.code} •
                      {project.start_date && project.end_date ?
                        `${new Date(project.start_date).toLocaleDateString('th-TH')} to ${new Date(project.end_date).toLocaleDateString('th-TH')}`
                        : 'No dates set'
                      }
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
                  <span className="text-sm text-slate-600 w-16">ความคืบหน้า</span>
                  <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>
                  <span className="text-sm font-medium text-slate-600 w-12">{project.progress}%</span>
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
                    <p className="text-xl font-bold text-slate-900">฿{project.budget?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-600">สมาชิกทีม</p>
                    <p className="text-xl font-bold text-slate-900">{teamMembers.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-slate-600">Tasks</p>
                    <p className="text-xl font-bold text-slate-900">{tasks.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-slate-600">เอกสาร</p>
                    <p className="text-xl font-bold text-slate-900">{documents.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation to separate tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="border-b border-slate-200">
                <div className="flex gap-1 px-4 overflow-x-auto">
                  {[
                    { id: 'tasks', label: 'Tasks', icon: Target, href: `/projects/${params.id}/tasks` },
                    { id: 'risks', label: 'Risks', icon: AlertTriangle, href: `/projects/${params.id}/risks` },
                    { id: 'milestones', label: 'Milestones', icon: CheckCircle2, href: `/projects/${params.id}/milestones` },
                    { id: 'budget', label: 'Budget', icon: DollarSign, href: `/projects/${params.id}/budget` },
                    { id: 'documents', label: 'Documents', icon: FileText, href: `/projects/${params.id}/documents` },
                    { id: 'team', label: 'Team', icon: Users, href: `/projects/${params.id}/team` }
                  ].map((tab) => (
                    <Link
                      key={tab.id}
                      href={tab.href}
                      className={clsx(
                        'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                        'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
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
        </>
      )}

      {/* Edit Form Modal */}
      {showEditForm && project && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">แก้ไขโปรเจคต์</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateProject({
                name: project.name,
                description: project.description,
                status: project.status,
                progress: project.progress,
                budget: project.budget,
                spent: project.spent,
                start_date: project.start_date,
                end_date: project.end_date,
                manager_id: project.manager_id
              });
            }}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อโปรเจคต์</label>
                  <input
                    type="text"
                    defaultValue={project.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select
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
      {showDeleteConfirm && project && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md m-4 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ยืนยันการลบโปรเจคต์</h2>
            <p className="text-gray-600 mb-6">
              {project && `คุณต้องการลบโปรเจคต์ "${project.name}"? การกระทำนี้ไม่สามารถกูบคืนได้`}
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
