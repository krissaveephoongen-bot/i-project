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
import { User, Save, Building, Phone, Mail, Clock, CreditCard, BadgeCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth() || {};
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const id = user?.id || '';
        const email = (user as any)?.email || '';
        const param = id ? `userId=${encodeURIComponent(id)}` : (email ? `email=${encodeURIComponent(email)}` : '');
        if (!param) {
            setLoading(false);
            return;
        }
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
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

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

  if (loading) return (
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
        <Header title="ตั้งค่า" breadcrumbs={[{ label: 'แดชบอร์ด', href: '/' }, { label: 'ตั้งค่า' }]} />
        
        <div className="pt-24 px-6 pb-6 container mx-auto max-w-4xl">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800">ข้อมูลส่วนตัว</CardTitle>
              <CardDescription>จัดการข้อมูลส่วนตัวและรายละเอียดการติดต่อของคุณ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                
                {/* Avatar Section */}
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                  <div className="relative">
                    <img
                      src={(user as any)?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&background=2563EB&color=fff&size=128`}
                      className="w-20 h-20 rounded-full shadow-md border-2 border-white ring-2 ring-slate-100"
                      alt="Avatar"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{form.name || 'ผู้ใช้งาน'}</h3>
                    <p className="text-sm text-slate-500 mt-1">รูปโปรไฟล์ถูกสร้างอัตโนมัติจากชื่อของคุณ</p>
                  </div>
                </div>

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
        </div>
      </div>
    </PageTransition>
  );
}
