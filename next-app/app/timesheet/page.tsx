'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { 
  Clock, 
  Edit2, 
  Save, 
  X, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Calendar, 
  Send,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';

// Shadcn UI Components
import { Button } from '@/app/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/Select';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
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
import PageTransition from '../components/PageTransition';
import { Skeleton } from '../components/ui/Skeleton';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Project {
  id: string;
  name: string;
  color: string;
  is_billable?: boolean;
  tasks: Task[];
}

interface Task {
  id: string;
  name: string;
}

interface TimesheetEntry {
  id: string;
  projectId: string;
  taskId?: string;
  date: string;
  hours: number;
  description?: string;
}

type SubmissionStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export default function TimesheetPage() {
  const { user } = useAuth();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('Draft');
  
  // Weekly Tab State
  const [weekly, setWeekly] = useState<{ days: string[]; data: Array<{ userId: string; name: string; hours: Record<string, number> }> } | null>(null);
  const [weeklyStart, setWeeklyStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weeklyProject, setWeeklyProject] = useState<string>('all');
  
  // Activities Tab State
  const [activities, setActivities] = useState<{ days: string[]; rows: Array<{ date: string; user: string; project: string; task: string; hours: number; start?: string; end?: string }> } | null>(null);
  const [activityUser, setActivityUser] = useState<string>('all');
  const [activityTeam, setActivityTeam] = useState<string>('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProjectId, setModalProjectId] = useState<string>('');
  const [modalDate, setModalDate] = useState<string>('');
  const [modalRows, setModalRows] = useState<Array<{ id?: string; taskId?: string; hours: number; description?: string; start?: string; end?: string; deleted?: boolean }>>([]);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Derived Data
  const userOptions = useMemo(() => {
    const m = new Map<string, string>();
    (weekly?.data || []).forEach((r: any) => {
      if (!m.has(r.userId)) m.set(r.userId, r.name);
    });
    return Array.from(m.entries()).map(([id, name]) => ({ id, name }));
  }, [weekly]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch submission status
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const subRes = await fetch(`${API_BASE}/api/timesheet/submission?userId=${user.id}&start=${startOfMonth.toISOString().split('T')[0]}`);
        if (subRes.ok) {
          const subJson = await subRes.json();
          setSubmissionStatus(subJson.status || 'Draft');
        }
        setIsEditing(false);

        // Fetch projects
        const projRes = await fetch(`${API_BASE}/api/timesheet/projects?userId=${user.id}`);
        if (projRes.ok) {
          const projJson = await projRes.json();
          const transformedProjects = (projJson || []).map((project: any, index: number) => ({
            id: project.id,
            name: project.name,
            color: `hsl(${index * 60}, 70%, 50%)`,
            is_billable: !!project.is_billable,
            tasks: project.tasks || [],
          }));
          setProjects(transformedProjects);
          await fetchTimesheetEntries(currentMonth, transformedProjects.map((p: any) => p.id));
        }

        // Fetch Weekly Data (Initial)
        const weekStart = new Date(currentMonth);
        const weekday = weekStart.getDay();
        const diff = (weekday + 6) % 7;
        weekStart.setDate(weekStart.getDate() - diff);
        const wres = await fetch(`${API_BASE}/api/timesheet/weekly?start=${weekStart.toISOString().split('T')[0]}`);
        if (wres.ok) {
          const wjson = await wres.json();
          setWeekly(wjson);
          setWeeklyStart(weekStart.toISOString().split('T')[0]);
        }

        setError(null);
      } catch (err) {
        setError('Failed to fetch data');
        toast.error('โหลดข้อมูลไทม์ชีทล้มเหลว');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, user]);

  const fetchTimesheetEntries = async (month: Date, projectIds?: string[]) => {
    if (!user) return;
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const params = new URLSearchParams({
      userId: user.id,
      start: startOfMonth.toISOString().split('T')[0],
      end: endOfMonth.toISOString().split('T')[0],
      projects: (projectIds || []).join(',')
    }).toString();
    const res = await fetch(`${API_BASE}/api/timesheet/entries?${params}`);
    if (res.ok) {
      const data = await res.json();
      const mappedData = (data || []).map((d: any) => ({
        id: d.id,
        projectId: d.project_id,
        taskId: d.task_id,
        date: d.date,
        hours: d.hours,
        description: d.description
      }));
      setEntries(mappedData);
    }
  };

  // Actions
  const toggleExpand = (projectId: string) => {
    const newSet = new Set(expandedProjects);
    if (newSet.has(projectId)) {
      newSet.delete(projectId);
    } else {
      newSet.add(projectId);
    }
    setExpandedProjects(newSet);
  };

  const openDayEditor = (projectId: string, day: number, taskId?: string | null) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
    let existingEntries = entries.filter(entry => entry.projectId === projectId && entry.date === dateStr);
    
    if (taskId !== undefined) {
        if (taskId === null) {
            existingEntries = existingEntries.filter(e => !e.taskId);
        } else {
            existingEntries = existingEntries.filter(e => e.taskId === taskId);
        }
    }

    setModalProjectId(projectId);
    setModalDate(dateStr);
    
    if (existingEntries.length > 0) {
        setModalRows(existingEntries.map(e => ({ id: e.id, taskId: e.taskId, hours: e.hours, description: (e as any).description })));
    } else {
        setModalRows([{ hours: 0, taskId: taskId === null ? undefined : taskId }]);
    }
    setModalOpen(true);
  };

  const saveDayEditor = async () => {
    try {
      for (const r of modalRows) {
        if (r.deleted) {
          if (r.id) {
            await fetch(`${API_BASE}/api/timesheet/entries?id=${r.id}`, { method: 'DELETE' });
            setEntries(prev => prev.filter(e => e.id !== r.id));
          }
          continue;
        }
        if (r.id) {
          await fetch(`${API_BASE}/api/timesheet/entries`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: r.id, hours: r.hours, task_id: r.taskId, description: r.description, start_time: r.start || null, end_time: r.end || null }),
          });
          setEntries(prev => prev.map(e => e.id === r.id ? { ...e, hours: r.hours, taskId: r.taskId, date: modalDate } : e));
        } else if (r.hours > 0) {
          const res = await fetch(`${API_BASE}/api/timesheet/entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user?.id, project_id: modalProjectId, task_id: r.taskId, date: modalDate, hours: r.hours, description: r.description, start_time: r.start || null, end_time: r.end || null }),
          });
          const row = res.ok ? await res.json() : null;
          const newId = row?.id || `${modalProjectId}-${modalDate}-${Math.random().toString(36).slice(2,7)}`;
          setEntries(prev => [...prev, { id: newId, projectId: modalProjectId, taskId: r.taskId, date: modalDate, hours: r.hours }]);
        }
      }
      setModalOpen(false);
      toast.success('บันทึกข้อมูลสำเร็จ');
    } catch {
      toast.error('บันทึกข้อมูลล้มเหลว');
    }
  };

  const handleSubmitForApproval = async () => {
    if (!user) return;
    setLoading(true);
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

    const res = await fetch(`${API_BASE}/api/timesheet/submission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        period_start_date: startOfMonth.toISOString().split('T')[0],
        period_end_date: endOfMonth.toISOString().split('T')[0],
        total_hours: totalHours
      })
    });
    if (res.ok) {
      setSubmissionStatus('Submitted');
      setIsEditing(false);
      toast.success('ส่งอนุมัติเรียบร้อยแล้ว');
    } else {
      toast.error('ส่งข้อมูลล้มเหลว');
    }
    setLoading(false);
  };

  const handleWeeklySearch = async () => {
    const url = new URL(`${API_BASE}/api/timesheet/weekly`);
    url.searchParams.set('start', weeklyStart);
    if (weeklyProject && weeklyProject !== 'all') url.searchParams.set('projectId', weeklyProject);
    const r = await fetch(url.toString());
    const j = await r.json();
    setWeekly(j);
  };

  const handleActivitySearch = async () => {
    const u = new URL(`${API_BASE}/api/timesheet/activities`);
    u.searchParams.set('start', weeklyStart);
    if (weeklyProject && weeklyProject !== 'all') u.searchParams.set('projectId', weeklyProject);
    if (activityUser && activityUser !== 'all') u.searchParams.set('userId', activityUser);
    if (activityTeam) u.searchParams.set('team', activityTeam);
    const r = await fetch(u.toString());
    const j = await r.json();
    setActivities(j);
  };

  // Calculations
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const isAuthority = ['admin','manager'].includes((user as any)?.role || '');
  const canEdit = submissionStatus === 'Draft' || submissionStatus === 'Rejected' || (isAuthority && submissionStatus === 'Submitted');

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'Draft': return <Badge variant="secondary">แบบร่าง (Draft)</Badge>;
      case 'Submitted': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">รออนุมัติ (Submitted)</Badge>;
      case 'Approved': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">อนุมัติแล้ว (Approved)</Badge>;
      case 'Rejected': return <Badge variant="destructive">ไม่อนุมัติ (Rejected)</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) return <div className="p-8 text-center">กรุณาเข้าสู่ระบบ</div>;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <Header title="บันทึกเวลาทำงาน (Timesheet)" breadcrumbs={[{ label: 'แดชบอร์ด', href: '/' }, { label: 'Timesheet' }]} />
        <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
            <div className="flex justify-between">
                <Skeleton className="h-12 w-64 rounded-xl" />
                <Skeleton className="h-12 w-48 rounded-xl" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-slate-50/50">
      <Header title="บันทึกเวลาทำงาน (Timesheet)" breadcrumbs={[{ label: 'แดชบอร์ด', href: '/' }, { label: 'Timesheet' }]} />
      
      <div className="container mx-auto px-6 py-8 pt-24 space-y-6 max-w-[1600px]">
        
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-white p-2 rounded-xl border shadow-sm">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-center min-w-[140px]">
              <span className="font-semibold text-lg text-slate-900">{monthName}</span>
              <div className="flex items-center gap-2">
                {getStatusBadge(submissionStatus)}
                <span className="text-xs text-slate-500 font-medium">{totalHours} ชม.</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
             {canEdit && (
               <Button 
                 variant={isEditing ? "secondary" : "outline"} 
                 onClick={() => setIsEditing(!isEditing)}
                 className="gap-2 rounded-xl"
               >
                 {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                 {isEditing ? 'หยุดแก้ไข' : 'แก้ไขเวลา'}
               </Button>
             )}
             
             {submissionStatus === 'Draft' && (
               <Button onClick={() => setConfirmSubmit(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20">
                 <Send className="h-4 w-4" /> ส่งอนุมัติ
               </Button>
             )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full md:w-[450px] grid-cols-3 bg-slate-100 rounded-xl p-1">
            <TabsTrigger value="monthly" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">มุมมองรายเดือน</TabsTrigger>
            <TabsTrigger value="weekly" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">สรุปรายสัปดาห์</TabsTrigger>
            <TabsTrigger value="activities" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">ประวัติกิจกรรม</TabsTrigger>
          </TabsList>

          {/* Monthly View */}
          <TabsContent value="monthly" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="w-[280px] bg-slate-50 sticky left-0 z-20 font-semibold text-slate-700">โครงการ / งาน (Project / Task)</TableHead>
                      {daysInMonth.map(day => (
                        <TableHead key={day} className="text-center w-12 px-1 text-xs font-medium text-slate-500">{day}</TableHead>
                      ))}
                      <TableHead className="text-center bg-slate-50 font-bold text-slate-700 min-w-[60px]">รวม</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map(project => {
                       const projectTotal = daysInMonth.reduce((sum, day) => {
                         const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                         const dayEntries = entries.filter(e => e.projectId === project.id && e.date === dateStr);
                         return sum + dayEntries.reduce((s, e) => s + e.hours, 0);
                       }, 0);

                       const isExpanded = expandedProjects.has(project.id);
                       const projectTasks = project.tasks || [];

                       return (
                         <>
                           <TableRow key={project.id} className="bg-slate-50/30 hover:bg-slate-100 transition-colors group">
                             <TableCell className="sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r group-hover:bg-slate-50 transition-colors">
                               <div className="flex items-center gap-2 py-1">
                                 <button onClick={() => toggleExpand(project.id)} className="p-1 hover:bg-slate-200 rounded text-slate-400 transition-colors">
                                     {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                 </button>
                                 <div className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm" style={{ backgroundColor: project.color }} />
                                 <Link href={`/projects/${project.id}`} className="font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate max-w-[180px]">
                                   {project.name}
                                 </Link>
                               </div>
                             </TableCell>
                             {daysInMonth.map(day => {
                               const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                               const dayEntries = entries.filter(e => e.projectId === project.id && e.date === dateStr);
                               const daySum = dayEntries.reduce((s, e) => s + (e.hours || 0), 0);
                               
                               return (
                                 <TableCell key={day} className="p-1 text-center border-r border-slate-50 bg-slate-50/10">
                                   {isEditing && canEdit ? (
                                     <div 
                                       onClick={() => openDayEditor(project.id, day)}
                                       className={`
                                         h-8 w-full min-w-[2rem] rounded-lg flex items-center justify-center cursor-pointer text-xs font-bold transition-all
                                         ${daySum > 0 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-sm' : 'hover:bg-slate-100 text-slate-300'}
                                       `}
                                     >
                                       {daySum > 0 ? daySum : '+'}
                                     </div>
                                   ) : (
                                     <span className={`text-sm ${daySum > 0 ? 'font-bold text-slate-900' : 'text-slate-200'}`}>
                                       {daySum || '-'}
                                     </span>
                                   )}
                                 </TableCell>
                               );
                             })}
                             <TableCell className="text-center font-bold text-slate-900 bg-slate-50 border-l">
                               {projectTotal > 0 ? projectTotal : '-'}
                             </TableCell>
                           </TableRow>

                           {isExpanded && (
                               <>
                                   {projectTasks.map(task => {
                                       const taskTotal = daysInMonth.reduce((sum, day) => {
                                            const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                                            const dayEntries = entries.filter(e => e.projectId === project.id && e.taskId === task.id && e.date === dateStr);
                                            return sum + dayEntries.reduce((s, e) => s + e.hours, 0);
                                       }, 0);

                                       return (
                                           <TableRow key={`${project.id}-${task.id}`} className="hover:bg-slate-50 transition-colors">
                                               <TableCell className="sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r pl-10">
                                                   <div className="flex items-center gap-2 text-sm text-slate-600 truncate max-w-[200px]">
                                                       <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                       {task.name}
                                                   </div>
                                               </TableCell>
                                               {daysInMonth.map(day => {
                                                   const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                                                   const dayEntries = entries.filter(e => e.projectId === project.id && e.taskId === task.id && e.date === dateStr);
                                                   const daySum = dayEntries.reduce((s, e) => s + (e.hours || 0), 0);

                                                   return (
                                                       <TableCell key={day} className="p-1 text-center border-r border-slate-50">
                                                           {isEditing && canEdit ? (
                                                               <div 
                                                                   onClick={() => openDayEditor(project.id, day, task.id)}
                                                                   className={`
                                                                       h-7 w-full min-w-[2rem] rounded-md flex items-center justify-center cursor-pointer text-xs transition-colors
                                                                       ${daySum > 0 ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'hover:bg-slate-50 text-transparent hover:text-slate-400'}
                                                                   `}
                                                               >
                                                                   {daySum > 0 ? daySum : '+'}
                                                               </div>
                                                           ) : (
                                                               <span className={`text-xs ${daySum > 0 ? 'text-slate-600' : 'text-slate-200'}`}>
                                                                   {daySum || '-'}
                                                               </span>
                                                           )}
                                                       </TableCell>
                                                   );
                                               })}
                                               <TableCell className="text-center text-xs font-medium text-slate-500 bg-slate-50/50 border-l">
                                                   {taskTotal > 0 ? taskTotal : ''}
                                               </TableCell>
                                           </TableRow>
                                       );
                                   })}

                                   <TableRow key={`${project.id}-adhoc`} className="hover:bg-slate-50 transition-colors">
                                       <TableCell className="sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r pl-10">
                                           <div className="flex items-center gap-2 text-sm text-slate-500 italic truncate max-w-[200px]">
                                               <MoreHorizontal className="w-3 h-3" />
                                               งานอื่นๆ (Ad-hoc)
                                           </div>
                                       </TableCell>
                                       {daysInMonth.map(day => {
                                           const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                                           const dayEntries = entries.filter(e => e.projectId === project.id && !e.taskId && e.date === dateStr);
                                           const daySum = dayEntries.reduce((s, e) => s + (e.hours || 0), 0);

                                           return (
                                               <TableCell key={day} className="p-1 text-center border-r border-slate-50">
                                                   {isEditing && canEdit ? (
                                                       <div 
                                                           onClick={() => openDayEditor(project.id, day, null)}
                                                           className={`
                                                               h-7 w-full min-w-[2rem] rounded-md flex items-center justify-center cursor-pointer text-xs transition-colors
                                                               ${daySum > 0 ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'hover:bg-slate-50 text-transparent hover:text-slate-400'}
                                                           `}
                                                       >
                                                           {daySum > 0 ? daySum : '+'}
                                                       </div>
                                                   ) : (
                                                       <span className={`text-xs ${daySum > 0 ? 'text-slate-600' : 'text-slate-200'}`}>
                                                           {daySum || '-'}
                                                       </span>
                                                   )}
                                               </TableCell>
                                           );
                                       })}
                                       <TableCell className="text-center text-xs font-medium text-slate-500 bg-slate-50/50 border-l">
                                            {daysInMonth.reduce((sum, day) => {
                                                const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                                                const dayEntries = entries.filter(e => e.projectId === project.id && !e.taskId && e.date === dateStr);
                                                return sum + dayEntries.reduce((s, e) => s + e.hours, 0);
                                            }, 0) || ''}
                                       </TableCell>
                                   </TableRow>
                               </>
                           )}
                         </>
                       );
                    })}
                    {/* Daily Totals Row */}
                    <TableRow className="bg-slate-50 font-bold border-t-2 border-slate-200">
                      <TableCell className="sticky left-0 bg-slate-50 z-10 text-slate-700">รวมรายวัน (Daily Total)</TableCell>
                      {daysInMonth.map(day => {
                        const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                        const dayTotal = entries.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.hours, 0);
                        return <TableCell key={day} className="text-center text-xs text-slate-700">{dayTotal > 0 ? dayTotal : '-'}</TableCell>;
                      })}
                      <TableCell className="text-center text-blue-600 text-lg">{totalHours}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Summary */}
          <TabsContent value="weekly" className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>สรุปรายสัปดาห์</CardTitle>
                <CardDescription>ดูชั่วโมงรวมรายบุคคลต่อวัน</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <Input 
                    type="date" 
                    className="w-auto rounded-xl" 
                    value={weeklyStart} 
                    onChange={e => setWeeklyStart(e.target.value)} 
                  />
                  <Select value={weeklyProject} onValueChange={setWeeklyProject}>
                    <SelectTrigger className="w-[200px] rounded-xl">
                      <SelectValue placeholder="ทุกโครงการ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกโครงการ</SelectItem>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleWeeklySearch} className="rounded-xl">ค้นหา</Button>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>พนักงาน</TableHead>
                        {(weekly?.days || []).map(d => (
                          <TableHead key={d} className="text-center">
                            {new Date(d).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' })}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(weekly?.data || []).map(row => (
                        <TableRow key={row.userId}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          {(weekly?.days || []).map(d => (
                            <TableCell key={d} className="text-center">
                              <span className={Number(row.hours[d] || 0) > 0 ? 'text-blue-600 font-bold' : 'text-slate-300'}>
                                {row.hours[d] ? Number(row.hours[d]).toFixed(1) : '-'}
                              </span>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                      {(!weekly?.data || weekly.data.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={(weekly?.days?.length || 0) + 1} className="h-24 text-center text-muted-foreground">
                            ไม่พบข้อมูลสำหรับสัปดาห์นี้
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Log */}
          <TabsContent value="activities" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>ประวัติกิจกรรม (Activity Log)</CardTitle>
                <CardDescription>รายละเอียดการบันทึกเวลาทั้งหมด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <Input 
                    type="date" 
                    className="w-auto rounded-xl" 
                    value={weeklyStart} 
                    onChange={e => setWeeklyStart(e.target.value)} 
                  />
                  <Select value={weeklyProject} onValueChange={setWeeklyProject}>
                    <SelectTrigger className="w-[180px] rounded-xl">
                      <SelectValue placeholder="ทุกโครงการ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกโครงการ</SelectItem>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={activityUser} onValueChange={setActivityUser}>
                    <SelectTrigger className="w-[180px] rounded-xl">
                      <SelectValue placeholder="ทุกคน" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกคน</SelectItem>
                      {userOptions.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleActivitySearch} className="rounded-xl">ค้นหา</Button>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>วันที่</TableHead>
                        <TableHead>พนักงาน</TableHead>
                        <TableHead>โครงการ</TableHead>
                        <TableHead>งาน (Task)</TableHead>
                        <TableHead className="text-center">ชั่วโมง</TableHead>
                        <TableHead>เวลา</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(activities?.rows || []).map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{new Date(r.date).toLocaleDateString('th-TH')}</TableCell>
                          <TableCell>{r.user}</TableCell>
                          <TableCell>{r.project}</TableCell>
                          <TableCell>{r.task}</TableCell>
                          <TableCell className="text-center font-bold text-blue-600">{Number(r.hours || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {r.start ? `${new Date(r.start).toLocaleTimeString()} - ${r.end ? new Date(r.end).toLocaleTimeString() : '?'}` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!activities?.rows || activities.rows.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            ไม่พบกิจกรรม
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-[600px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>บันทึกเวลาทำงาน</DialogTitle>
              <DialogDescription>
                {modalDate && new Date(modalDate).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-medium">โครงการ</label>
                   <Select value={modalProjectId} onValueChange={setModalProjectId} disabled>
                     <SelectTrigger className="bg-slate-50">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                 </div>
              </div>

              <div className="space-y-4">
                {modalRows.map((row, idx) => (
                  !row.deleted && (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-end p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="col-span-5 space-y-1">
                        <label className="text-xs font-medium text-slate-500">งาน (Task)</label>
                        <Select 
                          value={row.taskId || 'none'} 
                          onValueChange={(val) => setModalRows(prev => prev.map((r, i) => i === idx ? { ...r, taskId: val === 'none' ? undefined : val } : r))}
                        >
                          <SelectTrigger className="h-9 text-xs bg-white">
                            <SelectValue placeholder="เลือกงาน" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="none">-- งานทั่วไป (General) --</SelectItem>
                             {(projects.find(p => p.id === modalProjectId)?.tasks || []).map(t => (
                               <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                             ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3 space-y-1">
                        <label className="text-xs font-medium text-slate-500">รายละเอียด</label>
                        <Input 
                          type="text"
                          className="h-9 text-xs bg-white"
                          placeholder="ทำอะไรไปบ้าง?"
                          value={row.description || ''}
                          onChange={e => setModalRows(prev => prev.map((r, i) => i === idx ? { ...r, description: e.target.value } : r))}
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-xs font-medium text-slate-500">ชม.</label>
                        <Input 
                          type="number" 
                          min={0} 
                          max={24} 
                          step={0.5}
                          className="h-9 text-xs bg-white text-center font-bold text-blue-600"
                          value={row.hours} 
                          onChange={e => setModalRows(prev => prev.map((r, i) => i === idx ? { ...r, hours: parseFloat(e.target.value) || 0 } : r))} 
                        />
                      </div>
                      <div className="col-span-1 space-y-1">
                         <label className="text-xs font-medium text-slate-500">&nbsp;</label>
                         <Button 
                           variant="destructive" 
                           size="sm" 
                           className="h-9 w-full text-xs"
                           onClick={() => setModalRows(prev => prev.map((r, i) => i === idx ? { ...r, deleted: true } : r))}
                         >
                           <X className="h-3 w-3" />
                         </Button>
                      </div>
                    </div>
                  )
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setModalRows(prev => [...prev, { hours: 0 }])}
                  className="w-full border-dashed rounded-xl"
                >
                  <Plus className="h-3 w-3 mr-2" /> เพิ่มรายการ
                </Button>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="rounded-xl">ยกเลิก</Button>
              <Button onClick={saveDayEditor} className="rounded-xl bg-blue-600 hover:bg-blue-700">บันทึก</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Submit Modal */}
        <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
          <DialogContent className="rounded-2xl">
             <DialogHeader>
               <DialogTitle>ยืนยันการส่งอนุมัติ?</DialogTitle>
               <DialogDescription>
                 คุณแน่ใจหรือไม่ที่จะส่ง Timesheet สำหรับเดือน {monthName}?
               </DialogDescription>
             </DialogHeader>
             <div className="flex items-center gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm border border-yellow-100">
               <AlertCircle className="h-5 w-5 shrink-0" />
               <p>เมื่อส่งแล้ว คุณจะไม่สามารถแก้ไขข้อมูลได้อีกจนกว่าจะได้รับการพิจารณาจากหัวหน้างาน</p>
             </div>
             <DialogFooter className="gap-2 sm:gap-0">
               <Button variant="outline" onClick={() => setConfirmSubmit(false)} className="rounded-xl">ยกเลิก</Button>
               <Button onClick={handleSubmitForApproval} className="rounded-xl bg-blue-600 hover:bg-blue-700">ยืนยันส่ง</Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </PageTransition>
  );
}
