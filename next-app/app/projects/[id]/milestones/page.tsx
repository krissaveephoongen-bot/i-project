'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
import { Calendar, CheckCircle2, Clock, DollarSign, Flag, Plus, X, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import ProjectTabs from '@/app/components/ProjectTabs';

interface Milestone {
  id: string;
  name: string;
  percentage: number;
  amount?: number;
  status: string;
  due_date?: string | null;
  actual_date?: string | null;
  invoice_date?: string | null;
  plan_received_date?: string | null;
  receipt_date?: string | null;
  conditions: boolean[];
}

export default function ProjectMilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [view, setView] = useState<'timeline' | 'list'>('timeline');
  const [dbProjectId, setDbProjectId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const params = useParams() as Record<string, string | string[] | undefined> | null;
  const projectId =
    typeof params?.id === 'string'
      ? params!.id
      : Array.isArray(params?.id)
      ? (params!.id as string[])[0]
      : '';
  const router = useRouter();

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/projects/milestones?projectId=${projectId}`);
        if (!res.ok) throw new Error('fetch failed');
        const rows = await res.json();
        setDbProjectId(projectId);
        const mapped = (rows || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          percentage: Number(r.percentage || 0),
          amount: r.amount != null ? Number(r.amount) : undefined,
          status: r.status || 'Pending',
          due_date: r.due_date || null,
          actual_date: r.actual_date || null,
          invoice_date: r.invoice_date || null,
          plan_received_date: r.plan_received_date || null,
          receipt_date: r.receipt_date || null,
          conditions: [],
        }));
        setMilestones(mapped);
        setError(null);
      } catch (err) {
        setError('Failed to fetch milestones');
        console.error('Error fetching milestones:', err);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchMilestones();
  }, [projectId]);

  const addMilestone = async () => {
    setMilestones(prev => [...prev, { id: crypto.randomUUID(), name: 'New Milestone', percentage: 10, status: 'Pending', conditions: [] }]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Pending':
        return <Flag className="w-5 h-5 text-slate-400" />;
      default:
        return <Flag className="w-5 h-5 text-slate-400" />;
    }
  };

  const totalAmount = milestones.reduce((sum, m) => {
    if (m.amount != null) return sum + Number(m.amount || 0);
    return sum + (Number(m.percentage || 0) / 100) * 32000000;
  }, 0);
  const paidAmount = milestones
    .filter(m => m.status === 'Paid')
    .reduce((sum, m) => sum + (m.percentage / 100) * totalAmount, 0);
  const progressAmount = milestones
    .filter(m => m.status === 'In Progress')
    .reduce((sum, m) => sum + (m.percentage / 100) * totalAmount, 0);
  const pendingAmount = totalAmount - paidAmount - progressAmount;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading milestones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Milestones & Payments"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: 'ERP Implementation', href: '/projects/1' },
          { label: 'Milestones' }
        ]}
      />
      
      <div className="pt-20 px-6 pb-6">
        <ProjectTabs />
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Budget</p>
                <p className="text-lg font-bold text-slate-900">฿{totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Paid</p>
                <p className="text-lg font-bold text-green-600">฿{paidAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">In Progress</p>
                <p className="text-lg font-bold text-blue-600">฿{progressAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Flag className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-lg font-bold text-slate-600">฿{pendingAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('timeline')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                view === 'timeline' ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              Timeline View
            </button>
            <button
              onClick={() => setView('list')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                view === 'list' ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              List View
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const header = ['Milestone','%','Amount','Status'];
                const lines = [header.join(','), ...milestones.map(m => [m.name, m.percentage, ((m.percentage/100)*totalAmount), m.status].join(','))];
                const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'milestones.csv'; a.click(); window.URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Export CSV
            </button>
            <button
              onClick={() => {
                const header = ['Milestone','%','Amount','Status'];
                const table = [
                  '<table>',
                  `<tr>${header.map(h => `<th>${h}</th>`).join('')}</tr>`,
                  ...milestones.map(m => `<tr><td>${m.name}</td><td>${m.percentage}</td><td>${((m.percentage/100)*totalAmount)}</td><td>${m.status}</td></tr>`),
                  '</table>'
                ].join('');
                const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'milestones.xls'; a.click(); window.URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Export Excel
            </button>
          </div>
          <button
          onClick={async () => {
            const res = await fetch(`${API_BASE}/api/projects/milestones/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ projectId, name: 'New Milestone', percentage: 10, status: 'Pending' }),
            });
            if (res.ok) {
              const row = await res.json();
              setMilestones(prev => [...prev, { id: row.id, name: row.name, percentage: row.percentage, status: row.status, conditions: [] }]);
            }
          }}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Milestone
          </button>
        </div>

        {view === 'timeline' ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="relative flex items-start gap-6">
                    <div className={clsx(
                      'relative z-10 w-12 h-12 rounded-full flex items-center justify-center',
                      milestone.status === 'Paid' ? 'bg-green-100' :
                      milestone.status === 'In Progress' ? 'bg-blue-100' : 'bg-slate-100'
                    )}>
                      {getStatusIcon(milestone.status)}
                    </div>
                    <div className={clsx(
                      'flex-1 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                      milestone.status === 'Paid' ? 'border-green-200 bg-green-50' :
                      milestone.status === 'In Progress' ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'
                    )} onClick={() => router.push(`/projects/${projectId}/milestones/${milestone.id}/edit`)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', getStatusColor(milestone.status))}>
                            {milestone.status}
                          </span>
                          <span className="text-sm font-medium text-slate-900">{milestone.name}</span>
                        </div>
                        <span className="text-lg font-bold text-slate-900">
                          ฿{((milestone.percentage / 100) * totalAmount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span>{milestone.percentage}% of contract value</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Due: Q{(index + 1) * 2} 2024
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Milestone</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">%</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Amount</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {milestones.map((milestone) => (
                  <tr key={milestone.id} className="hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(milestone.status)}
                        <input
                          className="text-sm font-medium text-slate-900 border rounded px-2 py-1"
                          defaultValue={milestone.name}
                          onBlur={async (e) => {
                            const name = e.target.value;
                            const res = await fetch(`${API_BASE}/api/projects/milestones/update`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: milestone.id, updatedFields: { name } }),
                            });
                            if (res.ok) {
                              setMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, name } : m));
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-slate-600">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-20 text-center border rounded px-2 py-1"
                        defaultValue={milestone.percentage}
                        onBlur={async (e) => {
                          const percentage = parseFloat(e.target.value) || 0;
                          const res = await fetch(`${API_BASE}/api/projects/milestones/update`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: milestone.id, updatedFields: { percentage } }),
                          });
                          if (res.ok) {
                            setMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, percentage } : m));
                          }
                        }}
                      />
                    </td>
                    <td className="py-4 px-4 text-center text-sm font-medium text-slate-900">
                      ฿{((milestone.percentage / 100) * totalAmount).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <select
                        className="px-2 py-1 rounded text-xs font-medium border"
                        defaultValue={milestone.status}
                        onChange={async (e) => {
                          const status = e.target.value;
                          const res = await fetch(`${API_BASE}/api/projects/milestones/update`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: milestone.id, updatedFields: { status } }),
                          });
                          if (res.ok) {
                            setMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, status } : m));
                          }
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Approved">Approved</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button onClick={() => router.push(`/projects/${projectId}/milestones/${milestone.id}/edit`)} className="px-3 py-1 bg-[#2563EB] text-white rounded text-xs">
                        แก้ไข
                      </button>
                      <button
                        onClick={async () => {
                          const res = await fetch(`${API_BASE}/api/projects/milestones/update`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: milestone.id, updatedFields: { status: 'Approved' } }),
                          });
                          if (res.ok) setMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, status: 'Approved' } : m));
                        }}
                        className="ml-2 text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={async () => {
                          const res = await fetch(`${API_BASE}/api/projects/milestones/update`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: milestone.id, updatedFields: { status: 'Paid' } }),
                          });
                          if (res.ok) setMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, status: 'Paid' } : m));
                        }}
                        className="ml-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark Paid
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(milestone.id)}
                        className="ml-2 text-sm text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Editing moved to dedicated page */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">ยืนยันการลบงวดงาน</h3>
                <p className="text-sm text-slate-600 mt-1">คุณต้องการลบรายการนี้หรือไม่</p>
              </div>
              <div className="p-4 flex justify-end gap-2">
                <button onClick={()=>setDeleteConfirmId(null)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">ยกเลิก</button>
                <button
                  onClick={async ()=> {
                    const res = await fetch(`${API_BASE}/api/projects/milestones/delete`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: deleteConfirmId }),
                    });
                    if (res.ok) setMilestones(prev => prev.filter(m => m.id !== deleteConfirmId));
                    setDeleteConfirmId(null);
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
