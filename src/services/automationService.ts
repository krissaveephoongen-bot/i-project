import { toast } from 'react-hot-toast';
import { Task, Project, User } from './dataService';

// Automation Workflows Service
class AutomationService {
    // Automated task creation from templates
    async createTasksFromTemplate(projectId: string, templateName: string): Promise<string[]> {
        try {
            // Fetch templates from database
            const response = await fetch(`/api/templates/${templateName}/tasks`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch template '${templateName}' from database`);
            }

            const templateTasks = await response.json();

            // Create tasks from template via API
            const createdTaskIds: string[] = [];

            for (const taskTemplate of templateTasks) {
                try {
                    const createResponse = await fetch(`/api/projects/${projectId}/tasks`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                        body: JSON.stringify(taskTemplate),
                    });

                    if (!createResponse.ok) {
                        throw new Error('Failed to create task');
                    }

                    const createdTask = await createResponse.json();
                    createdTaskIds.push(createdTask.id);

                    console.log(`Created task from template: ${taskTemplate.title} for project ${projectId}`);
                } catch (error) {
                    console.error(`Failed to create task: ${taskTemplate.title}`, error);
                }
            }

            toast.success(`Created ${createdTaskIds.length} tasks from ${templateName} template`);
            return createdTaskIds;
        } catch (error) {
            toast.error(`Failed to create tasks from template: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Template Automation Error:', error);
            return [];
        }
    }

    // Automated task prioritization
    async autoPrioritizeTasks(tasks: Task[], projects: Project[]): Promise<Task[]> {
        try {
            // Simple prioritization algorithm - in real app this would be more sophisticated
            const prioritizedTasks = [...tasks].sort((a, b) => {
                // Priority order: high > medium > low
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1, 'urgent': 4 };

                // Consider project status and due dates
                const projectA = projects.find(p => p.id === a.projectId);
                const projectB = projects.find(p => p.id === b.projectId);

                const aScore = (priorityOrder[a.priority] || 1) * 100 +
                    (new Date(a.dueDate).getTime() - Date.now()) / (1000 * 60 * 60) +
                    (projectA?.priority === 'high' ? 50 : 0);

                const bScore = (priorityOrder[b.priority] || 1) * 100 +
                    (new Date(b.dueDate).getTime() - Date.now()) / (1000 * 60 * 60) +
                    (projectB?.priority === 'high' ? 50 : 0);

                return bScore - aScore; // Higher score comes first
            });

            toast.success('Tasks automatically prioritized');
            return prioritizedTasks;
        } catch (error) {
            toast.error('Failed to auto-prioritize tasks');
            console.error('Auto-Prioritization Error:', error);
            return [...tasks];
        }
    }

    // Automated resource allocation
    async autoAllocateResources(tasks: Task[], users: User[]): Promise<Record<string, string>> {
        try {
            const allocation: Record<string, string> = {};

            // Simple allocation algorithm - in real app this would consider skills, workload, etc.
            const availableUsers = [...users].sort((a, b) => a.workload - b.workload);

            for (const task of tasks) {
                if (!task.assignee) {
                    // Find user with lowest workload
                    const leastBusyUser = availableUsers[0];
                    if (leastBusyUser) {
                        allocation[task.id] = leastBusyUser.id;
                        // Simulate increased workload
                        leastBusyUser.workload = Math.min(100, leastBusyUser.workload + 10);
                        // Re-sort users by workload
                        availableUsers.sort((a, b) => a.workload - b.workload);
                    }
                }
            }

            toast.success(`Auto-allocated resources for ${Object.keys(allocation).length} tasks`);
            return allocation;
        } catch (error) {
            toast.error('Failed to auto-allocate resources');
            console.error('Auto-Allocation Error:', error);
            return {};
        }
    }

    // Automated status updates
    async autoUpdateTaskStatuses(tasks: Task[]): Promise<Task[]> {
        try {
            const updatedTasks = tasks.map(task => {
                // Check if task is overdue
                if (task.status !== 'completed' && new Date(task.dueDate) < new Date()) {
                    return {
                        ...task,
                        status: 'review' as const, // Use existing status type
                        updatedAt: new Date().toISOString()
                    };
                }

                // Check if task should be marked as in-progress based on start date
                if (task.status === 'todo' && new Date(task.startDate) <= new Date()) {
                    return {
                        ...task,
                        status: 'in-progress' as const,
                        updatedAt: new Date().toISOString()
                    };
                }

                return task;
            });

            const changedTasks = updatedTasks.filter((t, i) => t.status !== tasks[i].status);
            if (changedTasks.length > 0) {
                toast.success(`Auto-updated status for ${changedTasks.length} tasks`);
            }

            return updatedTasks;
        } catch (error) {
            toast.error('Failed to auto-update task statuses');
            console.error('Auto-Update Error:', error);
            return [...tasks];
        }
    }

    // Automated project health monitoring
    async monitorProjectHealth(projects: Project[], tasks: Task[]): Promise<Record<string, any>> {
        try {
            const healthReports: Record<string, any> = {};

            for (const project of projects) {
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const healthScore = this.calculateProjectHealthScore(project, projectTasks);

                healthReports[project.id] = {
                    projectId: project.id,
                    projectName: project.name,
                    healthScore,
                    status: healthScore >= 80 ? 'healthy' :
                        healthScore >= 60 ? 'stable' :
                            healthScore >= 40 ? 'at-risk' : 'critical',
                    recommendations: this.generateHealthRecommendations(project, projectTasks)
                };
            }

            // Check for projects needing attention
            const atRiskProjects = Object.values(healthReports).filter(r => r.status === 'at-risk' || r.status === 'critical');
            if (atRiskProjects.length > 0) {
                // Use info instead of warning since warning might not be available
                console.warn(`${atRiskProjects.length} projects need attention`);
            }

            return healthReports;
        } catch (error) {
            toast.error('Failed to monitor project health');
            console.error('Health Monitoring Error:', error);
            return {};
        }
    }

