import React, { useState } from 'react';
import { Search, RefreshCcw, Download, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from '@/app/components/ui/Dialog';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/app/components/ui/Select';
import type { ProjectRow } from '../types';

interface DashboardFiltersProps {
    search: string;
    setSearch: (val: string) => void;
    status: string;
    setStatus: (val: string) => void;
    startMonth: string;
    setStartMonth: (val: string) => void;
    endMonth: string;
    setEndMonth: (val: string) => void;
    onRefresh: () => void;
    onClearCache: () => void;
    refreshing: boolean;
    filteredRows: ProjectRow[];
}

function DashboardFilters({
    search, setSearch,
    status, setStatus,
    startMonth, setStartMonth,
    endMonth, setEndMonth,
    onRefresh,
    onClearCache,
    refreshing,
    filteredRows
}: DashboardFiltersProps) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleExportCSV = () => {
        const cols = ['id', 'name', 'status', 'progress', 'spi', 'budget', 'committed', 'actual', 'remaining'] as const;
        const header = cols.join(',');
        const rowsCsv = filteredRows.map((r) => cols.map(c => String(r[c as keyof typeof r] ?? '')).join(',')).join('\n');
        const csv = header + '\n' + rowsCsv;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dashboard.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('✅ ส่งออก CSV สำเร็จ');
    };

    const handleConfirmClearCache = () => {
        onClearCache();
        setConfirmOpen(false);
        toast.success('✅ ล้างแคชสำเร็จ');
    };

    return (
        <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-4 flex flex-wrap items-center gap-3 lg:gap-4 transition-all hover:shadow-md">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" aria-hidden="true" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหาโครงการ..."
                    aria-label="ค้นหาโครงการ"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all"
                />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Status select */}
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-[180px] bg-muted border-border rounded-xl text-sm" aria-label="กรองตามสถานะ">
                        <SelectValue placeholder="สถานะทั้งหมด" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                        <SelectItem value="active">กำลังดำเนินการ (Active)</SelectItem>
                        <SelectItem value="planning">วางแผน (Planning)</SelectItem>
                        <SelectItem value="completed">เสร็จสิ้น (Completed)</SelectItem>
                    </SelectContent>
                </Select>

                {/* Date range */}
                <div className="flex items-center gap-2 bg-muted border border-border rounded-xl p-1">
                    <label className="sr-only" htmlFor="filter-start-month">เดือนเริ่มต้น</label>
                    <input
                        id="filter-start-month"
                        type="month"
                        value={startMonth}
                        onChange={(e) => setStartMonth(e.target.value)}
                        aria-label="เดือนเริ่มต้น"
                        className="px-3 py-1.5 bg-transparent text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded cursor-pointer"
                    />
                    <span className="text-muted-foreground text-xs" aria-hidden="true">ถึง</span>
                    <label className="sr-only" htmlFor="filter-end-month">เดือนสิ้นสุด</label>
                    <input
                        id="filter-end-month"
                        type="month"
                        value={endMonth}
                        onChange={(e) => setEndMonth(e.target.value)}
                        aria-label="เดือนสิ้นสุด"
                        className="px-3 py-1.5 bg-transparent text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded cursor-pointer"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
                <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
                    {/* Clear cache with confirmation dialog */}
                    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                        <DialogTrigger asChild>
                            <button
                                className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all flex items-center gap-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                aria-label="ล้างแคชข้อมูล"
                            >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                                <span className="hidden sm:inline">ล้างแคช</span>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-foreground">ยืนยันการล้างแคช</h3>
                                <p className="text-sm text-muted-foreground">
                                    การดำเนินการนี้จะล้างข้อมูลแคชทั้งหมดและรีเฟรชข้อมูลใหม่ คุณต้องการดำเนินการต่อหรือไม่?
                                </p>
                                <div className="flex justify-end gap-3">
                                    <DialogClose asChild>
                                        <button className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                            ยกเลิก
                                        </button>
                                    </DialogClose>
                                    <button
                                        onClick={handleConfirmClearCache}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        ล้างแคช
                                    </button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <button
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all flex items-center gap-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                        aria-label={refreshing ? 'กำลังรีเฟรช' : 'รีเฟรชข้อมูล'}
                    >
                        <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                        <span className="hidden sm:inline">รีเฟรช</span>
                    </button>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="ส่งออกข้อมูลเป็น CSV"
                >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>ส่งออก CSV</span>
                </button>
            </div>
        </div>
    );
}

export default React.memo(DashboardFilters);
