'use client';

import { useEffect, useMemo, useState, useRef, lazy, Suspense } from 'react';
import Header from '@/app/components/Header';
import Link from 'next/link';
import { AlertTriangle, Folder } from 'lucide-react';
import PageTransition from '@/app/components/PageTransition';
import { Skeleton } from '@/app/components/ui/Skeleton';

import DashboardFilters from './components/DashboardFilters';
import DashboardKPIs from './components/DashboardKPIs';
import DashboardStatus from './components/DashboardStatus';
import ExecutiveSummaryCard from './components/ExecutiveSummaryCard';
import RecentActivitiesCard from './components/RecentActivitiesCard';
import ActiveProjectsTable from './components/ActiveProjectsTable';

import type {
    ProjectRow,
    CashflowEntry,
    SpiTrendEntry,
    SpiSnapEntry,
    ActivityEntry,
    ExecReport,
    DashboardTotals,
    DashboardSummary,
} from './types';

// Lazy load heavy chart components
const FinancialChartCard = lazy(() => import('./components/FinancialChartCard'));
const TrendChartCard = lazy(() => import('./components/TrendChartCard'));
const PortfolioHealthCard = lazy(() => import('./components/PortfolioHealthCard'));
const WeeklyPerformanceCard = lazy(() => import('./components/WeeklyPerformanceCard'));

function ChartFallback() {
    return <Skeleton className="h-80 w-full rounded-2xl" />;
}

