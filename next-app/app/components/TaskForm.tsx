'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { X, Calendar, User, Flag, Clock, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Task } from '@/lib/tasks';
import { useLanguage } from '@/lib/hooks/useLanguage';

interface TaskFormProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  projects: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string }>;
  milestones: Array<{ id: string; title: string }>;
}

export default function TaskForm({ task, isOpen, onClose, onSave, projects, users, milestones }: TaskFormProps) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    estimatedHours: '',
    projectId: '',
    milestoneId: '',
    assignedTo: ''
  });

  const labels = {
    title: language === 'th' ? 'ชื่องาน' : 'Task Title',
    description: language === 'th' ? 'รายละเอียด' : 'Description',
    status: language === 'th' ? 'สถานะ' : 'Status',
    priority: language === 'th' ? 'ลำดับความสำคัญ' : 'Priority',
    dueDate: language === 'th' ? 'วันครบกำหนด' : 'Due Date',
    estimatedHours: language === 'th' ? 'ชั่วโมงที่ประเมิน' : 'Estimated Hours',
    project: language === 'th' ? 'โครงการ' : 'Project',
    milestone: language === 'th' ? 'ระยะงาน' : 'Milestone',
    assignee: language === 'th' ? 'ผู้รับผิดชอบ' : 'Assignee',
    save: language === 'th' ? 'บันทึก' : 'Save',
    cancel: language === 'th' ? 'ยกเลิก' : 'Cancel',
    createTask: language === 'th' ? 'สร้างงานใหม่' : 'Create New Task',
    editTask: language === 'th' ? 'แก้ไขงาน' : 'Edit Task',
    required: language === 'th' ? 'จำเป็น' : 'Required'
  };

  const statusOptions = [
    { value: 'todo', label: language === 'th' ? 'ทำ' : 'To Do' },
    { value: 'in-progress', label: language === 'th' ? 'กำลังทำ' : 'In Progress' },
    { value: 'review', label: language === 'th' ? 'รอตรวจ' : 'Review' },
    { value: 'done', label: language === 'th' ? 'เสร็จ' : 'Done' }
  ];

  const priorityOptions = [
    { value: 'low', label: language === 'th' ? 'ต่ำ' : 'Low' },
    { value: 'medium', label: language === 'th' ? 'ปานกลาง' : 'Medium' },
    { value: 'high', label: language === 'th' ? 'สูง' : 'High' },
    { value: 'urgent', label: language === 'th' ? 'เร่งด่วน' : 'Urgent' }
  ];

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        estimatedHours: task.estimatedHours?.toString() || '',
        projectId: task.projectId || '',
        milestoneId: task.milestoneId || '',
        assignedTo: task.assignedTo || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        estimatedHours: '',
        projectId: '',
        milestoneId: '',
        assignedTo: ''
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error(language === 'th' ? 'กรุณากรอกชื่องาน' : 'Please enter task title');
      return;
    }
    
    if (!formData.projectId) {
      toast.error(language === 'th' ? 'กรุณาเลือกโครงการ' : 'Please select a project');
      return;
    }

    setLoading(true);
    try {
      const payload: Partial<Task> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : 0,
        projectId: formData.projectId,
        milestoneId: formData.milestoneId || undefined,
        assignedTo: formData.assignedTo || undefined
      };

      if (task) {
        // Update existing task
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update task');
        }
        
        const updatedTask = await response.json();
        onSave(updatedTask);
        toast.success(language === 'th' ? 'อัปเดตงานสำเร็จ' : 'Task updated successfully');
      } else {
        // Create new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create task');
        }
        
        const newTask = await response.json();
        onSave(newTask);
        toast.success(language === 'th' ? 'สร้างงานสำเร็จ' : 'Task created successfully');
      }
      
      onClose();
    } catch (error: any) {
      toast.error(error.message || (language === 'th' ? 'เกิดข้อผิดพลาด' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {task ? <><Edit className="w-5 h-5" /> {labels.editTask}</> : <><Calendar className="w-5 h-5" /> {labels.createTask}</>}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                {labels.title} <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={language === 'th' ? 'กรอกชื่องาน...' : 'Enter task title...'}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{labels.description}</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === 'th' ? 'กรอกรายละเอียดงาน...' : 'Enter task description...'}
                rows={3}
              />
            </div>

            {/* Project, Milestone and Assignee */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {labels.project} <span className="text-red-500">*</span>
                </label>
                <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'th' ? 'เลือกโครงการ' : 'Select project'} />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Flag className="w-4 h-4" /> {labels.milestone}
                </label>
                <Select value={formData.milestoneId} onValueChange={(value) => setFormData({ ...formData, milestoneId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'th' ? 'เลือกระยะงาน' : 'Select milestone'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{language === 'th' ? 'ไม่ระบุ' : 'No milestone'}</SelectItem>
                    {milestones.map((milestone) => (
                      <SelectItem key={milestone.id} value={milestone.id}>
                        {milestone.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <User className="w-4 h-4" /> {labels.assignee}
                </label>
                <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'th' ? 'เลือกผู้รับผิดชอบ' : 'Select assignee'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{language === 'th' ? 'ไม่ได้มอบหมาย' : 'Unassigned'}</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{labels.status}</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Flag className="w-4 h-4" /> {labels.priority}
                </label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date and Estimated Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {labels.dueDate}
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {labels.estimatedHours}
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                {labels.cancel}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (language === 'th' ? 'กำลังบันทึก...' : 'Saving...') : labels.save}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
