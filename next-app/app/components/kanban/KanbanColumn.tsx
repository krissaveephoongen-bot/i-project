import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { clsx } from 'clsx';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';

interface Task {
  id: string;
  name: string;
  phase: string;
  weight: number;
  progress_plan: number;
  progress_actual: number;
  start_date: string;
  end_date: string;
  assignee: string;
  vendor: string;
  status: string;
  progressPlan?: number;
  progressActual?: number;
  startDate?: string;
  endDate?: string;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  count: number;
  color?: string;
  onTaskClick?: (task: Task) => void;
}

export function KanbanColumn({ id, title, tasks, count, color = "bg-slate-100", onTaskClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col h-full min-w-[300px] max-w-[350px] bg-slate-50/50 rounded-xl border border-slate-200/60">
      {/* Column Header */}
      <div className="p-3 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
            <div className={clsx("w-3 h-3 rounded-full", color)}></div>
            <h3 className="font-semibold text-sm text-slate-700">{title}</h3>
            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                {count}
            </span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
            <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Task List */}
      <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto custom-scrollbar">
        <SortableContext id={id} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3 pb-4">
            {tasks.map((task) => (
              <KanbanCard key={task.id} task={task} onClick={onTaskClick} />
            ))}
            {tasks.length === 0 && (
                <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                    ลากงานมาวางที่นี่
                </div>
            )}
          </div>
        </SortableContext>
      </div>
      
      {/* Footer / Add Button */}
      {/* <div className="p-3 pt-0">
        <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-blue-600 hover:bg-blue-50">
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มงาน
        </Button>
      </div> */}
    </div>
  );
}
