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
import { getDashboardProjects } from '../../lib/data-service';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function TimesheetRecordPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [form, setForm] = useState<{
    workType: 'Project' | 'Non-Project' | 'Leave';
    project_id: string;
    task_id?: string;
    date: string;
    startTime: string;
    endTime: string;
    hours: number;
    activity: string;
    description: string;
    billable: boolean;
  }>({
    workType: 'Project',
    project_id: '',
    task_id: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '18:00',
    hours: 8,
    activity: '',
    description: '',
    billable: true,
  });
  const [entries, setEntries] = useState<any[]>([]);
  const [teamLoad, setTeamLoad] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      
      // Load Projects (Using data-service for reliability)
      try {
        const projs = await getDashboardProjects();
        setProjects(projs || []);
      } catch (e) {
        console.error('Failed to load projects', e);
      }

      // Load Entries
      const start = new Date(); start.setDate(start.getDate() - 7);
      const resE = await fetch(`${API_BASE}/api/timesheet/entries?userId=${user.id}&start=${start.toISOString().slice(0,10)}&end=${new Date().toISOString().slice(0,10)}`);
      const ejson = resE.ok ? await resE.json() : [];
      setEntries(ejson || []);

      // Load Team Load (Mock for now, real implementation would need backend support)
      // Simulating team load data
      setTeamLoad({
        weeklyCapacity: 40,
        currentLoad: ejson.reduce((acc: number, cur: any) => acc + (Number(cur.hours) || 0), 0),
        utilization: 0
      });
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
    if (form.workType === 'Project' && !form.project_id) {
        alert('Please select a project');
        return;
    }
    if (!form.description) {
        alert('Please enter description');
        return;
    }

    const payload = {
      user_id: user.id,
      project_id: form.workType === 'Project' ? form.project_id : null,
      task_id: form.workType === 'Project' ? form.task_id : null,
      date: form.date,
      hours: form.hours,
      start_time: form.startTime,
      end_time: form.endTime,
      activity_type: form.workType, // Project, Non-Project, Leave
      activity_name: form.activity,
      description: form.description,
      billable: form.workType === 'Project' ? form.billable : false
    };

    const res = await fetch(`${API_BASE}/api/timesheet/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const row = res.ok ? await res.json() : null;
    if (row) {
        setEntries(prev => [row, ...prev]);
        // Reset form slightly
        setForm(prev => ({ ...prev, description: '', activity: '' }));
    } else {
        alert('Failed to save entry');
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const res = await fetch(`${API_BASE}/api/timesheet/entries?id=${id}`, { method: 'DELETE' });
    if (res.ok) setEntries(prev => prev.filter(e => e.id !== id));
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
                <RadioGroup 
                    defaultValue="Project" 
                    value={form.workType} 
                    onValueChange={(v: any) => setForm({...form, workType: v})}
                    className="flex flex-row gap-6"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Project" id="r1" />
                        <Label htmlFor="r1">Project</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Non-Project" id="r2" />
                        <Label htmlFor="r2">Non-Project (Admin, Meeting, etc.)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Leave" id="r3" />
                        <Label htmlFor="r3">Leave (ลาป่วย/ลากิจ)</Label>
                    </div>
                </RadioGroup>
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
                {form.workType === 'Project' && (
                    <div className="md:col-span-2">
                        <Label className="mb-1.5 block">เลือกโปรเจกต์</Label>
                        <Select value={form.project_id} onValueChange={v => setForm({...form, project_id: v})}>
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
                )}

                {/* Activity Dropdown */}
                <div className="md:col-span-2">
                    <Label className="mb-1.5 block">กิจกรรม (Activity)</Label>
                    <Select value={form.activity} onValueChange={v => setForm({...form, activity: v})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Activity" />
                        </SelectTrigger>
                        <SelectContent>
                            {form.workType === 'Project' ? (
                                <>
                                    <SelectItem value="Development">Development</SelectItem>
                                    <SelectItem value="Design">Design</SelectItem>
                                    <SelectItem value="Testing">Testing</SelectItem>
                                    <SelectItem value="Deployment">Deployment</SelectItem>
                                    <SelectItem value="Meeting">Meeting</SelectItem>
                                </>
                            ) : form.workType === 'Non-Project' ? (
                                <>
                                    <SelectItem value="Internal Meeting">Internal Meeting</SelectItem>
                                    <SelectItem value="Training">Training</SelectItem>
                                    <SelectItem value="Admin">Admin Tasks</SelectItem>
                                </>
                            ) : (
                                <>
                                    <SelectItem value="Sick Leave">Sick Leave (ลาป่วย)</SelectItem>
                                    <SelectItem value="Personal Leave">Personal Leave (ลากิจ)</SelectItem>
                                    <SelectItem value="Annual Leave">Annual Leave (ลาพักร้อน)</SelectItem>
                                </>
                            )}
                        </SelectContent>
                    </Select>
                </div>

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
                {form.workType === 'Project' && (
                    <div className="md:col-span-2 flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="billable" 
                            checked={form.billable} 
                            onChange={e => setForm({...form, billable: e.target.checked})}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="billable" className="cursor-pointer">Billable (คิดเงินลูกค้าได้)</Label>
                    </div>
                )}

            </div>

            <Button onClick={createEntry} className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white">
                บันทึกข้อมูล
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
                                            e.activity_type === 'Project' ? 'bg-blue-100 text-blue-700' :
                                            e.activity_type === 'Leave' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {e.activity_type || 'Project'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-medium">{projects.find(p => p.id === e.project_id)?.name || e.activity_name || '-'}</div>
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