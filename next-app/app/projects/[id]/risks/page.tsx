'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
import { AlertTriangle, AlertCircle, TrendingUp, TrendingDown, Plus, Filter, X } from 'lucide-react';
import { clsx } from 'clsx';
import ProjectTabs from '@/app/components/ProjectTabs';

interface Risk {
  id: string;
  title: string;
  impact: number;
  likelihood: number;
  severity: string;
}

export default function ProjectRisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [filter, setFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');
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
    const fetchProjectAndRisks = async () => {
      try {
        setLoading(true);
        setDbProjectId(projectId);
        const res = await fetch(`${API_BASE}/api/projects/risks?projectId=${projectId}`);
        const rows = res.ok ? await res.json() : [];
        setRisks(rows || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch risks');
        console.error('Error fetching risks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndRisks();
  }, [projectId]);

  const addRisk = async () => {
    if (!dbProjectId) return;

    try {
      const payload = { project_id: dbProjectId, title: 'New Risk', impact: 3, likelihood: 3, severity: 'Medium' };
      const res = await fetch(`${API_BASE}/api/projects/risks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = res.ok ? await res.json() : null;
      if (data) setRisks(prev => [...prev, data]);
    } catch (err) {
      console.error('Error adding risk:', err);
      setError('Failed to add risk');
    }
  };
  const updateRisk = async (id: string, updatedFields: any) => {
    const res = await fetch(`${API_BASE}/api/projects/risks`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, updatedFields }) });
    if (res.ok) {
      setRisks(prev => prev.map(r => r.id === id ? { ...r, ...updatedFields } : r));
    }
  };
  const deleteRisk = async (id: string) => {
    const res = await fetch(`${API_BASE}/api/projects/risks?id=${id}`, { method: 'DELETE' });
    if (res.ok) setRisks(prev => prev.filter(r => r.id !== id));
  };

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

  const getImpactColor = (impact: number) => {
    if (impact >= 4) return 'bg-red-500';
    if (impact >= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLikelihoodColor = (likelihood: number) => {
    if (likelihood >= 4) return 'bg-red-500';
    if (likelihood >= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const filteredRisks = risks.filter(risk => {
    if (filter === 'all') return true;
    return risk.severity === filter;
  });

  const highRisks = risks.filter(r => r.severity === 'High').length;
  const mediumRisks = risks.filter(r => r.severity === 'Medium').length;
  const lowRisks = risks.filter(r => r.severity === 'Low').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading risks...</p>
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
        title="Risk Management"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: 'ERP Implementation', href: '/projects/1' },
          { label: 'Risks' }
        ]}
      />
      
      <div className="pt-20 px-6 pb-6">
        <ProjectTabs />
        {/* Risk Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{highRisks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{mediumRisks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">{lowRisks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Risks</p>
                <p className="text-2xl font-bold text-slate-900">{risks.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Risk Matrix */}
          <div className="col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Risk Matrix</h2>
            <div className="relative">
              {/* Y-axis label */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-500">
                IMPACT →
              </div>
              
              <div className="ml-4">
                {/* Matrix Grid */}
                <div className="grid grid-cols-5 gap-1">
                  {/* Y-axis (Impact 5 to 1) */}
                  {[5, 4, 3, 2, 1].map((impact) => (
                    <div key={impact} className="col-span-5 grid grid-cols-5 gap-1">
                      <div className="col-span-1 flex items-center justify-center">
                        <span className="text-xs text-slate-500">{impact}</span>
                      </div>
                      {/* Cells for each likelihood */}
                      {[1, 2, 3, 4, 5].map((likelihood) => {
                        const severity = impact * likelihood;
                        const cellRisks = risks.filter(r => r.impact === impact && r.likelihood === likelihood);
                        const cellColor = severity >= 15 ? 'bg-red-100' : severity >= 8 ? 'bg-yellow-100' : 'bg-green-100';
                        const borderColor = severity >= 15 ? 'border-red-300' : severity >= 8 ? 'border-yellow-300' : 'border-green-300';
                        
                        return (
                          <div 
                            key={`${impact}-${likelihood}`}
                            className={clsx(
                              'h-12 border rounded-lg flex items-center justify-center cursor-pointer transition-colors',
                              cellColor,
                              borderColor,
                              cellRisks.length > 0 && 'hover:ring-2 hover:ring-[#2563EB]'
                            )}
                            onClick={() => {
                              if (cellRisks.length > 0) {
                                router.push(`/projects/${projectId}/risks/${cellRisks[0].id}/edit`);
                              }
                            }}
                          >
                            <span className="text-xs font-medium text-slate-700">{cellRisks.length}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                
                {/* X-axis labels */}
                <div className="grid grid-cols-5 gap-1 ml-8 mt-2">
                  {[1, 2, 3, 4, 5].map((l) => (
                    <div key={l} className="text-center">
                      <span className="text-xs text-slate-500">{l}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-1">
                  <span className="text-xs text-slate-500">LIKELIHOOD →</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk List */}
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Risk Register</h2>
              <div className="flex items-center gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="all">All Severities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <button
                  onClick={addRisk}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Risk
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredRisks.map((risk) => (
                <div 
                  key={risk.id}
                  className={clsx(
                    'p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md',
                    risk.severity === 'High' && 'border-red-200 bg-red-50',
                    risk.severity === 'Medium' && 'border-yellow-200 bg-yellow-50',
                    risk.severity === 'Low' && 'border-green-200 bg-green-50'
                  )}
                  onClick={() => router.push(`/projects/${projectId}/risks/${risk.id}/edit`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{risk.id}</span>
                      <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', getSeverityColor(risk.severity))}>
                        {risk.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">Impact:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div 
                              key={i}
                              className={clsx('w-3 h-3 rounded-sm', i <= risk.impact ? getImpactColor(risk.impact) : 'bg-slate-200')}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">Likelihood:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div 
                              key={i}
                              className={clsx('w-3 h-3 rounded-sm', i <= risk.likelihood ? getLikelihoodColor(risk.likelihood) : 'bg-slate-200')}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <input className="font-medium text-slate-900 border rounded px-2 py-1" defaultValue={risk.title} onBlur={(e)=>updateRisk(risk.id, { title: e.target.value })} />
                    <div className="flex gap-2">
                      <button onClick={()=>router.push(`/projects/${projectId}/risks/${risk.id}/edit`)} className="px-3 py-1 bg-[#2563EB] text-white rounded text-xs">แก้ไข</button>
                      <button onClick={()=>setDeleteConfirmId(risk.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editing moved to dedicated page */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">ยืนยันการลบความเสี่ยง</h3>
                <p className="text-sm text-slate-600 mt-1">คุณต้องการลบรายการนี้หรือไม่</p>
              </div>
              <div className="p-4 flex justify-end gap-2">
                <button onClick={()=>setDeleteConfirmId(null)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">ยกเลิก</button>
                <button onClick={async ()=>{ await deleteRisk(deleteConfirmId!); setDeleteConfirmId(null); }} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm">ลบ</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
