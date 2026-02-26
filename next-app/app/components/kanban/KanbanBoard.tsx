"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./KanbanCard";
import { Task } from "@/lib/tasks";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, newStatus: string) => Promise<void>;
  onTaskClick?: (task: Task) => void;
}

export default function KanbanBoard({
  tasks: initialTasks,
  onTaskUpdate,
  onTaskClick,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group tasks by status (lowercase keys matching DB)
  const columns = {
    todo: tasks.filter((t) => t.status === "todo"),
    pending: tasks.filter((t) => t.status === "pending"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  const findContainer = (id: string) => {
    if (id in columns) return id;
    const task = tasks.find((t) => t.id === id);
    return task ? task.status : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (activeContainer && overContainer && activeContainer !== overContainer) {
      // Moved to a different column
      const newStatus = overContainer as string;

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, status: newStatus } : t))
      );

      // API Call
      try {
        await onTaskUpdate(activeId, newStatus);
      } catch (error) {
        // Revert on error
        console.error("Failed to update task status", error);
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeId ? { ...t, status: activeContainer as string } : t
          )
        );
      }
    }

    setActiveTask(null);
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4 min-w-full">
        <KanbanColumn
          id="todo"
          title="To Do"
          tasks={columns.todo}
          count={columns.todo.length}
          color="bg-slate-300"
          onTaskClick={onTaskClick}
        />
        <KanbanColumn
          id="pending"
          title="Pending"
          tasks={columns.pending}
          count={columns.pending.length}
          color="bg-yellow-400"
          onTaskClick={onTaskClick}
        />
        <KanbanColumn
          id="in_progress"
          title="In Progress"
          tasks={columns.in_progress}
          count={columns.in_progress.length}
          color="bg-blue-500"
          onTaskClick={onTaskClick}
        />
        <KanbanColumn
          id="completed"
          title="Completed"
          tasks={columns.completed}
          count={columns.completed.length}
          color="bg-green-500"
          onTaskClick={onTaskClick}
        />
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
