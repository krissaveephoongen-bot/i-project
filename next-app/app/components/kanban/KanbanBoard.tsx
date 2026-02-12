'use client';

import { useState, useEffect } from 'react';
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
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard, TaskCard } from './KanbanCard';

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

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, newStatus: string) => Promise<void>;
  onTaskClick?: (task: Task) => void;
}

export default function KanbanBoard({ tasks: initialTasks, onTaskUpdate, onTaskClick }: KanbanBoardProps) {
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

  // Group tasks by status
  const columns = {
    'Pending': tasks.filter(t => t.status === 'Pending'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Completed': tasks.filter(t => t.status === 'Completed'),
  };

  const findContainer = (id: string) => {
    if (id in columns) return id;
    const task = tasks.find(t => t.id === id);
    return task ? task.status : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Moving between columns logic could be here for "live" preview
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
            prev.map(t => t.id === activeId ? { ...t, status: newStatus } : t)
        );

        // API Call
        try {
            await onTaskUpdate(activeId, newStatus);
        } catch (error) {
            // Revert on error
            console.error("Failed to update task status", error);
            setTasks((prev) => 
                prev.map(t => t.id === activeId ? { ...t, status: activeContainer as string } : t)
            );
        }
    }

    setActiveTask(null);
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
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
      <div className="flex h-full gap-6 overflow-x-auto pb-4">
        <KanbanColumn 
            id="Pending" 
            title="รอดำเนินการ" 
            tasks={columns['Pending']} 
            count={columns['Pending'].length}
            color="bg-slate-400"
            onTaskClick={onTaskClick}
        />
        <KanbanColumn 
            id="In Progress" 
            title="กำลังดำเนินการ" 
            tasks={columns['In Progress']} 
            count={columns['In Progress'].length}
            color="bg-blue-500"
            onTaskClick={onTaskClick}
        />
        <KanbanColumn 
            id="Completed" 
            title="เสร็จสิ้น" 
            tasks={columns['Completed']} 
            count={columns['Completed'].length}
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
