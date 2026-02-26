import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  CardContent,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Clock,
  GripVertical,
} from "lucide-react";
import { clsx } from "clsx";
import { forwardRef } from "react";
import { Task } from "@/lib/tasks";

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  isOverlay?: boolean;
  style?: React.CSSProperties;
  attributes?: any;
  listeners?: any;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, onClick, isOverlay, style, attributes, listeners }, ref) => {
    
    const getStatusColor = (status: string) => {
      switch(status) {
        case "completed": return "#22c55e"; // Green
        case "in_progress": return "#3b82f6"; // Blue
        case "pending": return "#eab308"; // Yellow
        case "todo": return "#94a3b8"; // Slate
        default: return "#94a3b8";
      }
    };

    return (
      <div
        ref={ref}
        style={style}
        className={clsx(
          "group relative mb-3 touch-none",
          isOverlay && "z-50 rotate-2 scale-105 shadow-xl cursor-grabbing",
        )}
      >
        <Card
          className={clsx(
            "hover:shadow-md transition-all border-l-4 cursor-pointer",
            isOverlay ? "cursor-grabbing" : "cursor-grab",
          )}
          style={{
            borderLeftColor: getStatusColor(task.status),
          }}
          onClick={() => onClick?.(task)}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  {task.phase && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-5 border-slate-200 text-slate-500 bg-slate-50"
                    >
                      {task.phase}
                    </Badge>
                  )}
                  <div
                    {...attributes}
                    {...listeners}
                    className={clsx(
                      "transition-opacity p-1 text-slate-400 hover:text-slate-600 cursor-grab ml-auto",
                      isOverlay
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100",
                    )}
                    onClick={(e) => e.stopPropagation()} // Prevent card click when grabbing
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="text-sm font-medium text-slate-900 leading-tight line-clamp-2">
                  {task.title}
                </h4>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>
                    {task.startDate
                      ? new Date(task.startDate).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                        })
                      : "-"}
                  </span>
                  <span>-</span>
                  <span>
                    {task.endDate
                      ? new Date(task.endDate).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                        })
                      : "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    {task.assigned_to && task.assigned_to !== "Unassigned" && (
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                        {task.assigned_to.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <span
                      className={clsx(
                        task.progressActual === 100
                          ? "text-green-600"
                          : "text-blue-600",
                      )}
                    >
                      {task.progressActual}%
                    </span>
                  </div>
                </div>

                {/* Mini Progress Bar */}
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      "h-full rounded-full transition-all",
                      task.progressActual === 100
                        ? "bg-green-500"
                        : "bg-blue-500",
                    )}
                    style={{ width: `${task.progressActual}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
);

TaskCard.displayName = "TaskCard";

interface KanbanCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <TaskCard
      ref={setNodeRef}
      task={task}
      onClick={onClick}
      style={style}
      attributes={attributes}
      listeners={listeners}
    />
  );
}
