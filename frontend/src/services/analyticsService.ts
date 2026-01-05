import { toast } from 'react-hot-toast';
import { Task, Project, User } from './dataService';

// Advanced Analytics Service
class AnalyticsService {
    // Generate comprehensive project dashboard analytics
    async generateProjectDashboardAnalytics(projects: Project[], tasks: Task[]): Promise<any> {
        try {
            // Basic metrics
            const totalProjects = projects.length;
            const activeProjects = projects.filter(p => p.status === 'active').length;
            const completedProjects = projects.filter(p => p.status === 'completed').length;
            const onTimeCompletionRate = this.calculateOnTimeCompletionRate(projects);

            // Task metrics
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const overdueTasks = tasks.filter(t =>
                t.status !== 'completed' && new Date(t.dueDate) < new Date()
            ).length;

            // Budget analysis
            const budgetAnalysis = await this.analyzeProjectBudgets(projects);

            // Resource utilization
            const resourceUtilization = await this.analyzeResourceUtilization(projects, tasks);

            // Risk assessment
            const riskAssessment = this.assessProjectRisks(projects, tasks);

            return {
                summary: {
                    totalProjects,
                    activeProjects,
                    completedProjects,
                    completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
                    onTimeCompletionRate,
                },
                tasks: {
                    totalTasks,
                    completedTasks,
                    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
                    overdueTasks,
                    overdueRate: totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0,
                },
                budget: budgetAnalysis,
                resources: resourceUtilization,
                risks: riskAssessment,
                trends: this.analyzeTrends(projects, tasks),
                recommendations: this.generateRecommendations(projects, tasks),
            };
        } catch (error) {
            toast.error('Failed to generate project analytics');
            console.error('Analytics Error:', error);
            return { error: 'Failed to generate analytics' };
        }
    }

    // Calculate on-time completion rate
    private calculateOnTimeCompletionRate(projects: Project[]): number {
        const completedProjects = projects.filter(p => p.status === 'completed');
        if (completedProjects.length === 0) return 100;

        const onTimeProjects = completedProjects.filter(p =>
            new Date(p.endDate) >= new Date(p.updatedAt || p.createdAt)
        );

        return (onTimeProjects.length / completedProjects.length) * 100;
    }

    // Analyze project budgets
    private async analyzeProjectBudgets(projects: Project[]): Promise<any> {
        const activeProjects = projects.filter(p => p.status === 'active');
        if (activeProjects.length === 0) return { overallStatus: 'no-active-projects' };

        const totalBudget = activeProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const avgBudget = totalBudget / activeProjects.length;

        // Calculate actual budget variance from database
        let budgetVariance = 0;
        try {
            const response = await fetch('/api/analytics/budget-variance', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                budgetVariance = data.variance || 0;
            }
        } catch (error) {
            console.error('Error fetching budget variance:', error);
        }

        return {
            totalBudget,
            averageBudget: avgBudget,
            budgetVariance: parseFloat(budgetVariance.toFixed(2)),
            budgetStatus: budgetVariance > 5 ? 'over-budget' :
                budgetVariance < -5 ? 'under-budget' : 'on-budget',
            recommendations: budgetVariance > 5 ?
                ['Review project scope', 'Optimize resource allocation', 'Consider additional funding'] :
                budgetVariance < -5 ?
                    ['Potential cost savings available', 'Reallocate budget to other projects'] :
                    ['Budget is well managed', 'Continue current approach']
        };
    }

    // Analyze resource utilization
    private async analyzeResourceUtilization(projects: Project[], tasks: Task[]): Promise<any> {
        try {
            const response = await fetch('/api/analytics/resource-utilization', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch resource utilization data');
            }

            const resourceData = await response.json();
            const users = resourceData.users || [];

            const totalCapacity = users.reduce((sum: number, u: any) => sum + (u.capacity || 0), 0);
            const totalWorkload = users.reduce((sum: number, u: any) => sum + (u.workload || 0), 0);
            const utilizationRate = totalCapacity > 0 ? (totalWorkload / totalCapacity) * 100 : 0;

            // Find bottlenecks
            const bottlenecks = users.filter((u: any) => (u.workload || 0) > 90);
            const underutilized = users.filter((u: any) => (u.workload || 0) < 50);

            return {
                overallUtilization: parseFloat(utilizationRate.toFixed(2)),
                bottlenecks: bottlenecks.map((u: any) => ({
                    userId: u.id,
                    userName: u.name,
                    workload: u.workload,
                    status: 'overloaded'
                })),
                underutilizedResources: underutilized.map((u: any) => ({
                    userId: u.id,
                    userName: u.name,
                    workload: u.workload,
                    status: 'underutilized'
                })),
                recommendations: bottlenecks.length > 0 ?
                    ['Redistribute workload', 'Consider hiring additional resources', 'Review task priorities'] :
                    underutilized.length > 0 ?
                        ['Identify additional tasks for underutilized team members', 'Provide training opportunities'] :
                        ['Resource allocation is optimal', 'Monitor for changes']
            };
        } catch (error) {
            console.error('Error analyzing resource utilization:', error);
            return { error: 'Failed to analyze resource utilization' };
        }
    }