export default function UnifiedDashboard() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<ProjectRow[]>([]);
    const [activities, setActivities] = useState<ActivityEntry[]>([]);
    const [cashflow, setCashflow] = useState<CashflowEntry[]>([]);
    const [spiTrend, setSpiTrend] = useState<SpiTrendEntry[]>([]);
    const [spiSnaps, setSpiSnaps] = useState<SpiSnapEntry[]>([]);
    const [selectedSpiProject, setSelectedSpiProject] = useState<string>('all');
    const [status, setStatus] = useState<string>('all');
    const [search, setSearch] = useState<string>('');
    const [startMonth, setStartMonth] = useState<string>('');
    const [endMonth, setEndMonth] = useState<string>('');
    const [execReport, setExecReport] = useState<ExecReport | null>(null);

    const abortRef = useRef<AbortController | null>(null);

    // Clear cache function — now only clears dashboard-specific cache
    const clearCache = () => {
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        fetchDashboardData(true);
    };

    const fetchDashboardData = async (forceRefresh = false) => {
        // Cancel any in-flight request
        if (abortRef.current) {
            abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            if (!loading) setRefreshing(true);
            setError(null);

            const timestamp = forceRefresh ? `&t=${Date.now()}` : '';
            const signal = controller.signal;

            const [pf, act, er, ws] = await Promise.all([
                fetch(`/api/dashboard/portfolio?${timestamp}`, { cache: 'no-store', signal }),
                fetch(`/api/dashboard/activities?${timestamp}`, { cache: 'no-store', signal }),
                fetch(`/api/projects/executive-report?${timestamp}`, { cache: 'no-store', signal }).catch(() => ({ ok: false })),
                fetch(`/api/projects/weekly-summary?${timestamp}`, { cache: 'no-store', signal }).catch(() => ({ ok: false }))
            ]);

            if (signal.aborted) return;

            const pfJson = pf.ok ? await (pf as Response).json() : { rows: [], cashflow: [], spiTrend: [], spiSnaps: [] };
            setRows(pfJson.rows || []);
            setCashflow(pfJson.cashflow || []);
            setSpiTrend(pfJson.spiTrend || []);
            setSpiSnaps(pfJson.spiSnaps || []);

            const actJson = act.ok ? await (act as Response).json() : [];
            setActivities(actJson || []);

            const erJson = (er as Response).ok ? await (er as Response).json() : null;
            setExecReport(erJson || null);

            const wsJson = (ws as Response).ok ? await (ws as Response).json() : { summary: [] };
            // Weekly summary data is derived from rows, not a separate state
            void wsJson;
        } catch (e: unknown) {
            if (e instanceof DOMException && e.name === 'AbortError') return;
            console.error('Dashboard error:', e);
            setError(e instanceof Error ? e.message : 'Unable to load dashboard data');
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    };

    useEffect(() => {
        fetchDashboardData();
        return () => {
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };
    }, []);

    // Computed KPIs with descriptive names
    const totals = useMemo<DashboardTotals>(() => {
        const budget = rows.reduce((s, r) => s + Number(r.budget || 0), 0);
        const committed = rows.reduce((s, r) => s + Number(r.committed || 0), 0);
        const actual = rows.reduce((s, r) => s + Number(r.actual || 0), 0);
        const remaining = rows.reduce((s, r) => s + Number(r.remaining || 0), 0);
        const completedCount = rows.filter(r => r.progress >= 100).length;
        const avgSpi = rows.length ? (rows.reduce((s, r) => s + Number(r.spi || 1), 0) / rows.length) : 1;
        return { budget, committed, actual, remaining, completedCount, avgSpi };
    }, [rows]);

    const filteredRows = useMemo(() => {
        return rows.filter(r => {
            const okStatus = status === 'all' ? true : (String(r.status || '').toLowerCase() === status.toLowerCase());
            const okSearch = search ? String(r.name || '').toLowerCase().includes(search.toLowerCase()) : true;
            return okStatus && okSearch;
        });
    }, [rows, status, search]);

    const filteredTotals = useMemo<DashboardTotals>(() => {
        const budget = filteredRows.reduce((s, r) => s + Number(r.budget || 0), 0);
        const committed = filteredRows.reduce((s, r) => s + Number(r.committed || 0), 0);
        const actual = filteredRows.reduce((s, r) => s + Number(r.actual || 0), 0);
        const remaining = filteredRows.reduce((s, r) => s + Number(r.remaining || 0), 0);
        const completedCount = filteredRows.filter(r => r.progress >= 100).length;
        const avgSpi = filteredRows.length ? (filteredRows.reduce((s, r) => s + Number(r.spi || 1), 0) / filteredRows.length) : 1;
        return { budget, committed, actual, remaining, completedCount, avgSpi };
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

    const summaryCards = useMemo<DashboardSummary>(() => {
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
            <div className="min-h-screen bg-background p-4 lg:p-8 pt-20 lg:pt-24 space-y-8" role="status" aria-label="กำลังโหลดแดชบอร์ด">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 p-4" role="alert">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />
                </div>
                <div className="text-center max-w-md space-y-2">
                    <h3 className="text-xl font-bold">เกิดข้อผิดพลาดในการโหลดแดชบอร์ด</h3>
                    <p className="text-muted-foreground">{error}</p>
                </div>
                <button
                    onClick={() => {
                        setLoading(true);
                        fetchDashboardData();
                    }}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    ลองใหม่อีกครั้ง
                </button>
            </div>
        );
    }

    return (
        <PageTransition className="min-h-screen bg-background">
            <Header
                title="Dashboard"
                breadcrumbs={[
                    { label: 'Dashboard' }
                ]}
            />

            <div className="pt-20 lg:pt-24 px-4 lg:px-8 pb-12 max-w-[1600px] mx-auto space-y-8">

                {rows.length === 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4" role="status">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0" aria-hidden="true">
                                <Folder className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300">ไม่พบโครงการ</h3>
                                <p className="text-blue-700 dark:text-blue-400">สร้างโครงการแรกเพื่อเริ่มติดตามข้อมูลเชิงลึกที่นี่</p>
                            </div>
                        </div>
                        <Link
                            href="/projects/new"
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            สร้างโครงการ
                        </Link>
                    </div>
                )}

                <DashboardFilters
                    search={search} setSearch={setSearch}
                    status={status} setStatus={setStatus}
                    startMonth={startMonth} setStartMonth={setStartMonth}
                    endMonth={endMonth} setEndMonth={setEndMonth}
                    onRefresh={fetchDashboardData}
                    onClearCache={clearCache}
                    refreshing={refreshing}
                    filteredRows={filteredRows}
                />

                <DashboardKPIs totals={filteredTotals} />

                <DashboardStatus summary={summaryCards} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 gap-y-8">
                    <Suspense fallback={<ChartFallback />}>
                        <FinancialChartCard data={filteredCashflow} />
                    </Suspense>
                    <Suspense fallback={<ChartFallback />}>
                        <TrendChartCard
                            data={filteredSpiTrend}
                            projects={rows}
                            selectedProject={selectedSpiProject}
                            onSelectProject={setSelectedSpiProject}
                        />
                    </Suspense>
                </div>

                <Suspense fallback={<ChartFallback />}>
                    <PortfolioHealthCard data={filteredRows} />
                </Suspense>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 gap-y-8">
                    <ExecutiveSummaryCard report={execReport} />
                    <RecentActivitiesCard activities={activities} />
                    <Suspense fallback={<ChartFallback />}>
                        <WeeklyPerformanceCard data={filteredRows} />
                    </Suspense>
                </div>

                <ActiveProjectsTable projects={filteredRows} />
            </div>
        </PageTransition>
    );
}
