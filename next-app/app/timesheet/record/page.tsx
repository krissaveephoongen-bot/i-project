 'use client';
 
 import { useEffect, useState } from 'react';
 import Header from '../../components/Header';
 import { useAuth } from '../../components/AuthProvider';
 
 const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
 
 export default function TimesheetRecordPage() {
   const { user } = useAuth();
   const [projects, setProjects] = useState<any[]>([]);
   const [form, setForm] = useState<{ project_id: string; task_id?: string; date: string; hours: number }>({
     project_id: '',
     task_id: '',
     date: new Date().toISOString().slice(0, 10),
     hours: 1,
   });
   const [entries, setEntries] = useState<any[]>([]);
 
   useEffect(() => {
     const load = async () => {
       if (!user) return;
       const resP = await fetch(`${API_BASE}/api/timesheet/projects?userId=${user.id}`);
       const pjson = resP.ok ? await resP.json() : [];
       setProjects(pjson || []);
       const start = new Date(); start.setDate(start.getDate() - 7);
       const resE = await fetch(`${API_BASE}/api/timesheet/entries?userId=${user.id}&start=${start.toISOString().slice(0,10)}&end=${new Date().toISOString().slice(0,10)}`);
       const ejson = resE.ok ? await resE.json() : [];
       setEntries(ejson || []);
     };
     load();
   }, [user]);
 
   const createEntry = async () => {
     if (!user) return;
     const res = await fetch(`${API_BASE}/api/timesheet/entries`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ user_id: user.id, ...form }),
     });
     const row = res.ok ? await res.json() : null;
     if (row) setEntries(prev => [row, ...prev]);
   };
 
   const updateEntry = async (id: string, patch: any) => {
     const res = await fetch(`${API_BASE}/api/timesheet/entries`, {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ id, ...patch }),
     });
     if (res.ok) {
       const row = await res.json();
       setEntries(prev => prev.map(e => e.id === id ? row : e));
     }
   };
 
   const deleteEntry = async (id: string) => {
     const res = await fetch(`${API_BASE}/api/timesheet/entries?id=${id}`, { method: 'DELETE' });
     if (res.ok) setEntries(prev => prev.filter(e => e.id !== id));
   };
 
   return (
     <div className="min-h-screen">
       <Header title="Record Timesheet" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Timesheet', href: '/timesheet' }, { label: 'Record' }]} />
       <div className="pt-20 px-6 pb-6 max-w-4xl mx-auto">
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
               <select className="w-full border rounded px-3 py-2 text-sm" value={form.project_id} onChange={e => setForm(prev => ({ ...prev, project_id: e.target.value }))}>
                 <option value="">Select</option>
                 {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Task</label>
               <select className="w-full border rounded px-3 py-2 text-sm" value={form.task_id} onChange={e => setForm(prev => ({ ...prev, task_id: e.target.value }))}>
                 <option value="">Select</option>
                 {(projects.find((p:any)=>p.id===form.project_id)?.tasks || []).map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
               <input type="date" className="w-full border rounded px-3 py-2 text-sm" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Hours</label>
               <input type="number" min={0} max={24} className="w-full border rounded px-3 py-2 text-sm" value={form.hours} onChange={e => setForm(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))} />
             </div>
           </div>
           <div className="mt-4 flex justify-end">
             <button onClick={createEntry} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Save Entry</button>
           </div>
         </div>
 
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <h3 className="text-lg font-semibold text-slate-900 mb-3">Recent Entries</h3>
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead>
                 <tr className="border-b border-slate-200">
                   <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Project</th>
                   <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Task</th>
                   <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Date</th>
                   <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Hours</th>
                   <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {entries.map(e => (
                   <tr key={e.id} className="border-b border-slate-100">
                     <td className="py-2 px-3 text-sm">{projects.find((p:any)=>p.id===e.project_id)?.name || e.project_id}</td>
                     <td className="py-2 px-3 text-sm">{(projects.find((p:any)=>p.id===e.project_id)?.tasks || []).find((t:any)=>t.id===e.task_id)?.name || e.task_id || '-'}</td>
                     <td className="py-2 px-3 text-sm">{e.date}</td>
                     <td className="py-2 px-3 text-sm">
                       <input type="number" min={0} max={24} defaultValue={e.hours || 0} className="w-20 border rounded px-2 py-1 text-sm"
                         onBlur={(ev) => updateEntry(e.id, { hours: parseFloat((ev.target as HTMLInputElement).value) || 0 })}
                       />
                     </td>
                     <td className="py-2 px-3 text-sm">
                       <button onClick={() => deleteEntry(e.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs">Delete</button>
                     </td>
                   </tr>
                 ))}
                 {entries.length === 0 && (
                   <tr><td className="py-3 px-3 text-sm text-slate-500" colSpan={5}>No entries</td></tr>
                 )}
               </tbody>
             </table>
           </div>
         </div>
       </div>
     </div>
   );
 }
