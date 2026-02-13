import { Search, Filter, RefreshCcw, Download } from 'lucide-react';

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
  refreshing: boolean;
  filteredRows: any[];
}

export default function DashboardFilters({
  search, setSearch,
  status, setStatus,
  startMonth, setStartMonth,
  endMonth, setEndMonth,
  onRefresh,
  refreshing,
  filteredRows
}: DashboardFiltersProps) {
  
  const handleExportCSV = () => {
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
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center gap-4 transition-all hover:shadow-md">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="ค้นหาโครงการ..."
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
            <option value="all">สถานะทั้งหมด</option>
            <option value="active">กำลังดำเนินการ (Active)</option>
            <option value="planning">วางแผน (Planning)</option>
            <option value="completed">เสร็จสิ้น (Completed)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
          <input 
            type="month" 
            value={startMonth} 
            onChange={(e)=>setStartMonth(e.target.value)} 
            className="px-3 py-1.5 bg-transparent text-sm focus:outline-none cursor-pointer" 
          />
          <span className="text-slate-400 text-xs">ถึง</span>
          <input 
            type="month" 
            value={endMonth} 
            onChange={(e)=>setEndMonth(e.target.value)} 
            className="px-3 py-1.5 bg-transparent text-sm focus:outline-none cursor-pointer" 
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className={`p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all ${refreshing ? 'animate-spin text-blue-600' : ''}`}
          title="รีเฟรชข้อมูล"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-[#1E293B] transition-all shadow-lg shadow-slate-900/20"
        >
          <Download className="w-4 h-4" />
          <span>ส่งออก CSV</span>
        </button>
      </div>
    </div>
  );
}
