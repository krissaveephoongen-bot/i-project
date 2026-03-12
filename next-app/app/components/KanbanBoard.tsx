"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove?: (taskId: string, newStatus: string) => void;
  onTaskSelect?: (task: Task) => void;
}

const STATUSES = [
  { value: "todo", label: "To Do", color: "bg-gray-100 border-gray-300" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 border-blue-300" },
  { value: "in_review", label: "In Review", color: "bg-yellow-100 border-yellow-300" },
  { value: "done", label: "Done", color: "bg-green-100 border-green-300" },
];

function KanbanCard({ task, onSelect }: { task: Task; onSelect?: (task: Task) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect?.(task)}
      className={cn(
        "bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow",
        isDragging && "opacity-50"
      )}
    >
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2">{task.title}</h3>
        {task.wbsCode && (
          <p className="text-xs text-gray-500 font-mono">{task.wbsCode}</p>
        )}
        {task.estimatedHours && (
          <p className="text-xs text-gray-600">
            <span className="font-medium">{task.estimatedHours}h</span> estimated
          </p>
        )}
        {task.assignedTo && (
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center">
              <span className="text-xs text-blue-700 font-bold">
                {task.assignedTo.substring(0, 1).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-600">Assigned</span>
          </div>
        )}
        {task.progressActual !== undefined && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${task.progressActual}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">{task.progressActual}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  label,
  color,
  tasks,
  onTaskSelect,
}: {
  status: string;
  label: string;
  color: string;
  tasks: Task[];
  onTaskSelect?: (task: Task) => void;
}) {
  const { setNodeRef } = useSortable({
    id: status,
    data: { type: "Column", status },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-white rounded-lg border-2 p-4 min-h-96 flex flex-col",
        color
      )}
    >
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900">{label}</h2>
        <p className="text-sm text-gray-500 mt-1">{tasks.length} tasks</p>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              <p className="text-sm">No tasks</p>
            </div>
          ) : (
            tasks.map((task) => (
              <KanbanCard key={task.id} task={task} onSelect={onTaskSelect} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({ tasks, onTaskMove, onTaskSelect }: KanbanBoardProps) {
  const [boardTasks, setBoardTasks] = useState(tasks);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    if (over.data?.current?.type === "Column") {
      // Update local state
      const task = boardTasks.find((t) => t.id === taskId);
      if (task && task.status !== newStatus) {
        setBoardTasks(
          boardTasks.map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t
          )
        );
        onTaskMove?.(taskId, newStatus);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          {STATUSES.map(({ value, label, color }) => (
            <KanbanColumn
              key={value}
              status={value}
              label={label}
              color={color}
              tasks={boardTasks.filter((t) => t.status === value)}
              onTaskSelect={onTaskSelect}
            />
          ))}
        </DndContext>
      </div>
    </div>
  );
}
