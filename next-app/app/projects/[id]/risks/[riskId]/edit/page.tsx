'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Header from '@/app/components/Header';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/Button';
import { clsx } from 'clsx';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function EditRiskPage() {
  const params = useParams() as Record<string, string | string[] | undefined> | null;
  const router = useRouter();
  const projectId = typeof params?.id === 'string' ? (params!.id as string) : Array.isArray(params?.id) ? (params!.id as string[])[0] : '';
  const riskId = typeof params?.riskId === 'string' ? (params!.riskId as string) : Array.isArray(params?.riskId) ? (params!.riskId as string[])[0] : '';

  const { data, isLoading, error } = useQuery({
    queryKey: ['risks', projectId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/projects/risks?projectId=${projectId}`);
      return res.ok ? await res.json() : [];
    }
  });

  const risk = useMemo(() => (data || []).find((r: any) => r.id === riskId) || null, [data, riskId]);
  const [title, setTitle] = useState<string>(risk?.name || risk?.title || '');
  const [severity, setSeverity] = useState<string>(risk?.severity || 'Medium');
  const [status, setStatus] = useState<string>(risk?.status || 'Open');

  const save = async (patch: any) => {
    const res = await fetch(`${API_BASE}/api/projects/risks/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: riskId, updatedFields: patch })
    });
    if (res.ok) router.push(`/projects/${projectId}/risks`);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading risk...</div>;
  }
  if (error || !risk) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">⚠️</div>
              <h3 className="text-lg font-semibold">Risk not found</h3>
              <Button onClick={() => router.push(`/projects/${projectId}/risks`)}>Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Edit Risk"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: 'Risks', href: `/projects/${projectId}/risks` },
          { label: 'Edit' }
        ]}
      />
      <div className="container mx-auto px-6 py-8 pt-24 max-w-2xl">
        <div className="space-y-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2">
            <span className={clsx('px-3 py-1 rounded text-sm font-medium', getSeverityColor(severity))}>{severity}</span>
          </div>
          <label className="block">
            <span className="text-sm text-slate-600">หัวข้อ</span>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">ความรุนแรง</span>
            <select value={severity} className="mt-1 w-full border rounded px-3 py-2" onChange={(e)=>setSeverity(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">สถานะ</span>
            <select value={status} className="mt-1 w-full border rounded px-3 py-2" onChange={(e)=>setStatus(e.target.value)}>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>router.push(`/projects/${projectId}/risks`)}>กลับ</Button>
            <Button onClick={()=>save({ title, severity, status })}>บันทึก</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
