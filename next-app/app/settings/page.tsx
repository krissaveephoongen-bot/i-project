 'use client';
 
 import { useEffect, useState } from 'react';
 import Header from '@/app/components/Header';
 import { useAuth } from '@/app/components/AuthProvider';
 
 export default function SettingsPage() {
   const { user } = useAuth() || {};
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [msg, setMsg] = useState('');
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
        const id = user?.id || '';
        const email = (user as any)?.email || '';
        const param = id ? `userId=${encodeURIComponent(id)}` : (email ? `email=${encodeURIComponent(email)}` : '');
        if (!param) return setLoading(false);
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
       setMsg('');
       const updates: any = {
         name: form.name,
         email: form.email,
         phone: form.phone,
         department: form.department,
         position: form.position,
         timezone: form.timezone,
         hourlyRate: Number(form.hourlyRate || 0),
       };
       if (form.role) updates.role = form.role;
       const res = await fetch(`/api/users/profile`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ userId: user?.id, updates })
       });
       const json = await res.json();
       setMsg(json?.message || 'Saved');
     } catch {
       setMsg('Save failed');
     } finally {
       setSaving(false);
     }
   };
 
   return (
     <div className="min-h-screen">
       <Header title="Settings" breadcrumbs={[{ label: 'Settings' }]} />
       <div className="pt-20 px-6 pb-6">
         <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           {loading ? (
             <div className="text-sm text-slate-500">Loading...</div>
           ) : (
             <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={(user as any)?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&background=0284c7&color=fff`}
                  className="w-12 h-12 rounded-full"
                  alt="Avatar"
                />
                <div className="text-xs text-slate-600">Avatar ใช้จากโปรไฟล์โดยอัตโนมัติ</div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs text-slate-600 mb-1">Name</label>
                   <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                 </div>
                 <div>
                   <label className="block text-xs text-slate-600 mb-1">ชื่อภาษาไทย</label>
                   <input value={form.name_th} onChange={e => setForm({ ...form, name_th: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                 </div>
                 <div>
                   <label className="block text-xs text-slate-600 mb-1">Email</label>
                   <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                 </div>
                 <div>
                   <label className="block text-xs text-slate-600 mb-1">Phone</label>
                   <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                 </div>
                 <div>
                   <label className="block text-xs text-slate-600 mb-1">Department</label>
                   <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                 </div>
                 <div>
                   <label className="block text-xs text-slate-600 mb-1">Position</label>
                   <input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                 </div>
                 <div>
                   <label className="block text-xs text-slate-600 mb-1">Timezone</label>
                   <select value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                     <option value="Asia/Bangkok">Asia/Bangkok</option>
                     <option value="UTC">UTC</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs text-slate-600 mb-1">Hourly Rate</label>
                   <input value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                 </div>
                 <div>
                   <label className="block text-xs text-slate-600 mb-1">Employee Code</label>
                   <input value={form.employeeCode} onChange={e => setForm({ ...form, employeeCode: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                 </div>
                 <div>
                   <label className="block text-xs text-slate-600 mb-1">Role</label>
                   <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                     <option value="">-</option>
                     <option value="admin">admin</option>
                     <option value="manager">manager</option>
                     <option value="employee">employee</option>
                   </select>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">{saving ? 'Saving...' : 'Save'}</button>
                 {!!msg && <span className="text-sm text-slate-600">{msg}</span>}
               </div>
             </div>
           )}
         </div>
       </div>
     </div>
   );
 }
