import React from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface DashboardFiltersProps {
  filters: {
    search: string;
    status: string;
    manager: string;
    client: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    search: string;
    status: string;
    manager: string;
    client: string;
  }>>;
  managers: string[];
  clients: string[];
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  setFilters,
  managers,
  clients,
}) => {
  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      manager: "all",
      client: "all",
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="ค้นหาโครงการ..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="pl-9"
        />
      </div>
      
      <Select 
        value={filters.status} 
        onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="สถานะ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">สถานะทั้งหมด</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="on hold">On Hold</SelectItem>
        </SelectContent>
      </Select>

      <Select 
        value={filters.manager} 
        onValueChange={(val) => setFilters(prev => ({ ...prev, manager: val }))}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="ผู้จัดการโครงการ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ผู้จัดการทั้งหมด</SelectItem>
          {managers.map(m => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={filters.client} 
        onValueChange={(val) => setFilters(prev => ({ ...prev, client: val }))}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="ลูกค้า" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ลูกค้าทั้งหมด</SelectItem>
          {clients.map(c => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(filters.search || filters.status !== "all" || filters.manager !== "all" || filters.client !== "all") && (
        <Button variant="ghost" size="icon" onClick={clearFilters} className="text-slate-500 hover:text-red-600">
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default React.memo(DashboardFilters);
