'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useFetchWithAbort } from '@/hooks/useFetchWithAbort';
import { 
  Edit2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  AlertCircle,
  Plus,
} from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';
import { useThaiLocale } from '@/lib/hooks/useThaiLocale';

// Shadcn UI Components
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/Dialog";
import PageTransition from '../components/PageTransition';
import { Skeleton } from '../components/ui/Skeleton';

// Custom Components
import MonthlyView from './components/MonthlyView';
import WeeklyView from './components/WeeklyView';
import ActivityLog from './components/ActivityLog';
import TimesheetModal from './components/TimesheetModal';
import { Project, TimesheetEntry, WeeklyData, ActivityData, ModalRow, SubmissionStatus, EntryStatus } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function TimesheetPage() {
  const { user } = useAuth();
  const { formatThaiDateWithDay, isThaiLanguage } = useThaiLocale();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({ status: 'Draft' });
  
  // Weekly Tab State
  const [weekly, setWeekly] = useState<WeeklyData | null>(null);
  const [weeklyStart, setWeeklyStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weeklyProject, setWeeklyProject] = useState<string>('all');
  
  // Activities Tab State
  const [activities, setActivities] = useState<ActivityData | null>(null);
  const [activityUser, setActivityUser] = useState<string>('all');
  const [activityTeam, setActivityTeam] = useState<string>('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProjectId, setModalProjectId] = useState<string>('');
  const [modalDate, setModalDate] = useState<string>('');
  const [modalRows, setModalRows] = useState<ModalRow[]>([]);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // Derived Data
  const userOptions = useMemo(() => {
    const m = new Map<string, string>();
    (weekly?.data || []).forEach((r: any) => {
      if (!m.has(r.userId)) m.set(r.userId, r.name);
    });
    return Array.from(m.entries()).map(([id, name]) => ({ id, name }));
  }, [weekly]);

  const monthName = isThaiLanguage ? 
    currentMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }) :
    currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      if (!API_BASE) {
        toast.error('API configuration missing');
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

      } catch (err) {
        console.error(err);
        toast.error('โหลดข้อมูลไทม์ชีทล้มเหลว');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, user]);

  const fetchTimesheetEntries = async (month: Date, projectIds?: string[]) => {
    if (!user || !API_BASE) return;
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
        projectId: d.projectId || d.project_id, // Handle both cases just in case
        taskId: d.taskId || d.task_id,
        date: d.date,
        hours: d.hours,
        description: d.description
      }));
      setEntries(mappedData);
    }
  };

  // Actions
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
        setModalRows(existingEntries.map(e => ({ 
          id: e.id, 
          date: e.date,
          project: e.projectId || '',
          task: e.taskId || '',
          startTime: e.startTime || '',
          endTime: e.endTime || '',
          hours: e.hours, 
          description: e.description || '',
          status: e.status || 'Draft'
        })));
    } else {
        // Always allow adding new entry, even if no existing entries
        setModalRows([{ 
          id: 'new',
          date: dateStr,
          project: projectId,
          task: taskId || '',
          startTime: '',
          endTime: '',
          hours: 0,
          description: '',
          status: 'Draft'
        }]);
    }
    setModalOpen(true);
  };

  const saveDayEditor = async (rows: ModalRow[]) => {
    if (!API_BASE) return;
    try {
      for (const r of rows) {
        if (r.deleted) {
          if (r.id && r.id !== 'new') {
            await fetch(`${API_BASE}/api/timesheet/entries?id=${r.id}`, { method: 'DELETE' });
            setEntries(prev => prev.filter(e => e.id !== r.id));
          }
          continue;
        }
        if (r.id && r.id !== 'new') {
          await fetch(`${API_BASE}/api/timesheet/entries`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: r.id, hours: r.hours, task_id: r.task, description: r.description, start_time: r.startTime || null, end_time: r.endTime || null }),
          });
          setEntries(prev => prev.map(e => e.id === r.id ? { ...e, hours: r.hours, taskId: r.task, date: modalDate, description: r.description } : e));
        } else if (r.hours > 0) {
          const res = await fetch(`${API_BASE}/api/timesheet/entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user?.id, project_id: modalProjectId, task_id: r.task, date: modalDate, hours: r.hours, description: r.description, start_time: r.startTime || null, end_time: r.endTime || null }),
          });
          const row = res.ok ? await res.json() : null;
          const newId = row?.id || `${modalProjectId}-${modalDate}-${Math.random().toString(36).slice(2,7)}`;
          setEntries(prev => [...prev, { 
          id: newId, 
          projectId: modalProjectId, 
          taskId: r.task, 
          date: modalDate, 
          hours: r.hours, 
          description: r.description,
          startTime: r.startTime,
          endTime: r.endTime,
          workType: 'project' as any,
          breakDuration: 0,
          userId: user?.id || '',
          billableHours: r.hours,
          status: EntryStatus.PENDING,
          approvedBy: null,
          approvedAt: null,
          rejectedReason: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]);
        }
      }
      setModalOpen(false);
      toast.success('บันทึกข้อมูลสำเร็จ');
    } catch {
      toast.error('บันทึกข้อมูลล้มเหลว');
    }
  };

  const handleSubmitForApproval = async () => {
    if (!user || !API_BASE) return;
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
      setSubmissionStatus({ status: 'Submitted', submittedAt: new Date().toISOString() });
      setIsEditing(false);
      toast.success('ส่งอนุมัติเรียบร้อยแล้ว');
    } else {
      toast.error('ส่งข้อมูลล้มเหลว');
    }
    setLoading(false);
  };

  const handleWeeklySearch = async () => {
    if (!API_BASE) return;
    const url = new URL(`${API_BASE}/api/timesheet/weekly`);
    url.searchParams.set('start', weeklyStart);
    if (weeklyProject && weeklyProject !== 'all') url.searchParams.set('projectId', weeklyProject);
    const r = await fetch(url.toString());
    const j = await r.json();
    setWeekly(j);
  };

  const handleActivitySearch = async () => {
    if (!API_BASE) return;
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
  const canEdit = submissionStatus.status === 'Draft' || submissionStatus.status === 'Rejected' || (isAuthority && submissionStatus.status === 'Submitted');

  // Add Entry Handler - open modal to add entry for a specific date and project
  const handleAddEntry = () => {
    if (!projects.length) {
      toast.error('ต้องมีโครงการอย่างน้อย 1 รายการ');
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const firstProject = projects[0].id;
    
    setModalProjectId(firstProject);
    setModalDate(today);
    setModalRows([{ 
      id: 'new',
      date: today,
      project: firstProject,
      task: '',
      startTime: '',
      endTime: '',
      hours: 0,
      description: '',
      status: 'Draft'
    }]);
    setModalOpen(true);
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status.status) {
      case 'Draft': return <Badge variant="secondary">แบบร่าง (Draft)</Badge>;
      case 'Submitted': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">รออนุมัติ (Submitted)</Badge>;
      case 'Approved': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">อนุมัติแล้ว (Approved)</Badge>;
      case 'Rejected': return <Badge variant="destructive">ไม่อนุมัติ (Rejected)</Badge>;
      default: return <Badge variant="outline">{status.status}</Badge>;
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

          <div className="flex items-center gap-2 flex-wrap">
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

             {canEdit && (
               <Button 
                 onClick={handleAddEntry}
                 className="gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-600/20"
               >
                 <Plus className="h-4 w-4" /> เพิ่มรายการใหม่
               </Button>
             )}
             
             {submissionStatus.status === 'Draft' && (
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
            <MonthlyView 
              currentMonth={currentMonth}
              projects={projects}
              entries={entries}
              isEditing={isEditing}
              canEdit={canEdit}
              onOpenDayEditor={openDayEditor}
            />
          </TabsContent>

          {/* Weekly Summary */}
          <TabsContent value="weekly" className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <WeeklyView 
              weekly={weekly}
              weeklyStart={weeklyStart}
              setWeeklyStart={setWeeklyStart}
              weeklyProject={weeklyProject}
              setWeeklyProject={setWeeklyProject}
              projects={projects}
              onSearch={handleWeeklySearch}
            />
          </TabsContent>

          {/* Activities Log */}
          <TabsContent value="activities" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <ActivityLog 
               activities={activities}
               weeklyStart={weeklyStart}
               setWeeklyStart={setWeeklyStart}
               weeklyProject={weeklyProject}
               setWeeklyProject={setWeeklyProject}
               activityUser={activityUser}
               setActivityUser={setActivityUser}
               projects={projects}
               userOptions={userOptions}
               onSearch={handleActivitySearch}
             />
          </TabsContent>
        </Tabs>

        {/* Edit Modal */}
        <TimesheetModal 
          open={modalOpen}
          onOpenChange={setModalOpen}
          projectId={modalProjectId}
          date={modalDate}
          projects={projects}
          initialRows={modalRows}
          onSave={saveDayEditor}
          userId={user?.id}
        />

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
