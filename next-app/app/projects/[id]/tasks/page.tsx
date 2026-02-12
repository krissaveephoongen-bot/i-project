'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import ProjectTabs from '@/app/components/ProjectTabs';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
import { CheckCircle2, Circle, Clock, AlertTriangle, MoreVertical, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface Task {
  id: string;
  name: string;
  phase: string;
  weight: number;
  progress_plan: number;
  progress_actual: number;
  start_date: string;
  end_date: string;
  assignee: string;
  vendor: string;
  status: string;
  progressPlan?: number;
  progressActual?: number;
  startDate?: string;
  endDate?: string;
}

export default function ProjectTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'pending'>('all');
  const [dbProjectId, setDbProjectId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const params = useParams() as Record<string, string | string[] | undefined> | null;
  const projectId =
    typeof params?.id === 'string'
      ? params!.id
      : Array.isArray(params?.id)
      ? (params!.id as string[])[0]
      : '';
  const router = useRouter();

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        setLoading(true);

        setDbProjectId(projectId);
        const res = await fetch(`${API_BASE}/api/projects/tasks?projectId=${projectId}`);
        const rows = res.ok ? await res.json() : [];
        const transformedTasks = (rows || []).map((task: any) => ({
          id: task.id,
          name: task.name,
          phase: task.phase,
          weight: task.weight,
          progress_plan: task.progress_plan,
          progress_actual: task.progress_actual,
          start_date: task.start_date,
          end_date: task.end_date,
          assignee: 'Unassigned',
          vendor: task.vendor || '',
          status: task.status,
          progressPlan: task.progress_plan,
          progressActual: task.progress_actual,
          startDate: task.start_date,
          endDate: task.end_date
        }));
        setTasks(transformedTasks);
        setError(null);
      } catch (err) {
        setError('Failed to fetch tasks');
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndTasks();
  }, [projectId]);

  const addTask = async () => {
    if (!dbProjectId) return;

    try {
      const payload = {
        project_id: dbProjectId,
        name: 'New Task',
        phase: 'Development',
        weight: 5,
        progress_plan: 0,
        progress_actual: 0,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Pending'
      };
      const res = await fetch(`${API_BASE}/api/projects/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = res.ok ? await res.json() : null;
      if (data) {
        setTasks(prev => [...prev, {
          id: data.id,
          name: data.name,
          phase: data.phase,
          weight: data.weight,
          progress_plan: data.progress_plan,
          progress_actual: data.progress_actual,
          start_date: data.start_date,
          end_date: data.end_date,
          assignee: 'Unassigned',
          vendor: data.vendor || '',
          status: data.status,
          progressPlan: data.progress_plan,
          progressActual: data.progress_actual,
          startDate: data.start_date,
          endDate: data.end_date
        }]);
        const id = data.id;
        if (id && projectId) {
          const url = `/projects/${projectId}/tasks/${id}/edit`;
          window.location.assign(url);
        }
      }
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task');
    }
  };
  const updateTask = async (id: string, updatedFields: any) => {
    const res = await fetch(`${API_BASE}/api/projects/tasks`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, updatedFields }) });
    if (res.ok) {
      const data = await res.json();
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
    }
  };
  const deleteTask = async (id: string) => {
    const res = await fetch(`${API_BASE}/api/projects/tasks?id=${id}`, { method: 'DELETE' });
    if (res.ok) setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Pending':
        return <Circle className="w-5 h-5 text-slate-400" />;
      default:
        return <Circle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Pending':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status.toLowerCase().replace(' ', '-') === filter;
  });

  const totalWeight = tasks.reduce((sum, t) => sum + t.weight, 0);
  const completedWeight = tasks.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.weight, 0);
  const inProgressWeight = tasks.filter(t => t.status === 'In Progress').reduce((sum, t) => sum + (t.weight * (t.progressActual || t.progress_actual || 0) / 100), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="WBS Tasks"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: 'ERP Implementation', href: '/projects/1' },
          { label: 'Tasks' }
        ]}
      />
      
      <div className="pt-20 px-6 pb-6">
        <ProjectTabs />
        {/* Progress Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Work Breakdown Structure</h2>
            <button onClick={addTask} className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
          
          {/* Overall Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Overall Progress</span>
              <span className="text-sm font-medium text-slate-900">{Math.round(completedWeight + inProgressWeight)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                style={{ width: `${completedWeight + inProgressWeight}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span>Total Weight: {totalWeight}%</span>
              <span>Completed: {completedWeight}% | In Progress: {inProgressWeight.toFixed(1)}%</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-4">
            {(['all', 'completed', 'in-progress', 'pending'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  filter === f 
                    ? 'bg-[#2563EB] text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {f === 'all' ? 'All Tasks' : f.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>

          {/* Task Tree */}
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div key={task.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div 
                  className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                  onClick={() => toggleExpand(task.id)}
                >
                  {expandedTasks.includes(task.id) 
                    ? <ChevronDown className="w-4 h-4 text-slate-400" />
                    : <ChevronRight className="w-4 h-4 text-slate-400" />
                  }
                  {getStatusIcon(task.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{task.id}</span>
                      <span className="text-sm font-medium text-slate-900">{task.name}</span>
                    </div>
                    <p className="text-xs text-slate-500">{task.phase} • {task.startDate} - {task.endDate}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={clsx('px-2 py-1 rounded text-xs font-medium', getStatusColor(task.status))}>
                      {task.status}
                    </span>
                    <div className="w-24">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">Progress</span>
                        <span className="text-xs font-medium text-slate-700">{task.progressActual}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={clsx(
                            'h-full rounded-full',
                            task.progressActual === 100 ? 'bg-green-500' : 'bg-[#2563EB]'
                          )}
                          style={{ width: `${task.progressActual}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-900 w-12">{task.weight}%</span>
                    <span className="text-sm text-slate-500">{task.assignee}</span>
                    <button className="px-3 py-1 bg-[#2563EB] text-white rounded text-xs" onClick={()=>router.push(`/projects/${projectId}/tasks/${task.id}/edit`)}>แก้ไข</button>
                    <button className="p-1 text-slate-400 hover:text-slate-600" onClick={()=>setDeleteConfirmId(task.id)}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Task Details */}
                {expandedTasks.includes(task.id) && (
                  <div className="p-4 bg-white border-t border-slate-200">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Assignee</p>
                        <p className="text-sm font-medium text-slate-900">{task.assignee}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Vendor</p>
                        <p className="text-sm font-medium text-slate-900">{task.vendor || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Planned Progress</p>
                        <p className="text-sm font-medium text-slate-900">{task.progressPlan}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Duration</p>
                        <p className="text-sm font-medium text-slate-900">{task.endDate}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Task Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-slate-900">{tasks.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'Completed').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {tasks.filter(t => t.status === 'In Progress').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-slate-600">
              {tasks.filter(t => t.status === 'Pending').length}
            </p>
          </div>
        </div>
      </div>
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">ยืนยันการลบงาน</h3>
              <p className="text-sm text-slate-600 mt-1">คุณต้องการลบงานนี้หรือไม่</p>
            </div>
            <div className="p-4 flex justify-end gap-2">
              <button onClick={()=>setDeleteConfirmId(null)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">ยกเลิก</button>
              <button onClick={async ()=>{ await deleteTask(deleteConfirmId!); setDeleteConfirmId(null); }} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm">ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
