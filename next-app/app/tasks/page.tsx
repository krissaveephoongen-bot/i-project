
'use client';

import { useState } from 'react';
import Header from '@/app/components/Header';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { CheckCircle, Circle, MoreHorizontal, AlertCircle, ArrowUp, ArrowDown, ArrowRight, X, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ProfessionalTaskFilters } from './components/ProfessionalTaskFilters';
import { getTasks, deleteTask, Task } from '@/app/lib/tasks';
import TaskFormModal from './components/TaskFormModal';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { getTaskPageLabels, getTaskStatusLabel, getTaskPriorityLabel } from '@/lib/services/tasks.utils';
import { Button } from '@/app/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

const getPriorityIcon = (priority: string) => {
    switch (priority) {
        case 'urgent': return <ArrowUp className="w-4 h-4 text-red-500" />;
        case 'high': return <ArrowUp className="w-4 h-4 text-orange-500" />;
        case 'medium': return <ArrowRight className="w-4 h-4 text-yellow-500" />;
        case 'low': return <ArrowDown className="w-4 h-4 text-green-500" />;
        default: return null;
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'done':
        case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'in_progress': return <MoreHorizontal className="w-4 h-4 text-blue-500 animate-pulse" />;
        case 'cancelled': return <X className="w-4 h-4 text-slate-400" />;
        default: return <Circle className="w-4 h-4 text-slate-300" />;
    }
};

export default function TasksPage() {
    const sp = useSearchParams();
    const query = (sp?.get('q') as string) || '';
    const status = (sp?.get('status') as string) || '';
    const priority = (sp?.get('priority') as string) || '';
    const { language } = useLanguage();
    const labels = getTaskPageLabels(language);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

    const queryClient = useQueryClient();

    // Delete Task Mutation
    const deleteTaskMutation = useMutation({
        mutationFn: (taskId: string) => deleteTask(taskId),
        onSuccess: () => {
            toast.success('✅ ลบงานสำเร็จแล้ว');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setDeleteConfirm(null);
        },
        onError: (error: any) => {
            toast.error(`❌ ลบไม่สำเร็จ: ${error?.message || 'เกิดข้อผิดพลาด'}`);
        },
    });

    const tasksQuery = useQuery({
        queryKey: ['tasks', query, status, priority],
        queryFn: () => getTasks({ q: query, status, priority })
    });
    
    const tasks = tasksQuery.data || [];

    const handleOpenModal = (task?: Task) => {
        setEditingTask(task || null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (task: Task) => {
        setDeleteConfirm({ id: task.id, title: task.title });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm) return;
        deleteTaskMutation.mutate(deleteConfirm.id);
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Header
                title="Task Management"
                breadcrumbs={[{ label: 'Workspace', href: '/' }, { label: labels.title }]}
            />
            <div className="pt-24 px-6 pb-6 container mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{labels.title}</h1>
                        <p className="text-slate-500 mt-1">{language === 'th' ? 'จัดการงานและการมอบหมายของโครงการ' : 'Manage project tasks and assignments.'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <Button onClick={() => handleOpenModal()} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" /> {labels.addNew}
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">{language === 'th' ? 'งานทั้งหมด' : 'All Tasks'}</h2>
                                <p className="text-sm text-slate-500">{tasks.length} {language === 'th' ? 'งานที่พบ' : 'tasks found'}</p>
                            </div>
                            <ProfessionalTaskFilters />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600 w-1/3">{labels.taskName}</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">{labels.project}</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">{labels.assignee}</th>
                                    <th className="text-center py-3 px-6 text-sm font-medium text-slate-600">{labels.status}</th>
                                    <th className="text-center py-3 px-6 text-sm font-medium text-slate-600">{labels.priority}</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">{labels.dueDate}</th>
                                    <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">{language === 'th' ? 'การกระทำ' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tasks.map((task: any) => (
                                    <tr key={task.id} className="hover:bg-slate-50">
                                        <td className="py-3 px-6">
                                            <div className="font-medium text-slate-900">{task.title}</div>
                                            {task.description && <div className="text-xs text-slate-500 truncate max-w-[200px]">{task.description}</div>}
                                        </td>
                                        <td className="py-3 px-6 text-sm">
                                            {task.projects ? (
                                                <Link href={`/projects/${task.projects.id}`} className="text-blue-600 hover:underline">
                                                    {task.projects.name}
                                                </Link>
                                            ) : '-'}
                                        </td>
                                        <td className="py-3 px-6 text-sm text-slate-600">
                                            {task.assigned_user?.name || 'Unassigned'}
                                        </td>
                                        <td className="py-3 px-6 text-sm text-center">
                                             <span className="flex items-center justify-center gap-2 capitalize">
                                                 {getStatusIcon(task.status)}
                                                 {getTaskStatusLabel(task.status, language)}
                                             </span>
                                         </td>
                                         <td className="py-3 px-6 text-sm text-center">
                                             <span className="flex items-center justify-center gap-2 capitalize">
                                                 {getPriorityIcon(task.priority)}
                                                 {getTaskPriorityLabel(task.priority, language)}
                                             </span>
                                         </td>
                                        <td className="py-3 px-6 text-sm text-slate-600">
                                            {task.due_date ? new Date(task.due_date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }) : '-'}
                                        </td>
                                        <td className="py-3 px-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>{language === 'th' ? 'การกระทำ' : 'Actions'}</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleOpenModal(task)}>
                                                        <Edit className="h-4 w-4 mr-2" /> {labels.edit}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        className="text-red-600 cursor-pointer"
                                                        onClick={() => handleDeleteClick(task)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" /> {labels.delete}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {tasks.length === 0 && !tasksQuery.isLoading && (
                                    <tr>
                                        <td colSpan={7} className="py-8 px-6 text-center text-slate-500">{labels.noTasks}</td>
                                    </tr>
                                )}
                                {tasksQuery.isLoading && (
                                    <tr>
                                        <td colSpan={7} className="py-8 px-6 text-center text-slate-500">{labels.loading}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <TaskFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                task={editingTask}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationDialog
                open={!!deleteConfirm}
                title={language === 'th' ? 'ยืนยันการลบงาน' : 'Confirm Delete Task'}
                description={language === 'th' ? 'เมื่อลบงานนี้ จะไม่สามารถกู้คืนข้อมูลได้' : 'This action cannot be undone.'}
                entityName={deleteConfirm?.title}
                isLoading={deleteTaskMutation.isPending}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteConfirm(null)}
                isDangerous={true}
            />
        </div>
    );
}
