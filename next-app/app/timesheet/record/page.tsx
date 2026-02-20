'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';
import { timesheetService } from '@/app/lib/timesheet-service';
import { activityService, ActivityType } from '@/app/lib/activity-service';
import { TimeEntry, WorkType } from '@/app/timesheet/types';
import { toast } from 'react-hot-toast';

export default function TimesheetRecordPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [form, setForm] = useState<{
    workType: WorkType;
    projectId: string;
    taskId?: string;
    date: string;
    startTime: string;
    endTime: string;
    hours: number;
    activity: string;
    description: string;
    billable: boolean;
  }>({
    workType: WorkType.PROJECT,
    projectId: '',
    taskId: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '18:00',
    hours: 8,
    activity: '',
    description: '',
    billable: true,
    taskMode: 'planned' as 'planned' | 'adhoc', // 'planned' = Task from Project, 'adhoc' = Other Activity
  });
  
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [teamLoad, setTeamLoad] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Filtered tasks based on selected project
  const projectTasks = form.projectId 
    ? (projects.find(p => p.id === form.projectId)?.tasks || []) 
    : [];

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      
      // Load Projects
      try {
        const projs = await timesheetService.getProjects(user.id);
        setProjects(projs || []);
        
        // Load Activities
        const acts = await activityService.getAll();
        setActivities(acts);
      } catch (e) {
        console.error('Failed to load projects or activities', e);
      }

      // Load Entries
      try {
        const start = new Date(); 
        start.setDate(start.getDate() - 7);
        const startDateStr = start.toISOString().slice(0,10);
        const endDateStr = new Date().toISOString().slice(0,10);
        
        const loadedEntries = await timesheetService.getEntries(user.id, startDateStr, endDateStr);
        setEntries(loadedEntries);

        // Load Team Load (Mock)
        setTeamLoad({
          weeklyCapacity: 40,
          currentLoad: loadedEntries.reduce((acc, cur) => acc + (cur.hours || 0), 0),
          utilization: 0
        });
      } catch (e) {
        console.error('Failed to load entries', e);
      }
    };
    load();
  }, [user]);

  // Update hours automatically when start/end time changes
  useEffect(() => {
    if (form.startTime && form.endTime) {
      const start = new Date(`2000-01-01T${form.startTime}`);
      const end = new Date(`2000-01-01T${form.endTime}`);
      const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const h = Math.max(0, parseFloat((diff / 60).toFixed(2)));
      setForm(prev => ({ ...prev, hours: h }));
    }
  }, [form.startTime, form.endTime]);

  const createEntry = async () => {
    if (!user) return;
    if (form.workType === WorkType.PROJECT) {
        if (!form.projectId) {
            alert('Please select a project');
            return;
        }
        if (form.taskMode === 'planned' && !form.taskId) {
            alert('Please select a task');
            return;
        }
    }
    if (!form.description) {
        alert('Please enter description');
        return;
    }

    setLoading(true);
    try {
        // Prepare payload, handling optional fields
        const entryData: Partial<TimeEntry> = {
            userId: user.id,
            date: form.date,
            hours: form.hours,
            startTime: form.startTime,
            endTime: form.endTime,
            workType: form.workType,
            description: form.description,
            projectId: form.workType === WorkType.PROJECT ? form.projectId : null,
            taskId: form.workType === WorkType.PROJECT && form.taskMode === 'planned' ? (form.taskId || null) : null,
            billableHours: (form.workType === WorkType.PROJECT && form.billable) ? form.hours : 0
        };

        const newEntry = await timesheetService.createEntry(entryData);
        
        if (newEntry) {
            setEntries(prev => [newEntry, ...prev]);
            setForm(prev => ({ ...prev, description: '', activity: '' }));
            toast.success('บันทึกข้อมูลสำเร็จ');
        }
    } catch (e) {
        console.error(e);
        alert('Failed to save entry');
    } finally {
        setLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const success = await timesheetService.deleteEntry(id);
    if (success) {
        setEntries(prev => prev.filter(e => e.id !== id));
        toast.success('ลบรายการสำเร็จ');
    } else {
        alert('Failed to delete');
    }
  };

  const getUtilizationColor = (percent: number) => {
      if (percent > 100) return 'bg-red-500';
      if (percent > 80) return 'bg-yellow-500';
      return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="บันทึกข้อมูลการทำงาน (Timesheet)" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Timesheet', href: '/timesheet' }, { label: 'Record' }]} />
      
      <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto space-y-6">
        
        {/* Team Load Overview */}
        {teamLoad && (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">ภาพรวมภาระงาน (My Workload)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Weekly Hours: {teamLoad.currentLoad} / {teamLoad.weeklyCapacity} hrs</span>
                                <span className="font-medium">{Math.round((teamLoad.currentLoad / teamLoad.weeklyCapacity) * 100)}% Utilization</span>
                            </div>
                            <Progress value={(teamLoad.currentLoad / teamLoad.weeklyCapacity) * 100} className="h-3" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>บันทึกเวลาทำงาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Work Type Selection */}
            <div className="space-y-3">
                <Label>ประเภทงาน</Label>
                <Select 
                    value={form.workType} 
                    onValueChange={(v: WorkType) => setForm({...form, workType: v})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทงาน" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={WorkType.PROJECT}>Project</SelectItem>
                        <SelectItem value={WorkType.OFFICE}>Non-Project (Admin, Meeting, etc.)</SelectItem>
                        <SelectItem value={WorkType.LEAVE}>Leave (ลาป่วย/ลากิจ)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Main Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                
                {/* User Info (Read Only) */}
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-blue-800 text-sm flex items-center">
                    ผู้บันทึก: <span className="font-semibold ml-1">{user?.name || 'Loading...'}</span> 
                    <span className="ml-2 text-blue-600">({user?.role || 'Staff'})</span>
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="mb-1.5 block">เวลาเริ่ม</Label>
                        <Input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
                    </div>
                    <div>
                        <Label className="mb-1.5 block">เวลาสิ้นสุด</Label>
                        <Input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
                    </div>
                </div>

                {/* Date */}
                <div>
                    <Label className="mb-1.5 block">วันที่</Label>
                    <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>

                {/* Project Selection (Conditional) */}
                {form.workType === WorkType.PROJECT && (
                    <>
                        <div className="md:col-span-2">
                            <Label className="mb-1.5 block">เลือกโปรเจกต์</Label>
                            <Select value={form.projectId} onValueChange={v => setForm({...form, projectId: v, taskId: ''})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((p: any) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.code ? `[${p.code}] ` : ''}{p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Task Mode Selection */}
                        <div className="md:col-span-2">
                            <Label className="mb-1.5 block">รูปแบบกิจกรรม</Label>
                            <RadioGroup 
                                value={form.taskMode} 
                                onValueChange={(v: 'planned' | 'adhoc') => setForm({...form, taskMode: v, taskId: '', activity: ''})}
                                className="flex flex-row gap-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="planned" id="tm1" />
                                    <Label htmlFor="tm1">กิจกรรมตามแผนงาน (Tasks)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="adhoc" id="tm2" />
                                    <Label htmlFor="tm2">กิจกรรมอื่นๆ (Adhoc)</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Task Dropdown (Planned Only) */}
                        {form.taskMode === 'planned' && (
                            <div className="md:col-span-2">
                                <Label className="mb-1.5 block">เลือกงาน (Task) <span className="text-red-500">*</span></Label>
                                <Select value={form.taskId} onValueChange={v => setForm({...form, taskId: v})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Task" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projectTasks.length > 0 ? (
                                            projectTasks.map((t: any) => (
                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="_empty" disabled>ไม่มีงานในโปรเจกต์นี้</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </>
                )}

                {/* Activity Dropdown (Adhoc Only or Non-Project) */}
                {(form.workType !== WorkType.PROJECT || form.taskMode === 'adhoc') && (
                <div className="md:col-span-2">
                    <Label className="mb-1.5 block">กิจกรรม (Activity)</Label>
                    <Select value={form.activity} onValueChange={v => setForm({...form, activity: v})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Activity" />
                        </SelectTrigger>
                        <SelectContent>
                            {activities
                                .filter(a => a.workType === form.workType && a.isActive)
                                .map(a => (
                                    <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                                ))
                            }
                            {activities.filter(a => a.workType === form.workType && a.isActive).length === 0 && (
                                <SelectItem value="Other">Other</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                )}

                {/* Description */}
                <div className="md:col-span-2">
                    <Label className="mb-1.5 block">รายละเอียดงาน (เพิ่มเติม) <span className="text-red-500">*</span></Label>
                    <Textarea 
                        value={form.description} 
                        onChange={e => setForm({...form, description: e.target.value})} 
                        placeholder="อธิบายสิ่งที่ทำ..."
                        rows={3}
                    />
                </div>

                {/* Billable Toggle (Project Only) */}
                {form.workType === WorkType.PROJECT && (
                    <div className="md:col-span-2 flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="billable" 
                            checked={form.billable} 
                            onChange={e => setForm({...form, billable: e.target.checked})}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="billable" className="cursor-pointer">Billable (คิดเป็นค่าใช้จ่ายโครงการ)</Label>
                    </div>
                )}

            </div>

            <Button 
                onClick={createEntry} 
                disabled={loading}
                className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                style={{ pointerEvents: 'auto' }}
            >
                {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </Button>

          </CardContent>
        </Card>

        {/* Recent Entries Table */}
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">รายการล่าสุด (Recent Entries)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-slate-50">
                                <th className="text-left py-3 px-4 font-semibold text-slate-600">Date</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600">Type</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600">Project / Activity</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600">Hours</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((e) => (
                                <tr key={e.id} className="border-b hover:bg-slate-50">
                                    <td className="py-3 px-4">{e.date}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            e.workType === WorkType.PROJECT ? 'bg-blue-100 text-blue-700' :
                                            e.workType === WorkType.LEAVE ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {e.workType || 'Project'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-medium">{projects.find(p => p.id === e.projectId)?.name || e.description || '-'}</div>
                                        <div className="text-slate-500 text-xs truncate max-w-[200px]">{e.description}</div>
                                    </td>
                                    <td className="py-3 px-4 font-semibold">{e.hours}</td>
                                    <td className="py-3 px-4">
                                        <Button variant="ghost" size="sm" onClick={() => deleteEntry(e.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {entries.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-500">No entries found for this week.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
