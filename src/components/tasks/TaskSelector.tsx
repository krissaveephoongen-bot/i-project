import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Clock, LinkIcon } from 'lucide-react';
import { Task } from '@/services/dataService';

interface TaskSelectorProps {
    tasks: Task[];
    onTaskSelect: (task: Task) => void;
    trigger?: React.ReactNode;
}

/**
 * TaskSelector Component
 * Allows selection of a task with options to view details or log time
 * Integrates with Tasks page and Timesheet
 */
export function TaskSelector({
    tasks,
    onTaskSelect,
    trigger,
}: TaskSelectorProps) {
    const navigate = useNavigate();

    const handleTaskSelect = useCallback((task: Task) => {
        onTaskSelect(task);
    }, [onTaskSelect]);

    const handleLogTime = useCallback((task: Task) => {
        // Navigate to Timesheet with task pre-selected
        navigate('/timesheet', {
            state: {
                selectedTask: {
                    id: task.id,
                    title: task.title,
                    projectId: task.projectId,
                },
            },
        });
    }, [navigate]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Select Task</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Select a Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    {tasks.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">No tasks available</p>
                    ) : (
                        tasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                                        {task.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 truncate">{task.description}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            {task.status}
                                        </span>
                                        <span className="text-xs text-gray-500">{task.dueDate}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleTaskSelect(task)}
                                        title="Select this task"
                                    >
                                        <LinkIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleLogTime(task)}
                                        title="Log time for this task"
                                    >
                                        <Clock className="h-4 w-4 mr-1" />
                                        Log Time
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
