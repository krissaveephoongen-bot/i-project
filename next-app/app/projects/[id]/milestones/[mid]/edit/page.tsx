'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Header from '@/app/components/Header';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/Button';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function EditMilestonePage() {
  const params = useParams() as Record<string, string | string[] | undefined> | null;
  const router = useRouter();
  const projectId = typeof params?.id === 'string' ? (params!.id as string) : Array.isArray(params?.id) ? (params!.id as string[])[0] : '';
  const mid = typeof params?.mid === 'string' ? (params!.mid as string) : Array.isArray(params?.mid) ? (params!.mid as string[])[0] : '';

  const { data, isLoading, error } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/projects/milestones?projectId=${projectId}`);
      return res.ok ? await res.json() : [];
    }
  });

  const milestone = useMemo(() => (data || []).find((m: any) => m.id === mid) || null, [data, mid]);
  const [name, setName] = useState<string>(milestone?.name || '');
  const [percentage, setPercentage] = useState<number>(milestone?.percentage || 0);
  const [status, setStatus] = useState<string>(milestone?.status || 'Pending');
  const [amount, setAmount] = useState<number>(milestone?.amount || 0);
  const [due, setDue] = useState<string>(milestone?.due_date || '');
  const [actual, setActual] = useState<string>(milestone?.actual_date || '');
  const [invoice, setInvoice] = useState<string>(milestone?.invoice_date || '');
  const [planReceived, setPlanReceived] = useState<string>(milestone?.plan_received_date || '');
  const [receipt, setReceipt] = useState<string>(milestone?.receipt_date || '');
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState<{ name: string; weight: number; startDate: string; endDate: string }>({ name: '', weight: 0, startDate: '', endDate: '' });

  useEffect(() => {
    const loadTasks = async () => {
      const res = await fetch(`${API_BASE}/api/projects/tasks?milestoneId=${mid}&projectId=${projectId}`);
      const rows = res.ok ? await res.json() : [];
      setTasks(rows || []);
    };
    if (mid) loadTasks();
  }, [mid, projectId]);

  const save = async (patch: any) => {
    const res = await fetch(`${API_BASE}/api/projects/milestones/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: mid, updatedFields: patch })
    });
    if (res.ok) router.push(`/projects/${projectId}/milestones`);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading milestone...</div>;
  }
  if (error || !milestone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">⚠️</div>
              <h3 className="text-lg font-semibold">Milestone not found</h3>
              <Button onClick={() => router.push(`/projects/${projectId}/milestones`)}>Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Edit Milestone"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: 'Milestones', href: `/projects/${projectId}/milestones` },
          { label: 'Edit' }
        ]}
      />
      <div className="container mx-auto px-6 py-8 pt-24 max-w-2xl">
        <div className="space-y-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <label className="block">
            <span className="text-sm text-slate-600">ชื่องวดงาน</span>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">เปอร์เซ็นต์</span>
            <input type="number" min="0" max="100" value={percentage} onChange={(e)=>setPercentage(parseFloat(e.target.value) || 0)} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">จำนวนเงิน</span>
            <input type="number" min="0" value={amount} onChange={(e)=>setAmount(parseFloat(e.target.value) || 0)} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">สถานะ</span>
            <select value={status} className="mt-1 w-full border rounded px-3 py-2" onChange={(e)=>setStatus(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-slate-600">วันแผนส่งมอบ (Plan Date)</span>
              <input type="date" value={due} onChange={(e)=>setDue(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-600">วันส่งมอบจริง (Actual Date)</span>
              <input type="date" value={actual} onChange={(e)=>setActual(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-600">วันวางบิล (Invoice Date)</span>
              <input type="date" value={invoice} onChange={(e)=>setInvoice(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-600">วันคาดว่าจะรับเงิน (Plan Received)</span>
              <input type="date" value={planReceived} onChange={(e)=>setPlanReceived(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-600">วันรับชำระจริง (Receipt Date)</span>
              <input type="date" value={receipt} onChange={(e)=>setReceipt(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>router.push(`/projects/${projectId}/milestones`)}>กลับ</Button>
            <Button onClick={()=>save({ name, percentage, amount, status, due_date: due, actual_date: actual, invoice_date: invoice, plan_received_date: planReceived, receipt_date: receipt })}>บันทึก</Button>
          </div>
        </div>
        <div className="mt-6 space-y-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-md font-semibold text-slate-900">งาน (Tasks) ในงวดงานนี้</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">งาน</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-slate-600">น้ำหนัก (%)</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-slate-600">เริ่ม</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-slate-600">สิ้นสุด</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-slate-600">% แผน</th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-slate-600">% จริง</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="py-2 px-3">{t.name}</td>
                  <td className="py-2 px-3 text-center">
                    <input type="number" className="w-20 text-center border rounded px-2 py-1" defaultValue={t.weight} onBlur={async (e)=>{
                      const weight = parseFloat(e.target.value) || 0;
                      await fetch(`${API_BASE}/api/projects/tasks/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: t.id, updatedFields: { weight } }) });
                    }} />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <input type="date" className="border rounded px-2 py-1" defaultValue={t.startDate || ''} onBlur={async (e)=>{
                      await fetch(`${API_BASE}/api/projects/tasks/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: t.id, updatedFields: { start_date: e.target.value } }) });
                    }} />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <input type="date" className="border rounded px-2 py-1" defaultValue={t.endDate || ''} onBlur={async (e)=>{
                      await fetch(`${API_BASE}/api/projects/tasks/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: t.id, updatedFields: { end_date: e.target.value } }) });
                    }} />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <input type="number" min="0" max="100" className="w-20 text-center border rounded px-2 py-1" defaultValue={t.progressPlan} onBlur={async (e)=>{
                      const v = parseFloat(e.target.value) || 0;
                      await fetch(`${API_BASE}/api/projects/tasks/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: t.id, updatedFields: { progress_plan: v } }) });
                    }} />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <input type="number" min="0" max="100" className="w-20 text-center border rounded px-2 py-1" defaultValue={t.progressActual} onBlur={async (e)=>{
                      const v = parseFloat(e.target.value) || 0;
                      await fetch(`${API_BASE}/api/projects/tasks/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: t.id, updatedFields: { progress_actual: v } }) });
                    }} />
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td className="py-3 px-3 text-sm text-slate-500" colSpan={6}>ยังไม่มีงานในงวดนี้</td>
                </tr>
              )}
              <tr>
                <td className="py-2 px-3">
                  <input className="w-full border rounded px-2 py-1 text-sm" placeholder="ชื่องาน" value={newTask.name} onChange={(e)=>setNewTask(prev=>({...prev, name: e.target.value}))} />
                </td>
                <td className="py-2 px-3 text-center">
                  <input type="number" className="w-20 text-center border rounded px-2 py-1" value={newTask.weight} onChange={(e)=>setNewTask(prev=>({...prev, weight: parseFloat(e.target.value) || 0}))} />
                </td>
                <td className="py-2 px-3 text-center">
                  <input type="date" className="border rounded px-2 py-1" value={newTask.startDate} onChange={(e)=>setNewTask(prev=>({...prev, startDate: e.target.value}))} />
                </td>
                <td className="py-2 px-3 text-center">
                  <input type="date" className="border rounded px-2 py-1" value={newTask.endDate} onChange={(e)=>setNewTask(prev=>({...prev, endDate: e.target.value}))} />
                </td>
                <td className="py-2 px-3 text-center" colSpan={2}>
                  <Button
                    onClick={async ()=>{
                      if (!newTask.name) return;
                      const res = await fetch(`${API_BASE}/api/projects/tasks/create`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ projectId, milestoneId: mid, name: newTask.name, weight: newTask.weight, startDate: newTask.startDate, endDate: newTask.endDate })
                      });
                      if (res.ok) {
                        const row = await res.json();
                        setTasks(prev => [...prev, row]);
                        setNewTask({ name: '', weight: 0, startDate: '', endDate: '' });
                      }
                    }}
                  >
                    เพิ่มงาน
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
