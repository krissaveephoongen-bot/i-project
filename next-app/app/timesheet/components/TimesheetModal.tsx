'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/Dialog";
import { Project, ModalRow } from '../types';

interface TimesheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  date: string;
  projects: Project[];
  initialRows: ModalRow[];
  onSave: (rows: ModalRow[]) => void;
}

export default function TimesheetModal({
  open,
  onOpenChange,
  projectId,
  date,
  projects,
  initialRows,
  onSave
}: TimesheetModalProps) {
  const [rows, setRows] = useState<ModalRow[]>([]);

  useEffect(() => {
    if (open) {
      setRows(initialRows.length > 0 ? initialRows : [{ hours: 0 }]);
    }
  }, [open, initialRows]);

  const updateRow = (idx: number, updates: Partial<ModalRow>) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, ...updates } : r));
  };

  const deleteRow = (idx: number) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, deleted: true } : r));
  };

  const addRow = () => {
    setRows(prev => [...prev, { hours: 0 }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>บันทึกเวลาทำงาน</DialogTitle>
          <DialogDescription>
            {date && new Date(date).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-sm font-medium">โครงการ</label>
               <Select value={projectId} disabled>
                 <SelectTrigger className="bg-slate-50">
                   <SelectValue placeholder="เลือกโครงการ" />
                 </SelectTrigger>
                 <SelectContent>
                   {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                 </SelectContent>
               </Select>
             </div>
          </div>

          <div className="space-y-4">
            {rows.map((row, idx) => (
              !row.deleted && (
                <div key={idx} className="grid grid-cols-12 gap-3 items-end p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="col-span-5 space-y-1">
                    <label className="text-xs font-medium text-slate-500">งาน (Task)</label>
                    <Select 
                      value={row.taskId || 'none'} 
                      onValueChange={(val) => updateRow(idx, { taskId: val === 'none' ? undefined : val })}
                    >
                      <SelectTrigger className="h-9 text-xs bg-white">
                        <SelectValue placeholder="เลือกงาน" />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="none">-- งานทั่วไป (General) --</SelectItem>
                         {(projects.find(p => p.id === projectId)?.tasks || []).map(t => (
                           <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                         ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3 space-y-1">
                    <label className="text-xs font-medium text-slate-500">รายละเอียด</label>
                    <Input 
                      type="text"
                      className="h-9 text-xs bg-white"
                      placeholder="ทำอะไรไปบ้าง?"
                      value={row.description || ''}
                      onChange={e => updateRow(idx, { description: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-500">ชม.</label>
                    <Input 
                      type="number" 
                      min={0} 
                      max={24} 
                      step={0.5}
                      className="h-9 text-xs bg-white text-center font-bold text-blue-600"
                      value={row.hours} 
                      onChange={e => updateRow(idx, { hours: parseFloat(e.target.value) || 0 })} 
                    />
                  </div>
                  <div className="col-span-1 space-y-1">
                     <label className="text-xs font-medium text-slate-500">&nbsp;</label>
                     <Button 
                       variant="destructive" 
                       size="sm" 
                       className="h-9 w-full text-xs"
                       onClick={() => deleteRow(idx)}
                     >
                       <X className="h-3 w-3" />
                     </Button>
                  </div>
                </div>
              )
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addRow}
              className="w-full border-dashed rounded-xl"
            >
              <Plus className="h-3 w-3 mr-2" /> เพิ่มรายการ
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">ยกเลิก</Button>
          <Button onClick={() => onSave(rows)} className="rounded-xl bg-blue-600 hover:bg-blue-700">บันทึก</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
