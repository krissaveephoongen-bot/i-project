/**
 * Task Management Component
 * Create, edit, delete tasks with status tracking
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import taskService from '../../services/taskService';
import './TaskManagement.css';

const TASK_STATUSES = ['todo', 'in-progress', 'review', 'completed'];
const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'];

function TaskManagement({ projectId }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        assignee: '',
        estimatedHours: '',
        dueDate: ''
    });

    // Load tasks on mount
    useEffect(() => {
        loadTasks();
    }, [projectId, filterStatus, filterPriority]);

    async function loadTasks() {
        try {
            setLoading(true);
            const filters = {
                projectId,
                ...(filterStatus && { status: filterStatus }),
                ...(filterPriority && { priority: filterPriority })
            };
            const response = await taskService.getTasks(filters);
            setTasks(response.tasks || []);
        } catch (error) {
            toast.error('Failed to load tasks');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Task name is required');
            return;
        }

        try {
            if (editingTask) {
                await taskService.updateTask(editingTask.id, formData);
                toast.success('Task updated successfully');
            } else {
                await taskService.createTask({
                    ...formData,
                    projectId
                });
                toast.success('Task created successfully');
            }
            resetForm();
            await loadTasks();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save task');
        }
    }

    async function handleDeleteTask(taskId) {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            await taskService.deleteTask(taskId);
            toast.success('Task deleted successfully');
            await loadTasks();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete task');
        }
    }

    async function handleStatusChange(taskId, newStatus) {
        try {
            await taskService.updateTaskStatus(taskId, newStatus);
            toast.success('Task status updated');
            await loadTasks();
        } catch (error) {
            toast.error('Failed to update status');
        }
    }

    function handleEditTask(task) {
        setEditingTask(task);
        setFormData({
            name: task.name,
            description: task.description || '',
            priority: task.priority || 'medium',
            status: task.status || 'todo',
            assignee: task.assignee || '',
            estimatedHours: task.estimated_hours || '',
            dueDate: task.due_date ? task.due_date.split('T')[0] : ''
        });
        setShowForm(true);
    }

    function resetForm() {
        setEditingTask(null);
        setFormData({
            name: '',
            description: '',
            priority: 'medium',
            status: 'todo',
            assignee: '',
            estimatedHours: '',
            dueDate: ''
        });
        setShowForm(false);
    }

    function getStatusColor(status) {
        const colors = {
            'todo': '#9CA3AF',
            'in-progress': '#3B82F6',
            'review': '#F59E0B',
            'completed': '#10B981'
        };
        return colors[status] || '#6B7280';
    }

    return (
        <div className="task-management">
            <div className="task-header">
                <h2>Task Management</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="btn btn-primary"
                >
                    <Plus size={18} /> New Task
                </button>
            </div>

            {/* Filters */}
            <div className="task-filters">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Statuses</option>
                    {TASK_STATUSES.map(status => (
                        <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                    ))}
                </select>

                <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Priorities</option>
                    {TASK_PRIORITIES.map(priority => (
                        <option key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Task Form */}
            {showForm && (
                <div className="task-form-container">
                    <form onSubmit={handleSubmit} className="task-form">
                        <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>

                        <div className="form-group">
                            <label>Task Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter task name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter task description"
                                rows="3"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Priority</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                >
                                    {TASK_PRIORITIES.map(p => (
                                        <option key={p} value={p}>
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    {TASK_STATUSES.map(s => (
                                        <option key={s} value={s}>
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Estimated Hours</label>
                                <input
                                    type="number"
                                    name="estimatedHours"
                                    value={formData.estimatedHours}
                                    onChange={handleInputChange}
                                    placeholder="Hours"
                                    step="0.5"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Due Date</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingTask ? 'Update Task' : 'Create Task'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tasks List */}
            {loading ? (
                <div className="loading">Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <div className="empty-state">
                    <Clock size={48} />
                    <p>No tasks yet. Create your first task!</p>
                </div>
            ) : (
                <div className="tasks-grid">
                    {tasks.map(task => (
                        <div key={task.id} className="task-card">
                            <div className="task-header-row">
                                <h4>{task.name}</h4>
                                <div className="task-actions">
                                    <button
                                        onClick={() => handleEditTask(task)}
                                        className="btn-icon btn-info"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="btn-icon btn-danger"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {task.description && (
                                <p className="task-description">{task.description}</p>
                            )}

                            <div className="task-meta">
                                <span
                                    className="badge-status"
                                    style={{ backgroundColor: getStatusColor(task.status) }}
                                >
                                    {task.status}
                                </span>
                                <span className={`badge-priority priority-${task.priority}`}>
                                    {task.priority}
                                </span>
                            </div>

                            {task.due_date && (
                                <p className="task-date">
                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TaskManagement;
