'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/app/components/Header';
import Link from 'next/link';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Briefcase, 
  PieChart, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Calendar,
  Download,
  Folder
} from 'lucide-react';

export default function UnifiedDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/projects/', { cache: 'no-store' });
        const list = res.ok ? await res.json() : [];
        setProjects(list || []);
        const aggregated: any[] = [];
        for (const p of (list || [])) {
          try {
            const ov = await fetch(`/api/projects/overview/${p.id}`, { cache: 'no-store' });
            const overview = ov.ok ? await ov.json() : {};
            const ss = await fetch(`/api/projects/progress/snapshot?projectId=${p.id}`, { cache: 'no-store' });
            const snap = ss.ok ? await ss.json() : { points: [] };
            const last = (snap.points || []).slice(-1)[0] || {};
            const risks = overview?.risks || [];
            const riskCounts = {
              high: risks.filter((r: any) => (r.severity || '').toLowerCase() === 'high').length,
              medium: risks.filter((r: any) => (r.severity || '').toLowerCase() === 'medium').length,
              low: risks.filter((r: any) => (r.severity || '').toLowerCase() === 'low').length,
            };
            const milestones = overview?.milestones || [];
            const today = new Date();
            const overdueMilestones = milestones.filter((m: any) => {
              const d = m.due_date || m.dueDate;
              const status = String(m.status || '').toLowerCase();
              if (!d) return false;
              const dt = new Date(d);
              return dt < today && !['paid', 'approved', 'completed'].includes(status);
            }).length;
            aggregated.push({
              id: p.id,
              name: p.name,
              status: p.status || 'Active',
              progress: Number(overview?.project?.progress ?? p.progress ?? 0),
              spi: Number(last?.spi ?? 1),
              budget: Number(overview?.summary?.totalBudget ?? p.budget ?? 0),
              committed: Number(overview?.summary?.committedCost ?? 0),
              actual: Number(overview?.summary?.actualCost ?? p.spent ?? 0),
              remaining: Number(overview?.summary?.remainingBudget ?? p.remaining ?? 0),
              risks: riskCounts,
              overdueMilestones
            });
          } catch {}
        }
        setRows(aggregated);
        const monthly: Record<string, { committed: number; paid: number }> = {};
        for (const p of (list || [])) {
          try {
            const bl = await fetch(`/api/projects/budget/lines?projectId=${p.id}`, { cache: 'no-store' });
            const json = bl.ok ? await bl.json() : { lines: [] };
            const lines = json?.lines || [];
            for (const l of lines) {
              const d = (l.date || '').slice(0, 7);
              if (!d) continue;
              monthly[d] = monthly[d] || { committed: 0, paid: 0 };
              if ((l.type || '').toLowerCase() === 'committed') monthly[d].committed += Number(l.amount || 0);
              if ((l.type || '').toLowerCase() === 'paid') monthly[d].paid += Number(l.amount || 0);
            }
          } catch {}
        }
        const cashflowData = Object.keys(monthly).sort().map(m => ({ month: m, committed: monthly[m].committed, paid: monthly[m].paid }));
        setCashflow(cashflowData);
        const spiByDate: Record<string, { sum: number; count: number }> = {};
        for (const p of (list || [])) {
          try {
            const ss = await fetch(`/api/projects/progress/snapshot?projectId=${p.id}`, { cache: 'no-store' });
            const snap = ss.ok ? await ss.json() : { points: [] };
            const points = (snap.points || []).slice(-30);
            for (const pt of points) {
              const d = pt.date;
              if (!d) continue;
              spiByDate[d] = spiByDate[d] || { sum: 0, count: 0 };
              const spi = Number(pt.spi ?? 1);
              spiByDate[d].sum += spi;
              spiByDate[d].count += 1;
            }
          } catch {}
        }
        const spiTrendData = Object.keys(spiByDate).sort().map(d => ({ date: d, spi: spiByDate[d].count ? spiByDate[d].sum / spiByDate[d].count : 1 }));
        setSpiTrend(spiTrendData);
        try {
          const er = await fetch('/api/projects/executive-report', { cache: 'no-store' });
          const erJson = er.ok ? await er.json() : null;
          setExecReport(erJson || null);
        } catch {}
        try {
          const ws = await fetch('/api/projects/weekly-summary', { cache: 'no-store' });
          const wsJson = ws.ok ? await ws.json() : { summary: [] };
          setWeeklySummary(wsJson?.summary || []);
        } catch {}
        setError(null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totals = useMemo(() => {
    const b = rows.reduce((s, r) => s + Number(r.budget || 0), 0);
    const c = rows.reduce((s, r) => s + Number(r.committed || 0), 0);
    const a = rows.reduce((s, r) => s + Number(r.actual || 0), 0);
    const rm = rows.reduce((s, r) => s + Number(r.remaining || 0), 0);
    const completedCount = rows.filter(r => r.progress >= 100).length;
    const avgSpi = rows.length ? (rows.reduce((s, r) => s + Number(r.spi || 1), 0) / rows.length) : 1;
    return { b, c, a, rm, completedCount, avgSpi };
  }, [rows]);

  const [cashflow, setCashflow] = useState<{ month: string; committed: number; paid: number }[]>([]);
  const [spiTrend, setSpiTrend] = useState<{ date: string; spi: number }[]>([]);
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [startMonth, setStartMonth] = useState<string>('');
  const [endMonth, setEndMonth] = useState<string>('');
  const [execReport, setExecReport] = useState<any>(null);
  const [weeklySummary, setWeeklySummary] = useState<any[]>([]);
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const okStatus = status === 'all' ? true : (String(r.status || '').toLowerCase() === status.toLowerCase());
      const okSearch = search ? String(r.name || '').toLowerCase().includes(search.toLowerCase()) : true;
      return okStatus && okSearch;
    });
  }, [rows, status, search]);
  const filteredTotals = useMemo(() => {
    const b = filteredRows.reduce((s, r) => s + Number(r.budget || 0), 0);
    const c = filteredRows.reduce((s, r) => s + Number(r.committed || 0), 0);
    const a = filteredRows.reduce((s, r) => s + Number(r.actual || 0), 0);
    const rm = filteredRows.reduce((s, r) => s + Number(r.remaining || 0), 0);
    const completedCount = filteredRows.filter(r => r.progress >= 100).length;
    const avgSpi = filteredRows.length ? (filteredRows.reduce((s, r) => s + Number(r.spi || 1), 0) / filteredRows.length) : 1;
    return { b, c, a, rm, completedCount, avgSpi };
  }, [filteredRows]);
  const filteredCashflow = useMemo(() => {
    return cashflow.filter(c => {
      const afterStart = startMonth ? c.month >= startMonth : true;
      const beforeEnd = endMonth ? c.month <= endMonth : true;
      return afterStart && beforeEnd;
    });
  }, [cashflow, startMonth, endMonth]);
  const filteredSpiTrend = useMemo(() => {
    return spiTrend.filter(s => {
      const m = s.date.slice(0,7);
      const afterStart = startMonth ? m >= startMonth : true;
      const beforeEnd = endMonth ? m <= endMonth : true;
      return afterStart && beforeEnd;
    });
  }, [spiTrend, startMonth, endMonth]);
  const summaryCards = useMemo(() => {
    const completedProjects = filteredRows.filter(r => Number(r.progress || 0) >= 100).length;
    const inProgressProjects = filteredRows.filter(r => {
      const p = Number(r.progress || 0);
      return p > 0 && p < 100;
    }).length;
    const highRisks = filteredRows.reduce((s, r) => s + Number((r.risks?.high) || 0), 0);
    const overdueMilestones = filteredRows.reduce((s, r) => s + Number(r.overdueMilestones || 0), 0);
    return { completedProjects, inProgressProjects, highRisks, overdueMilestones };
  }, [filteredRows]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="Unified Project Dashboard"
        breadcrumbs={[
          { label: 'Dashboard' }
        ]}
      />
      
      <div className="pt-24 px-8 pb-12 max-w-[1600px] mx-auto space-y-8">
        {/* Filters Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center gap-4 transition-all hover:shadow-md">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={status}
                onChange={(e)=>setStatus(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="planning">Planning</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
              <input 
                type="month" 
                value={startMonth} 
                onChange={(e)=>setStartMonth(e.target.value)} 
                className="px-3 py-1.5 bg-transparent text-sm focus:outline-none" 
              />
              <span className="text-slate-400 text-xs">to</span>
              <input 
                type="month" 
                value={endMonth} 
                onChange={(e)=>setEndMonth(e.target.value)} 
                className="px-3 py-1.5 bg-transparent text-sm focus:outline-none" 
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              title="Copy Link"
            >
              <ArrowUpRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const cols = ['id','name','status','progress','spi','budget','committed','actual','remaining'];
                const header = cols.join(',');
                const rowsCsv = filteredRows.map((r)=>cols.map(c => String(r[c] ?? '')).join(',')).join('\n');
                const csv = header + '\n' + rowsCsv;
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'dashboard.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-[#1E293B] transition-all shadow-lg shadow-slate-900/20"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Top KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="w-16 h-16 text-slate-900" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Budget</span>
              <span className="text-2xl font-bold text-slate-900">฿{filteredTotals.b.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle className="w-16 h-16 text-purple-600" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Committed</span>
              <span className="text-2xl font-bold text-purple-600">฿{filteredTotals.c.toLocaleString()}</span>
              <div className="w-full bg-slate-100 h-1 mt-3 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min((filteredTotals.c / (filteredTotals.b || 1)) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-16 h-16 text-blue-600" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Actual Cost</span>
              <span className="text-2xl font-bold text-blue-600">฿{filteredTotals.a.toLocaleString()}</span>
              <div className="w-full bg-slate-100 h-1 mt-3 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min((filteredTotals.a / (filteredTotals.b || 1)) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <PieChart className="w-16 h-16 text-slate-400" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Remaining</span>
              <span className="text-2xl font-bold text-slate-700">฿{filteredTotals.rm.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-16 h-16 text-emerald-600" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Avg SPI</span>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-bold ${filteredTotals.avgSpi >= 1 ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {filteredTotals.avgSpi.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 mb-1.5">performance index</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{summaryCards.completedProjects}</p>
              <p className="text-sm text-slate-500">Completed Projects</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{summaryCards.inProgressProjects}</p>
              <p className="text-sm text-slate-500">In Progress</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{summaryCards.highRisks}</p>
              <p className="text-sm text-slate-500">High Risks</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{summaryCards.overdueMilestones}</p>
              <p className="text-sm text-slate-500">Overdue Milestones</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Financial Overview</h3>
                <p className="text-sm text-slate-500">Committed vs Paid comparison</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <BarChart className="w-5 h-5 text-slate-400" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredCashflow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v)=>`฿${(v/1000000).toFixed(1)}M`} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: number)=>`฿${v.toLocaleString()}`}
                />
                <Legend iconType="circle" />
                <Bar dataKey="committed" name="Committed" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Paid" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Performance Trend</h3>
                <p className="text-sm text-slate-500">30-day SPI tracking</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-slate-400" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredSpiTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 'dataMax + 0.2']} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: number)=>v.toFixed(2)} 
                />
                <Legend iconType="circle" />
                <Line 
                  type="monotone" 
                  dataKey="spi" 
                  name="Avg SPI" 
                  stroke="#2563EB" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Executive Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Executive Brief</h3>
              <Briefcase className="w-5 h-5 text-slate-400" />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Active Projects</p>
                  <p className="text-2xl font-bold text-slate-900">{execReport?.summary?.totalProjects ?? '-'}</p>
                </div>
                <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center">
                  <Folder className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Avg SPI</p>
                  <p className="text-xl font-bold text-blue-600">{Number(execReport?.summary?.avgSpi ?? 1).toFixed(2)}</p>
                </div>
                <div className="p-4 border border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Overdue</p>
                  <p className="text-xl font-bold text-orange-600">{execReport?.summary?.overdueMilestones ?? '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Top High Risk Projects</p>
                <div className="space-y-2">
                  {(execReport?.summary?.highRiskProjects || []).slice(0, 3).map((h: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {h.name}
                    </div>
                  ))}
                  {(!execReport?.summary?.highRiskProjects?.length) && (
                    <p className="text-sm text-slate-400 italic">No high risk projects</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Summary Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Weekly Performance</h3>
              <Clock className="w-5 h-5 text-slate-400" />
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Project</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">Actual</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">Plan</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">SPI</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">Weekly Δ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(weeklySummary || []).slice(0, 6).map((w: any) => (
                    <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-2 font-medium text-slate-900">{w.name}</td>
                      <td className="py-3 px-2 text-right text-slate-600">{Number(w.progressActual || 0).toFixed(1)}%</td>
                      <td className="py-3 px-2 text-right text-slate-600">{Number(w.progressPlan || 0).toFixed(1)}%</td>
                      <td className="py-3 px-2 text-right font-medium">{Number(w.spi || 1).toFixed(2)}</td>
                      <td className="py-3 px-2 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          Number(w.weeklyDelta || 0) >= 0 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {Number(w.weeklyDelta || 0) > 0 ? '+' : ''}{Number(w.weeklyDelta || 0).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Main Projects Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Active Projects</h3>
            <div className="text-sm text-slate-500">
              Showing {filteredRows.length} projects
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Name</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">SPI</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actual</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risks</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-all group">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <Link href={`/projects/${r.id}/overview`} className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                          {r.name}
                        </Link>
                        <span className={`text-xs mt-1 w-fit px-2 py-0.5 rounded-full ${
                          r.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-700' :
                          r.status?.toLowerCase() === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {r.status || 'Active'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-bold text-slate-700">{r.progress?.toFixed(0)}%</span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${Math.min(r.progress || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`font-bold px-2 py-1 rounded text-sm ${
                        (r.spi || 1) < 0.9 ? 'bg-red-50 text-red-600' :
                        (r.spi || 1) > 1.1 ? 'bg-green-50 text-green-600' :
                        'bg-slate-50 text-slate-700'
                      }`}>
                        {(r.spi || 1).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-slate-600">
                      ฿{Number(r.budget || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-blue-600">
                      ฿{Number(r.actual || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-2">
                        {r.risks.high > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded flex items-center gap-1">
                            H:{r.risks.high}
                          </span>
                        )}
                        {r.risks.medium > 0 && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded flex items-center gap-1">
                            M:{r.risks.medium}
                          </span>
                        )}
                        {r.risks.high === 0 && r.risks.medium === 0 && (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link 
                        href={`/projects/${r.id}/overview`} 
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
