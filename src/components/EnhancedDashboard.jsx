/**
 * Enhanced Dashboard Component
 * Display statistics and charts
 */

import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, PieChart, Users, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import dashboardService from '../../services/dashboardService';
import './EnhancedDashboard.css';

function EnhancedDashboard({ projectId = null }) {
    const [stats, setStats] = useState(null);
    const [projectCharts, setProjectCharts] = useState([]);
    const [expenseCharts, setExpenseCharts] = useState([]);
    const [taskCharts, setTaskCharts] = useState([]);
    const [teamCharts, setTeamCharts] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, [projectId]);

    async function loadDashboardData() {
        try {
            setLoading(true);

            // Fetch all dashboard data in parallel
            const [statsRes, projectRes, expenseRes, taskRes, teamRes, summaryRes] = await Promise.all([
                dashboardService.getDashboardStats(projectId),
                dashboardService.getProjectCharts(),
                dashboardService.getExpenseCharts(),
                dashboardService.getTaskCharts(projectId),
                dashboardService.getTeamCharts(),
                dashboardService.getDashboardSummary()
            ]);

            setStats(statsRes.stats);
            setProjectCharts(projectRes.data || []);
            setExpenseCharts(expenseRes.data || []);
            setTaskCharts(taskRes.data || []);
            setTeamCharts(teamRes.data || []);
            setSummary(summaryRes.summary);
        } catch (error) {
            toast.error('Failed to load dashboard data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div className="enhanced-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <h1>Project Dashboard</h1>
                <button
                    onClick={loadDashboardData}
                    className="btn btn-secondary"
                >
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#EFF6FF' }}>
                            <CheckCircle size={24} color="#3B82F6" />
                        </div>
                        <div className="stat-content">
                            <h3>Total Projects</h3>
                            <p className="stat-value">{stats.total_projects}</p>
                            <small>{stats.active_projects} active</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#F0FDF4' }}>
                            <Clock size={24} color="#10B981" />
                        </div>
                        <div className="stat-content">
                            <h3>Tasks</h3>
                            <p className="stat-value">{stats.total_tasks}</p>
                            <small>{stats.completed_tasks} completed</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#FEF3C7' }}>
                            <Users size={24} color="#F59E0B" />
                        </div>
                        <div className="stat-content">
                            <h3>Team Members</h3>
                            <p className="stat-value">{stats.total_members}</p>
                            <small>Across all projects</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#FEE2E2' }}>
                            <DollarSign size={24} color="#EF4444" />
                        </div>
                        <div className="stat-content">
                            <h3>Expenses</h3>
                            <p className="stat-value">
                                ฿{parseFloat(stats.total_approved_expenses).toLocaleString('th-TH', {
                                    maximumFractionDigits: 0
                                })}
                            </p>
                            <small>
                                ฿{parseFloat(stats.total_pending_expenses).toLocaleString('th-TH', {
                                    maximumFractionDigits: 0
                                })} pending
                            </small>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="charts-section">
                <h2>Analytics</h2>

                {/* Project Progress */}
                {projectCharts.length > 0 && (
                    <div className="chart-container">
                        <h3>
                            <BarChart size={20} /> Project Progress
                        </h3>
                        <div className="chart-content">
                            <table className="chart-table">
                                <thead>
                                    <tr>
                                        <th>Project</th>
                                        <th>Progress</th>
                                        <th>Tasks</th>
                                        <th>Expenses</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projectCharts.slice(0, 5).map(project => (
                                        <tr key={project.name}>
                                            <td>{project.name}</td>
                                            <td>
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-fill"
                                                        style={{ width: `${project.progress}%` }}
                                                    />
                                                </div>
                                                {project.progress}%
                                            </td>
                                            <td>
                                                {project.completedTasks}/{project.totalTasks}
                                            </td>
                                            <td>
                                                ฿{parseFloat(project.totalExpenses).toLocaleString('th-TH', {
                                                    maximumFractionDigits: 0
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Expense Breakdown */}
                {expenseCharts.length > 0 && (
                    <div className="chart-container">
                        <h3>
                            <PieChart size={20} /> Expense Breakdown
                        </h3>
                        <div className="chart-content">
                            <table className="chart-table">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Count</th>
                                        <th>Total</th>
                                        <th>Approved</th>
                                        <th>Pending</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenseCharts.map(expense => (
                                        <tr key={expense.category}>
                                            <td>{expense.category}</td>
                                            <td>{expense.count}</td>
                                            <td>
                                                ฿{parseFloat(expense.total).toLocaleString('th-TH', {
                                                    maximumFractionDigits: 0
                                                })}
                                            </td>
                                            <td>
                                                ฿{parseFloat(expense.approved).toLocaleString('th-TH', {
                                                    maximumFractionDigits: 0
                                                })}
                                            </td>
                                            <td>
                                                ฿{parseFloat(expense.pending).toLocaleString('th-TH', {
                                                    maximumFractionDigits: 0
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Task Status Distribution */}
                {taskCharts.length > 0 && (
                    <div className="chart-container">
                        <h3>
                            <LineChart size={20} /> Task Status Distribution
                        </h3>
                        <div className="chart-content">
                            <div className="status-grid">
                                {taskCharts.map(task => (
                                    <div key={task.status} className="status-card">
                                        <p className="status-name">{task.status}</p>
                                        <p className="status-count">{task.count}</p>
                                        <p className="status-progress">
                                            Avg Progress: {task.avgProgress.toFixed(1)}%
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Team Utilization */}
                {teamCharts.length > 0 && (
                    <div className="chart-container">
                        <h3>
                            <Users size={20} /> Team Utilization
                        </h3>
                        <div className="chart-content">
                            <table className="chart-table">
                                <thead>
                                    <tr>
                                        <th>Team Member</th>
                                        <th>Projects</th>
                                        <th>Tasks</th>
                                        <th>Completed</th>
                                        <th>Avg Progress</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamCharts.slice(0, 10).map(member => (
                                        <tr key={member.id}>
                                            <td>{member.name}</td>
                                            <td>{member.projectsAssigned}</td>
                                            <td>{member.tasksAssigned}</td>
                                            <td>{member.completedTasks}</td>
                                            <td>{member.avgTaskProgress.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Section */}
            {summary && (
                <div className="summary-section">
                    <h2>Quick Summary</h2>
                    <div className="summary-grid">
                        <div className="summary-card">
                            <h4>Today's Activity</h4>
                            <p>
                                <strong>{summary.todayActivity.new_tasks_today}</strong> new tasks
                            </p>
                            <p>
                                <strong>
                                    ฿
                                    {parseFloat(summary.todayActivity.approved_today).toLocaleString('th-TH', {
                                        maximumFractionDigits: 0
                                    })}
                                </strong> expenses approved
                            </p>
                        </div>

                        {summary.upcomingMilestones.length > 0 && (
                            <div className="summary-card">
                                <h4>Upcoming Milestones</h4>
                                {summary.upcomingMilestones.slice(0, 3).map(milestone => (
                                    <p key={milestone.id}>
                                        <strong>{milestone.name}</strong>
                                        <br />
                                        {milestone.days_remaining} days remaining
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default EnhancedDashboard;
