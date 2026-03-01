"use client";

import * as React from "react";
import {
  CalendarIcon,
  Filter,
  Search,
  X,
  RefreshCcw,
  Download,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useDynamicFilterOptions,
  DynamicFilterOptions,
} from "@/hooks/useDynamicFilterOptions";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface ProfessionalDashboardFiltersProps {
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
  totalRows: number;
}

export function ProfessionalDashboardFilters({
  search,
  setSearch,
  status,
  setStatus,
  startMonth,
  setStartMonth,
  endMonth,
  setEndMonth,
  onRefresh,
  refreshing,
  filteredRows,
  totalRows,
}: ProfessionalDashboardFiltersProps) {
  const debouncedSearch = useDebounce(search, 300);
  const { data: dynamicOptions, isLoading } = useDynamicFilterOptions();
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: startMonth ? new Date(startMonth) : undefined,
    to: endMonth ? new Date(endMonth) : undefined,
  });

  const options = dynamicOptions as DynamicFilterOptions | undefined;

  React.useEffect(() => {
    if (debouncedSearch !== search) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, search]);

  React.useEffect(() => {
    if (dateRange.from) {
      setStartMonth(dateRange.from.toISOString().slice(0, 7));
    }
    if (dateRange.to) {
      setEndMonth(dateRange.to.toISOString().slice(0, 7));
    }
  }, [dateRange, setStartMonth, setEndMonth]);

  const handleExportCSV = () => {
    const cols = [
      "id",
      "name",
      "status",
      "progress",
      "spi",
      "budget",
      "committed",
      "actual",
      "remaining",
    ];
    const header = cols.join(",");
    const rowsCsv = filteredRows
      .map((r) => cols.map((c) => String(r[c] ?? "")).join(","))
      .join("\n");
    const csv = header + "\n" + rowsCsv;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dashboard.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllFilters = () => {
    setSearch("");
    setStatus("all");
    setStartMonth("");
    setEndMonth("");
    setDateRange({ from: undefined, to: undefined });
  };

  const activeFiltersCount = [
    search,
    status !== "all",
    startMonth,
    endMonth,
  ].filter(Boolean).length;

  const statusOptions = React.useMemo(() => {
    if (options?.projectStatuses) {
      return options.projectStatuses;
    }
    return [
      { value: "active", label: "กำลังดำเนินการ (Active)" },
      { value: "planning", label: "วางแผน (Planning)" },
      { value: "completed", label: "เสร็จสิ้น (Completed)" },
    ];
  }, [options]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 transition-all hover:shadow-md">
      <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาโครงการ..."
            className="pl-10"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="h-9"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            </Button>
          )}

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Select
              value={status}
              onValueChange={setStatus}
              disabled={isLoading}
            >
              <SelectTrigger className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer hover:bg-slate-100 transition-colors">
                <SelectValue placeholder="สถานะทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "px-3 py-1.5 bg-transparent text-sm focus:outline-none cursor-pointer h-auto",
                    !dateRange.from && "text-muted-foreground",
                  )}
                >
                  {dateRange.from
                    ? format(dateRange.from, "MMM yyyy")
                    : "Start"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) =>
                    setDateRange((prev) => ({ ...prev, from: date }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <span className="text-slate-400 text-xs">ถึง</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "px-3 py-1.5 bg-transparent text-sm focus:outline-none cursor-pointer h-auto",
                    !dateRange.to && "text-muted-foreground",
                  )}
                >
                  {dateRange.to ? format(dateRange.to, "MMM yyyy") : "End"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) =>
                    setDateRange((prev) => ({ ...prev, to: date }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className={`p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all ${refreshing ? "animate-spin text-blue-600" : ""}`}
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
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground mt-2">
        {filteredRows.length === 0 ? (
          <span className="text-red-600">ไม่พบข้อมูลที่ตรงตามเงื่อนไข</span>
        ) : (
          <span>
            แสดง {filteredRows.length} รายการจากทั้งหมด {totalRows} รายการ
          </span>
        )}
      </div>
    </div>
  );
}
