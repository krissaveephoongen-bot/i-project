'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/app/components/Header';
import Link from 'next/link';
import { AlertTriangle, Folder, RefreshCw } from 'lucide-react';
import PageTransition from '@/app/components/PageTransition';
import { Skeleton } from '@/app/components/ui/Skeleton';

import DashboardFilters from './components/DashboardFilters';
import DashboardKPIs from './components/DashboardKPIs';
import DashboardStatus from './components/DashboardStatus';
import FinancialChartCard from './components/FinancialChartCard';
import TrendChartCard from './components/TrendChartCard';
import PortfolioHealthCard from './components/PortfolioHealthCard';
import ExecutiveSummaryCard from './components/ExecutiveSummaryCard';
import RecentActivitiesCard from './components/RecentActivitiesCard';
import WeeklyPerformanceCard from './components/WeeklyPerformanceCard';
import ActiveProjectsTable from './components/ActiveProjectsTable';

export default function UnifiedDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [cashflow, setCashflow] = useState<{ month: string; committed: number; paid: number }[]>([]);
  const [spiTrend, setSpiTrend] = useState<{ date: string; spi: number }[]>([]);
  const [spiSnaps, setSpiSnaps] = useState<{ projectId: string; date: string; spi: number }[]>([]);
  const [selectedSpiProject, setSelectedSpiProject] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [startMonth, setStartMonth] = useState<string>('');
  const [endMonth, setEndMonth] = useState<string>('');
  const [execReport, setExecReport] = useState<any>(null);
  const [weeklySummary, setWeeklySummary] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      if (!loading) setRefreshing(true);
      setError(null);
      
      // Parallel fetch for better performance
      const [pf, act, er, ws] = await Promise.all([
        fetch('/api/dashboard/portfolio', { cache: 'no-store' }),
        fetch('/api/dashboard/activities', { cache: 'no-store' }),
        fetch('/api/projects/executive-report', { cache: 'no-store' }).catch(() => ({ ok: false })),
        fetch('/api/projects/weekly-summary', { cache: 'no-store' }).catch(() => ({ ok: false }))
      ]);

      // Portfolio data
      const pfJson = pf.ok ? await pf.json() : { rows: [], cashflow: [], spiTrend: [], spiSnaps: [] };
      setRows(pfJson.rows || []);
      setCashflow(pfJson.cashflow || []);
      setSpiTrend(pfJson.spiTrend || []);
      setSpiSnaps(pfJson.spiSnaps || []);

      // Activities
      const actJson = act.ok ? await (act as Response).json() : [];
      setActivities(actJson || []);

      // Executive report
      const erJson = er.ok ? await (er as Response).json() : null;
      setExecReport(erJson || null);

      // Weekly summary
      const wsJson = ws.ok ? await (ws as Response).json() : { summary: [] };
      setWeeklySummary(wsJson?.summary || []);
    } catch (e: any) {
      console.error('Dashboard error:', e);
      setError(e?.message || 'Unable to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Computed KPIs
  const totals = useMemo(() => {
    const b = rows.reduce((s, r) => s + Number(r.budget || 0), 0);
    const c = rows.reduce((s, r) => s + Number(r.committed || 0), 0);
    const a = rows.reduce((s, r) => s + Number(r.actual || 0), 0);
    const rm = rows.reduce((s, r) => s + Number(r.remaining || 0), 0);
    const completedCount = rows.filter(r => r.progress >= 100).length;
    const avgSpi = rows.length ? (rows.reduce((s, r) => s + Number(r.spi || 1), 0) / rows.length) : 1;
    return { b, c, a, rm, completedCount, avgSpi };
  }, [rows]);

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
    if (selectedSpiProject !== 'all') {
      const filteredSnaps = spiSnaps.filter(s => s.projectId === selectedSpiProject);
      filteredSnaps.sort((a, b) => a.date.localeCompare(b.date));
      
      return filteredSnaps.map(s => ({ date: s.date, spi: s.spi })).filter(s => {
        const m = s.date.slice(0, 7);
        const afterStart = startMonth ? m >= startMonth : true;
        const beforeEnd = endMonth ? m <= endMonth : true;
        return afterStart && beforeEnd;
      });
    }

    return spiTrend.filter(s => {
      const m = s.date.slice(0, 7);
      const afterStart = startMonth ? m >= startMonth : true;
      const beforeEnd = endMonth ? m <= endMonth : true;
      return afterStart && beforeEnd;
    });
  }, [spiTrend, spiSnaps, selectedSpiProject, startMonth, endMonth]);
  
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
    return (
      <div className="min-h-screen bg-slate-50/50 p-8 pt-24 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 p-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center animate-bounce">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center max-w-md space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Error Loading Dashboard</h3>
          <p className="text-slate-500">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-slate-50/50">
      <Header
        title="Dashboard"
        breadcrumbs={[
          { label: 'Dashboard' }
        ]}
      />
      
      <div className="pt-24 px-8 pb-12 max-w-[1600px] mx-auto space-y-8">
        
        {rows.length === 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-blue-900">No Projects Found</h3>
                <p className="text-blue-700">Create your first project to start tracking insights and analytics here.</p>
              </div>
            </div>
            <Link href="/projects/new" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 whitespace-nowrap">
              Create Project
            </Link>
          </div>
        )}

        <DashboardFilters 
          search={search} setSearch={setSearch}
          status={status} setStatus={setStatus}
          startMonth={startMonth} setStartMonth={setStartMonth}
          endMonth={endMonth} setEndMonth={setEndMonth}
          onRefresh={fetchDashboardData}
          refreshing={refreshing}
          filteredRows={filteredRows}
        />

        <DashboardKPIs totals={filteredTotals} />

        <DashboardStatus summary={summaryCards} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 gap-y-8">
          <FinancialChartCard data={filteredCashflow} />
          <TrendChartCard 
            data={filteredSpiTrend} 
            projects={rows}
            selectedProject={selectedSpiProject}
            onSelectProject={setSelectedSpiProject}
          />
        </div>

        <PortfolioHealthCard data={filteredRows} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 gap-y-8">
          <ExecutiveSummaryCard report={execReport} />
          <RecentActivitiesCard activities={activities} />
          <WeeklyPerformanceCard data={filteredRows} />
        </div>

        <ActiveProjectsTable projects={filteredRows} />
      </div>
    </PageTransition>
  );
}
