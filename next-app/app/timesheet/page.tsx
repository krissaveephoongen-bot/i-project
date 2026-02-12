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
  AlertCircle
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
  const [modalRows, setModalRows] = useState<Array<{ id?: string; taskId?: string; hours: number; start?: string; end?: string; deleted?: boolean }>>([]);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

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

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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
        hours: d.hours
      }));
      setEntries(mappedData);
    }
  };

  // Actions
  const openDayEditor = (projectId: string, day: number) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
    const existingEntries = entries.filter(entry => entry.projectId === projectId && entry.date === dateStr);
    setModalProjectId(projectId);
    setModalDate(dateStr);
    setModalRows(existingEntries.length > 0 ? existingEntries.map(e => ({ id: e.id, taskId: e.taskId, hours: e.hours })) : [{ hours: 0 }]);
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
            body: JSON.stringify({ id: r.id, hours: r.hours, task_id: r.taskId, start_time: r.start || null, end_time: r.end || null }),
          });
          setEntries(prev => prev.map(e => e.id === r.id ? { ...e, hours: r.hours, taskId: r.taskId, date: modalDate } : e));
        } else if (r.hours > 0) {
          const res = await fetch(`${API_BASE}/api/timesheet/entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user?.id, project_id: modalProjectId, task_id: r.taskId, date: modalDate, hours: r.hours, start_time: r.start || null, end_time: r.end || null }),
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
      toast.success('Submitted for approval');
    } else {
      toast.error('Failed to submit timesheet');
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
      case 'Draft': return <Badge variant="secondary">Draft</Badge>;
      case 'Submitted': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Submitted</Badge>;
      case 'Approved': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'Rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in.</div>;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header title="Monthly Timesheet" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Timesheet' }]} />
      
      <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
        
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-white p-2 rounded-lg border shadow-sm">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-center min-w-[140px]">
              <span className="font-semibold text-lg">{monthName}</span>
              <div className="flex items-center gap-2">
                {getStatusBadge(submissionStatus)}
                <span className="text-xs text-slate-500 font-medium">{totalHours}h Total</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
             <Link href="/timesheet/record">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  <Plus className="h-4 w-4" />
                  Add Timesheet
                </Button>
             </Link>
             
             {canEdit && (
               <Button 
                 variant={isEditing ? "secondary" : "outline"} 
                 onClick={() => setIsEditing(!isEditing)}
                 className="gap-2"
               >
                 {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                 {isEditing ? 'Stop Editing' : 'Edit Timesheet'}
               </Button>
             )}
             
             {submissionStatus === 'Draft' && (
               <Button onClick={() => setConfirmSubmit(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                 <Send className="h-4 w-4" /> Submit
               </Button>
             )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-3">
            <TabsTrigger value="monthly">Monthly View</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Summary</TabsTrigger>
            <TabsTrigger value="activities">Activities Log</TabsTrigger>
          </TabsList>

          {/* Monthly View */}
          <TabsContent value="monthly" className="mt-6">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px] bg-slate-50 sticky left-0 z-10">Project / Task</TableHead>
                      {daysInMonth.map(day => (
                        <TableHead key={day} className="text-center w-12 px-1 text-xs">{day}</TableHead>
                      ))}
                      <TableHead className="text-center bg-slate-50 font-bold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map(project => {
                       const projectTotal = daysInMonth.reduce((sum, day) => {
                         const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                         const entry = entries.find(e => e.projectId === project.id && e.date === dateStr);
                         return sum + (entry?.hours || 0);
                       }, 0);

                       return (
                         <TableRow key={project.id}>
                           <TableCell className="sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                             <div className="flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                               <Link href={`/projects/${project.id}`} className="font-medium hover:underline truncate max-w-[180px]">
                                 {project.name}
                               </Link>
                             </div>
                           </TableCell>
                           {daysInMonth.map(day => {
                             const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                             const dayEntries = entries.filter(e => e.projectId === project.id && e.date === dateStr);
                             const daySum = dayEntries.reduce((s, e) => s + (e.hours || 0), 0);
                             
                             return (
                               <TableCell key={day} className="p-1 text-center">
                                 {isEditing && canEdit ? (
                                   <div 
                                     onClick={() => openDayEditor(project.id, day)}
                                     className={`
                                       h-8 w-full min-w-[2rem] rounded flex items-center justify-center cursor-pointer text-xs font-medium transition-colors
                                       ${daySum > 0 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}
                                     `}
                                   >
                                     {daySum > 0 ? daySum : '+'}
                                   </div>
                                 ) : (
                                   <span className={`text-sm ${daySum > 0 ? 'font-medium text-slate-900' : 'text-slate-300'}`}>
                                     {daySum || '-'}
                                   </span>
                                 )}
                               </TableCell>
                             );
                           })}
                           <TableCell className="text-center font-bold text-slate-700 bg-slate-50">
                             {projectTotal > 0 ? projectTotal : '-'}
                           </TableCell>
                         </TableRow>
                       );
                    })}
                    {/* Daily Totals Row */}
                    <TableRow className="bg-slate-50 font-bold border-t-2">
                      <TableCell className="sticky left-0 bg-slate-50 z-10">Daily Total</TableCell>
                      {daysInMonth.map(day => {
                        const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                        const dayTotal = entries.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.hours, 0);
                        return <TableCell key={day} className="text-center text-xs">{dayTotal > 0 ? dayTotal : '-'}</TableCell>;
                      })}
                      <TableCell className="text-center text-blue-600">{totalHours}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>My Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {projects.map(project => (
                    <Link href={`/projects/${project.id}`} key={project.id}>
                      <Badge variant="outline" className="px-3 py-1.5 gap-2 text-sm font-normal hover:border-blue-500 cursor-pointer">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                        {project.name}
                      </Badge>
                    </Link>
                  ))}
                  <Button variant="ghost" size="sm" className="gap-2 border border-dashed text-slate-500">
                    <Plus className="h-3 w-3" /> Add Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Summary */}
          <TabsContent value="weekly" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
                <CardDescription>View total hours per person per day.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <Input 
                    type="date" 
                    className="w-auto" 
                    value={weeklyStart} 
                    onChange={e => setWeeklyStart(e.target.value)} 
                  />
                  <Select value={weeklyProject} onValueChange={setWeeklyProject}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleWeeklySearch}>Apply Filter</Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        {(weekly?.days || []).map(d => (
                          <TableHead key={d} className="text-center">
                            {new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
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
                              <span className={Number(row.hours[d] || 0) > 0 ? 'text-blue-600 font-medium' : 'text-slate-300'}>
                                {row.hours[d] ? Number(row.hours[d]).toFixed(1) : '-'}
                              </span>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                      {(!weekly?.data || weekly.data.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={(weekly?.days?.length || 0) + 1} className="h-24 text-center text-muted-foreground">
                            No data found for this week.
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
          <TabsContent value="activities" className="mt-6">
             <Card>
              <CardHeader>
                <CardTitle>Activities Log</CardTitle>
                <CardDescription>Detailed log of all time entries.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <Input 
                    type="date" 
                    className="w-auto" 
                    value={weeklyStart} 
                    onChange={e => setWeeklyStart(e.target.value)} 
                  />
                  <Select value={weeklyProject} onValueChange={setWeeklyProject}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={activityUser} onValueChange={setActivityUser}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {userOptions.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleActivitySearch}>Search</Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead className="text-center">Hours</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(activities?.rows || []).map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                          <TableCell>{r.user}</TableCell>
                          <TableCell>{r.project}</TableCell>
                          <TableCell>{r.task}</TableCell>
                          <TableCell className="text-center font-medium">{Number(r.hours || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {r.start ? `${new Date(r.start).toLocaleTimeString()} - ${r.end ? new Date(r.end).toLocaleTimeString() : '?'}` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!activities?.rows || activities.rows.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No activities found.
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
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Time Entry</DialogTitle>
              <DialogDescription>
                {modalDate && new Date(modalDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-medium">Project</label>
                   <Select value={modalProjectId} onValueChange={setModalProjectId} disabled>
                     <SelectTrigger>
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
                    <div key={idx} className="grid grid-cols-12 gap-3 items-end p-3 bg-slate-50 rounded-lg border">
                      <div className="col-span-5 space-y-1">
                        <label className="text-xs font-medium text-slate-500">Task</label>
                        <Select 
                          value={row.taskId || 'none'} 
                          onValueChange={(val) => setModalRows(prev => prev.map((r, i) => i === idx ? { ...r, taskId: val === 'none' ? undefined : val } : r))}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select Task" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="none">-- General --</SelectItem>
                             {(projects.find(p => p.id === modalProjectId)?.tasks || []).map(t => (
                               <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                             ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3 space-y-1">
                        <label className="text-xs font-medium text-slate-500">Hours</label>
                        <Input 
                          type="number" 
                          min={0} 
                          max={24} 
                          step={0.5}
                          className="h-8 text-xs"
                          value={row.hours} 
                          onChange={e => setModalRows(prev => prev.map((r, i) => i === idx ? { ...r, hours: parseFloat(e.target.value) || 0 } : r))} 
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                         <label className="text-xs font-medium text-slate-500">&nbsp;</label>
                         <Button 
                           variant="destructive" 
                           size="sm" 
                           className="h-8 w-full text-xs"
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
                  className="w-full border-dashed"
                >
                  <Plus className="h-3 w-3 mr-2" /> Add Another Entry
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={saveDayEditor}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Submit Modal */}
        <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
          <DialogContent>
             <DialogHeader>
               <DialogTitle>Submit Timesheet?</DialogTitle>
               <DialogDescription>
                 Are you sure you want to submit your timesheet for {monthName}?
               </DialogDescription>
             </DialogHeader>
             <div className="flex items-center gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm">
               <AlertCircle className="h-5 w-5" />
               <p>Once submitted, you will not be able to edit entries unless rejected by a manager.</p>
             </div>
             <DialogFooter>
               <Button variant="outline" onClick={() => setConfirmSubmit(false)}>Cancel</Button>
               <Button onClick={handleSubmitForApproval}>Confirm Submit</Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