    // Assess project risks
    private assessProjectRisks(projects: Project[], tasks: Task[]): any {
        const activeProjects = projects.filter(p => p.status === 'active');
        const highRiskProjects = activeProjects.filter(p =>
            p.progress < 30 && new Date(p.endDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );

        const criticalTasks = tasks.filter(t =>
            t.status !== 'completed' &&
            new Date(t.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
            t.priority === 'high'
        );

        return {
            highRiskProjects: highRiskProjects.map(p => ({
                projectId: p.id,
                projectName: p.name,
                riskLevel: 'high',
                riskFactors: ['tight deadline', 'low progress']
            })),
            criticalTasks: criticalTasks.map(t => ({
                taskId: t.id,
                taskTitle: t.title,
                dueDate: t.dueDate,
                riskLevel: 'critical',
                projectId: t.projectId
            })),
            overallRiskScore: Math.min(100, highRiskProjects.length * 20 + criticalTasks.length * 15),
            recommendations: highRiskProjects.length > 0 || criticalTasks.length > 0 ?
                ['Conduct risk mitigation planning', 'Allocate additional resources', 'Review project timelines'] :
                ['Risk levels are acceptable', 'Continue monitoring']
        };
    }

    // Analyze trends over time
    private analyzeTrends(projects: Project[], tasks: Task[]): any {
        // Mock trend data - in real app this would use historical data
        const completionTrend = Math.random() * 20 - 10; // -10% to +10% change
        const productivityTrend = Math.random() * 15 - 7.5; // -7.5% to +7.5% change
        const qualityTrend = Math.random() * 10 - 5; // -5% to +5% change

        return {
            completionRateTrend: parseFloat(completionTrend.toFixed(2)),
            productivityTrend: parseFloat(productivityTrend.toFixed(2)),
            qualityTrend: parseFloat(qualityTrend.toFixed(2)),
            overallTrend: completionTrend + productivityTrend + qualityTrend > 0 ? 'positive' :
                completionTrend + productivityTrend + qualityTrend < 0 ? 'negative' : 'stable',
            trendAnalysis: completionTrend > 5 ?
                'Project completion rates are improving significantly' :
                completionTrend < -5 ?
                    'Project completion rates are declining - investigate causes' :
                    'Project completion rates are stable'
        };
    }

    // Generate AI-powered recommendations
    private generateRecommendations(projects: Project[], tasks: Task[]): string[] {
        const recommendations: string[] = [];

        // Project-specific recommendations
        const activeProjects = projects.filter(p => p.status === 'active');
        if (activeProjects.length > 5) {
            recommendations.push('Consider prioritizing projects to improve focus and resource allocation');
        }

        // Task-specific recommendations
        const overdueTasks = tasks.filter(t =>
            t.status !== 'completed' && new Date(t.dueDate) < new Date()
        );
        if (overdueTasks.length > 3) {
            recommendations.push('Address overdue tasks to prevent project delays');
        }

        // Resource recommendations
        const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
        if (highPriorityTasks.length > activeProjects.length * 2) {
            recommendations.push('Review high-priority task distribution across projects');
        }

        // Add some general best practices
        recommendations.push(
            'Implement regular project review meetings',
            'Use AI-powered task prioritization for optimal workflow',
            'Monitor resource utilization weekly for optimal allocation'
        );

        return recommendations;
    }

    // Generate detailed project report
    async generateProjectReport(project: Project, tasks: Task[], users: User[]): Promise<any> {
        try {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const completedTasks = projectTasks.filter(t => t.status === 'completed');
            const overdueTasks = projectTasks.filter(t =>
                t.status !== 'completed' && new Date(t.dueDate) < new Date()
            );

            // Calculate project health score (0-100)
            const healthScore = this.calculateProjectHealthScore(project, projectTasks);

            return {
                projectInfo: {
                    id: project.id,
                    name: project.name,
                    status: project.status,
                    progress: project.progress,
                    startDate: project.startDate,
                    endDate: project.endDate,
                    budget: project.budget,
                    healthScore,
                    healthStatus: healthScore >= 80 ? 'healthy' :
                        healthScore >= 60 ? 'stable' :
                            healthScore >= 40 ? 'at-risk' : 'critical'
                },
                taskMetrics: {
                    totalTasks: projectTasks.length,
                    completedTasks: completedTasks.length,
                    completionRate: projectTasks.length > 0 ?
                        (completedTasks.length / projectTasks.length) * 100 : 0,
                    overdueTasks: overdueTasks.length,
                    overdueRate: projectTasks.length > 0 ?
                        (overdueTasks.length / projectTasks.length) * 100 : 0,
                },
                timelineAnalysis: this.analyzeProjectTimeline(project, projectTasks),
                resourceAnalysis: this.analyzeProjectResources(project, users, projectTasks),
                riskAssessment: this.assessProjectSpecificRisks(project, projectTasks),
                recommendations: this.generateProjectSpecificRecommendations(project, projectTasks)
            };
        } catch (error) {
            toast.error('Failed to generate project report');
            console.error('Project Report Error:', error);
            return { error: 'Failed to generate project report' };
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

    // Analyze project timeline
    private analyzeProjectTimeline(project: Project, tasks: Task[]): any {
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);
        const today = new Date();
        const daysTotal = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        const daysElapsed = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        const daysRemaining = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

        const expectedProgress = daysTotal > 0 ? (daysElapsed / daysTotal) * 100 : 0;
        const progressVariance = project.progress - expectedProgress;

        return {
            daysTotal: Math.round(daysTotal),
            daysElapsed: Math.round(daysElapsed),
            daysRemaining: Math.round(daysRemaining),
            expectedProgress: parseFloat(expectedProgress.toFixed(2)),
            actualProgress: project.progress,
            progressVariance: parseFloat(progressVariance.toFixed(2)),
            timelineStatus: progressVariance > 10 ? 'ahead-of-schedule' :
                progressVariance < -10 ? 'behind-schedule' : 'on-schedule',
            criticalPathTasks: tasks.filter(t =>
                t.priority === 'high' && t.status !== 'completed'
            ).map(t => ({
                taskId: t.id,
                title: t.title,
                dueDate: t.dueDate,
                status: t.status
            }))
        };
    }

    // Analyze project resources
    private analyzeProjectResources(project: Project, users: User[], tasks: Task[]): any {
        // Mock resource allocation - in real app this would be actual data
        const teamMembers = users.filter(u => project.teamMembers?.includes(u.id));
        const totalCapacity = teamMembers.length * 40; // Assume 40 hours/week per team member
        const estimatedWork = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
        const actualWork = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

        return {
            teamSize: teamMembers.length,
            totalCapacity,
            estimatedWork,
            actualWork,
            utilizationRate: totalCapacity > 0 ? (actualWork / totalCapacity) * 100 : 0,
            resourceStatus: estimatedWork > totalCapacity * 1.2 ? 'overloaded' :
                estimatedWork < totalCapacity * 0.8 ? 'underutilized' : 'balanced',
            teamMembers: teamMembers.map(u => ({
                userId: u.id,
                name: u.name,
                role: u.role,
                workload: u.workload || 0
            }))
        };
    }

    // Assess project-specific risks
    private assessProjectSpecificRisks(project: Project, tasks: Task[]): any {
        const risks: any[] = [];

        // Timeline risk
        if (project.progress < 50 && new Date(project.endDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
            risks.push({
                type: 'timeline',
                level: 'high',
                description: 'Project is at risk of missing deadline',
                impact: 'Potential delay in deliverables',
                mitigation: 'Consider extending timeline or adding resources'
            });
        }

        // Budget risk (mock - would use actual budget data)
        if (Math.random() > 0.7) { // 30% chance of budget risk
            risks.push({
                type: 'budget',
                level: 'medium',
                description: 'Potential budget overrun detected',
                impact: 'May require additional funding',
                mitigation: 'Review expenses and optimize resource allocation'
            });
        }

        // Task completion risk
        const criticalOverdueTasks = tasks.filter(t =>
            t.priority === 'high' &&
            t.status !== 'completed' &&
            new Date(t.dueDate) < new Date()
        );

        if (criticalOverdueTasks.length > 0) {
            risks.push({
                type: 'task-completion',
                level: 'high',
                description: `${criticalOverdueTasks.length} critical tasks are overdue`,
                impact: 'May cause project delays and quality issues',
                mitigation: 'Reprioritize tasks and allocate additional resources'
            });
        }

        return {
            identifiedRisks: risks,
            overallRiskLevel: risks.length === 0 ? 'low' :
                risks.some(r => r.level === 'high') ? 'high' : 'medium',
            riskScore: risks.reduce((sum, r) =>
                sum + (r.level === 'high' ? 30 : r.level === 'medium' ? 15 : 5), 0
            )
        };
    }

    // Generate project-specific recommendations
    private generateProjectSpecificRecommendations(project: Project, tasks: Task[]): string[] {
        const recommendations: string[] = [];

        // Timeline recommendations
        if (project.progress < 50) {
            recommendations.push('Consider breaking down large tasks into smaller, manageable subtasks');
            recommendations.push('Implement daily stand-up meetings to improve progress tracking');
        }

        // Task management recommendations
        const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
        if (highPriorityTasks.length > 3) {
            recommendations.push('Focus on completing high-priority tasks to reduce project risk');
        }

        // Quality recommendations
        if (project.progress > 70) {
            recommendations.push('Implement thorough testing for completed features');
            recommendations.push('Conduct quality review sessions with stakeholders');
        }

        // General recommendations
        recommendations.push(
            'Review project scope and requirements regularly',
            'Maintain open communication with all stakeholders',
            'Document all decisions and changes for future reference'
        );

        return recommendations;
    }
}

export const analyticsService = new AnalyticsService();