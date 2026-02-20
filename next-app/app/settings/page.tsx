'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import { useAuth } from '@/app/components/AuthProvider';
import PageTransition from '@/app/components/PageTransition';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { User, Save, Building, Phone, Mail, Clock, CreditCard, BadgeCheck, Calendar, DollarSign, Briefcase, CheckCircle, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth() || {};
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState('all'); // all, this_month, last_month, this_year
  
  const [form, setForm] = useState({
    name: '',
    name_th: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    timezone: 'Asia/Bangkok',
    hourlyRate: '',
    employeeCode: '',
    role: ''
  });

  const getFilterDates = (filterType: string) => {
    const now = new Date();
    let start = '';
    let end = '';

    if (filterType === 'this_month') {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        start = firstDay.toISOString().split('T')[0];
        end = lastDay.toISOString().split('T')[0];
    } else if (filterType === 'last_month') {
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        start = firstDay.toISOString().split('T')[0];
        end = lastDay.toISOString().split('T')[0];
    } else if (filterType === 'this_year') {
        const firstDay = new Date(now.getFullYear(), 0, 1);
        const lastDay = new Date(now.getFullYear(), 11, 31);
        start = firstDay.toISOString().split('T')[0];
        end = lastDay.toISOString().split('T')[0];
    }
    return { start, end };
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const id = user?.id || '';
      const email = (user as any)?.email || '';
      let param = id ? `userId=${encodeURIComponent(id)}` : (email ? `email=${encodeURIComponent(email)}` : '');
      
      if (!param) {
          setLoading(false);
          return;
      }

      // Add filter params
      const { start, end } = getFilterDates(filter);
      if (start) param += `&startDate=${start}`;
      if (end) param += `&endDate=${end}`;

      const res = await fetch(`/api/users/profile?${param}`, { cache: 'no-store' });
      const json = await res.json();
      const p = json?.profile || {};
      
      setForm({
        name: p.name || '',
        name_th: p.name_th || '',
        email: p.email || '',
        phone: p.phone || '',
        department: p.department || '',
        position: p.position || '',
        timezone: p.timezone || 'Asia/Bangkok',
        hourlyRate: String(p.hourlyRate || ''),
        employeeCode: p.employeeCode || '',
        role: p.role || ''
      });
      setStats(json?.stats || {});
    } catch (e) {
      console.error(e);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, filter]);

  const save = async () => {
    try {
      setSaving(true);
      const updates: any = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        department: form.department,
        position: form.position,
        timezone: form.timezone,
        hourlyRate: Number(form.hourlyRate || 0),
        name_th: form.name_th
      };
      if (form.role) updates.role = form.role;
      const res = await fetch(`/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, updates })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Save failed');
      toast.success('บันทึกข้อมูลเรียบร้อย');
    } catch (e: any) {
      toast.error(e?.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !stats) return (
    <div className="min-h-screen bg-slate-50/50">
      <Header title="กำลังโหลด..." breadcrumbs={[{ label: 'ตั้งค่า' }]} />
      <div className="pt-24 px-6 pb-6 container mx-auto max-w-4xl">
         <Card>
            <CardHeader className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header title="โปรไฟล์และการตั้งค่า" breadcrumbs={[{ label: 'แดชบอร์ด', href: '/' }, { label: 'โปรไฟล์' }]} />
        
        <div className="pt-24 px-6 pb-6 container mx-auto max-w-5xl">
          
          <Tabs defaultValue="overview" className="space-y-6">
            <div className="flex justify-between items-center">
                <TabsList>
                    <TabsTrigger value="overview">ภาพรวม (Overview)</TabsTrigger>
                    <TabsTrigger value="edit">แก้ไขข้อมูล (Edit Profile)</TabsTrigger>
                </TabsList>
                
                {/* Filter for Overview Tab */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[180px] h-9">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทั้งหมด (All Time)</SelectItem>
                            <SelectItem value="this_month">เดือนนี้ (This Month)</SelectItem>
                            <SelectItem value="last_month">เดือนที่แล้ว (Last Month)</SelectItem>
                            <SelectItem value="this_year">ปีนี้ (This Year)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <TabsContent value="overview" className="space-y-6">
                {/* Profile Header Card */}
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative">
                                <img
                                    src={(user as any)?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&background=2563EB&color=fff&size=128`}
                                    className="w-24 h-24 rounded-full shadow-md border-4 border-white ring-1 ring-slate-100 object-cover"
                                    alt="Avatar"
                                />
                                <div className={`absolute bottom-1 right-1 w-5 h-5 border-2 border-white rounded-full ${(user as any)?.is_active !== false ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                            </div>
                            <div className="text-center md:text-left space-y-1 flex-1">
                                <h2 className="text-2xl font-bold text-slate-900">{form.name}</h2>
                                <p className="text-slate-500 font-medium">{form.position || 'No Position'} • {form.department || 'No Department'}</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                                    <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                        <Mail className="w-3.5 h-3.5" /> {form.email}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                        <Phone className="w-3.5 h-3.5" /> {form.phone || '-'}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                        <Building className="w-3.5 h-3.5" /> {form.employeeCode || '-'}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right hidden md:block">
                                <div className="text-sm text-slate-400 mb-1">Current Role</div>
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                                    {form.role || 'Employee'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.activeProjects || 0} active projects
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.completedTasks || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                out of {stats?.totalTasks || 0} total tasks
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalHours?.toFixed(1) || '0.0'}</div>
                            <p className="text-xs text-muted-foreground">
                                hours logged {filter !== 'all' ? 'in this period' : 'all time'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">฿{stats?.totalEarnings?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-muted-foreground">
                                estimated based on hourly rate
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="edit">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-800">แก้ไขข้อมูลส่วนตัว</CardTitle>
                    <CardDescription>จัดการข้อมูลส่วนตัวและรายละเอียดการติดต่อของคุณ</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="space-y-8">
                        
                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                            <User className="w-4 h-4 text-slate-400" /> ชื่อ (ภาษาอังกฤษ)
                            </label>
                            <Input 
                            value={form.name} 
                            onChange={e => setForm({ ...form, name: e.target.value })} 
                            placeholder="John Doe"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                            <User className="w-4 h-4 text-slate-400" /> ชื่อ (ภาษาไทย)
                            </label>
                            <Input 
                            value={form.name_th} 
                            onChange={e => setForm({ ...form, name_th: e.target.value })} 
                            placeholder="สมชาย ใจดี"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                            <Mail className="w-4 h-4 text-slate-400" /> อีเมล
                            </label>
                            <Input 
                            value={form.email} 
                            onChange={e => setForm({ ...form, email: e.target.value })} 
                            placeholder="email@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                            <Phone className="w-4 h-4 text-slate-400" /> เบอร์โทรศัพท์
                            </label>
                            <Input 
                            value={form.phone} 
                            onChange={e => setForm({ ...form, phone: e.target.value })} 
                            placeholder="08x-xxx-xxxx"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                            <Building className="w-4 h-4 text-slate-400" /> แผนก
                            </label>
                            <Input 
                            value={form.department} 
                            onChange={e => setForm({ ...form, department: e.target.value })} 
                            placeholder="IT, HR, Sales..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                            <BadgeCheck className="w-4 h-4 text-slate-400" /> ตำแหน่ง
                            </label>
                            <Input 
                            value={form.position} 
                            onChange={e => setForm({ ...form, position: e.target.value })} 
                            placeholder="Manager, Engineer..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                            <Clock className="w-4 h-4 text-slate-400" /> โซนเวลา
                            </label>
                            <Select value={form.timezone} onValueChange={(val) => setForm({ ...form, timezone: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกโซนเวลา" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                                <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                            <CreditCard className="w-4 h-4 text-slate-400" /> อัตราค่าแรงต่อชั่วโมง
                            </label>
                            <Input 
                            value={form.hourlyRate} 
                            onChange={e => setForm({ ...form, hourlyRate: e.target.value })} 
                            placeholder="0.00"
                            type="number"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                            รหัสพนักงาน
                            </label>
                            <Input 
                            value={form.employeeCode} 
                            onChange={e => setForm({ ...form, employeeCode: e.target.value })} 
                            placeholder="EMP-001"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                            บทบาท
                            </label>
                            <Select value={form.role} onValueChange={(val) => setForm({ ...form, role: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกบทบาท" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">ผู้ดูแลระบบ (Admin)</SelectItem>
                                <SelectItem value="manager">ผู้จัดการ (Manager)</SelectItem>
                                <SelectItem value="employee">พนักงาน (Employee)</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                        <Button 
                            onClick={save} 
                            disabled={saving} 
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                        >
                            {saving ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    กำลังบันทึก...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    บันทึก
                                </>
                            )}
                        </Button>
                        </div>
                    </div>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
}