    // Calculate project health score
    private calculateProjectHealthScore(project: Project, tasks: Task[]): number {
        let score = 100;

        // Progress factor (30% weight)
        score -= (100 - project.progress) * 0.3;

        // Timeline factor (25% weight)
        const daysRemaining = Math.max(0, new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        const daysTotal = (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24);
        const timelineProgress = 1 - (daysRemaining / daysTotal);
        const timelineScore = Math.min(100, (project.progress / timelineProgress) * 100) || 100;
        score -= (100 - timelineScore) * 0.25;

        // Task completion factor (25% weight)
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 100;
        score -= (100 - taskCompletionRate) * 0.25;

        // Overdue tasks factor (20% weight)
        const overdueTasks = tasks.filter(t =>
            t.status !== 'completed' && new Date(t.dueDate) < new Date()
        ).length;
        const overduePenalty = Math.min(100, overdueTasks * 5);
        score -= overduePenalty * 0.20;

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    // Generate health recommendations
    private generateHealthRecommendations(project: Project, tasks: Task[]): string[] {
        const recommendations: string[] = [];

        // Progress recommendations
        if (project.progress < 50) {
            recommendations.push('Increase focus on project execution');
            recommendations.push('Consider breaking down large tasks');
        }

        // Timeline recommendations
        const daysRemaining = Math.max(0, new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysRemaining < 30 && project.progress < 80) {
            recommendations.push('Urgent: Project at risk of missing deadline');
            recommendations.push('Consider extending timeline or adding resources');
        }

        // Task recommendations
        const overdueTasks = tasks.filter(t =>
            t.status !== 'completed' && new Date(t.dueDate) < new Date()
        );
        if (overdueTasks.length > 0) {
            recommendations.push(`Address ${overdueTasks.length} overdue tasks immediately`);
        }

        return recommendations;
    }

    // Automated workflow execution
    async executeWorkflow(workflowName: string, params: any): Promise<any> {
        try {
            // Mock workflow definitions
            const workflows: Record<string, (params: any) => Promise<any>> = {
                'daily-status-update': async () => {
                    // Simulate daily status update workflow
                    console.log('Executing daily status update workflow');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return { success: true, message: 'Daily status update completed' };
                },
                'weekly-report-generation': async () => {
                    // Simulate weekly report generation
                    console.log('Generating weekly reports');
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    return { success: true, message: 'Weekly reports generated' };
                },
                'project-health-check': async () => {
                    // Simulate project health check
                    console.log('Running project health check');
                    await new Promise(resolve => setTimeout(resolve, 800));
                    return { success: true, message: 'Project health check completed' };
                }
            };

            const workflow = workflows[workflowName];
            if (!workflow) {
                throw new Error(`Workflow '${workflowName}' not found`);
            }

            const result = await workflow(params);
            toast.success(`Workflow '${workflowName}' executed successfully`);
            return result;
        } catch (error) {
            toast.error(`Failed to execute workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Workflow Execution Error:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    // Schedule recurring workflows
    setupRecurringWorkflows(): void {
        // In a real app, this would set up actual scheduled jobs
        console.log('Setting up recurring workflows...');

        // Daily status updates
        setInterval(() => {
            this.executeWorkflow('daily-status-update', {});
        }, 24 * 60 * 60 * 1000); // Every 24 hours

        // Weekly reports (every Monday at 9 AM)
        const now = new Date();
        const nextMonday = new Date(now);
        nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7));
        nextMonday.setHours(9, 0, 0, 0);

        const timeUntilMonday = nextMonday.getTime() - now.getTime();
        setTimeout(() => {
            this.executeWorkflow('weekly-report-generation', {});
            // Set up weekly recurrence
            setInterval(() => {
                this.executeWorkflow('weekly-report-generation', {});
            }, 7 * 24 * 60 * 60 * 1000);
        }, timeUntilMonday);

        // Project health checks (every 3 days)
        setInterval(() => {
            this.executeWorkflow('project-health-check', {});
        }, 3 * 24 * 60 * 60 * 1000);

        toast.success('Recurring workflows scheduled');
    }

    // Automated notifications
    async sendAutomatedNotifications(projects: Project[], tasks: Task[], users: User[]): Promise<void> {
        try {
            // Mock notification system
            const notifications: any[] = [];

            // Check for overdue tasks
            const overdueTasks = tasks.filter(t =>
                t.status !== 'completed' && new Date(t.dueDate) < new Date()
            );

            for (const task of overdueTasks) {
                const assignee = users.find(u => u.id === task.assignee);
                if (assignee) {
                    notifications.push({
                        userId: assignee.id,
                        message: `Task "${task.title}" is overdue`,
                        type: 'task-overdue',
                        priority: 'high'
                    });
                }
            }

            // Check for upcoming deadlines
            const upcomingDeadlines = projects.filter(p =>
                p.status !== 'completed' &&
                new Date(p.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            );

            for (const project of upcomingDeadlines) {
                for (const teamMemberId of project.teamMembers || []) {
                    const user = users.find(u => u.id === teamMemberId);
                    if (user) {
                        notifications.push({
                            userId: user.id,
                            message: `Project "${project.name}" deadline approaching in ${Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`,
                            type: 'project-deadline',
                            priority: 'medium'
                        });
                    }
                }
            }

            console.log(`Generated ${notifications.length} automated notifications`);
            toast.success(`Sent ${notifications.length} automated notifications`);
        } catch (error) {
            toast.error('Failed to send automated notifications');
            console.error('Notification Error:', error);
        }
    }
}

export const automationService = new AutomationService();