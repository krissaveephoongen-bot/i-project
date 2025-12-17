/**
 * Resource Management Component
 * View resource allocation, team capacity, and availability
 */

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import resourceService from '../../services/resourceService';
import './ResourceManagement.css';

function ResourceManagement({ projectId = null }) {
    const [activeTab, setActiveTab] = useState('resources'); // resources, team, allocation, capacity
    const [resources, setResources] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [allocation, setAllocation] = useState(null);
    const [teamCapacity, setTeamCapacity] = useState({});
    const [loading, setLoading] = useState(true);
    const [filterDepartment, setFilterDepartment] = useState('');

    useEffect(() => {
        loadData();
    }, [projectId, activeTab, filterDepartment]);

    async function loadData() {
        try {
            setLoading(true);

            if (activeTab === 'resources') {
                const response = await resourceService.getResources({
                    department: filterDepartment
                });
                setResources(response.resources || []);
            } else if (activeTab === 'team' && projectId) {
                const response = await resourceService.getProjectTeam(projectId);
                setTeamMembers(response.teamMembers || []);
            } else if (activeTab === 'allocation' && projectId) {
                const response = await resourceService.getProjectAllocation(projectId);
                setAllocation(response);
            } else if (activeTab === 'capacity') {
                const response = await resourceService.getTeamCapacity(filterDepartment);
                setTeamCapacity(response.teamCapacity || {});
            }
        } catch (error) {
            toast.error('Failed to load resource data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const getWorkloadColor = (workload) => {
        switch (workload) {
            case 'Low':
                return '#10b981';
            case 'Medium':
                return '#f59e0b';
            case 'High':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    const getCapacityColor = (capacity) => {
        switch (capacity) {
            case 'Available':
                return '#10b981';
            case 'Moderate':
                return '#f59e0b';
            case 'At Capacity':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    return (
        <div className="resource-management">
            <div className="resource-header">
                <h2>Resource Management</h2>
            </div>

            {/* Tabs */}
            <div className="resource-tabs">
                <button
                    className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
                    onClick={() => setActiveTab('resources')}
                >
                    <Users size={18} /> All Resources
                </button>
                {projectId && (
                    <>
                        <button
                            className={`tab ${activeTab === 'team' ? 'active' : ''}`}
                            onClick={() => setActiveTab('team')}
                        >
                            <Users size={18} /> Team
                        </button>
                        <button
                            className={`tab ${activeTab === 'allocation' ? 'active' : ''}`}
                            onClick={() => setActiveTab('allocation')}
                        >
                            <TrendingUp size={18} /> Allocation
                        </button>
                    </>
                )}
                <button
                    className={`tab ${activeTab === 'capacity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('capacity')}
                >
                    <BarChart3 size={18} /> Capacity
                </button>
            </div>

            {/* Filter */}
            {(activeTab === 'resources' || activeTab === 'capacity') && (
                <div className="resource-filter">
                    <label>Department:</label>
                    <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Departments</option>
                        <option value="IT">IT</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                        <option value="Marketing">Marketing</option>
                    </select>
                </div>
            )}

            {loading ? (
                <div className="loading">Loading resource data...</div>
            ) : (
                <>
                    {/* All Resources Tab */}
                    {activeTab === 'resources' && (
                        <div className="resources-section">
                            {resources.length === 0 ? (
                                <div className="empty-state">
                                    <Users size={48} />
                                    <p>No resources found</p>
                                </div>
                            ) : (
                                <div className="resources-grid">
                                    {resources.map(resource => (
                                        <div key={resource.id} className="resource-card">
                                            <div className="resource-header-row">
                                                <h3>{resource.name}</h3>
                                                <span
                                                    className="utilization-badge"
                                                    style={{
                                                        backgroundColor:
                                                            resource.utilization < 50
                                                                ? '#10b981'
                                                                : resource.utilization < 80
                                                                    ? '#f59e0b'
                                                                    : '#ef4444'
                                                    }}
                                                >
                                                    {resource.utilization}%
                                                </span>
                                            </div>
                                            <p className="resource-position">{resource.position}</p>
                                            <p className="resource-email">{resource.email}</p>

                                            <div className="resource-stats">
                                                <div className="stat-item">
                                                    <span className="stat-label">Projects</span>
                                                    <span className="stat-value">{resource.projectsAssigned}</span>
                                                </div>
                                                <div className="stat-item">
                                                    <span className="stat-label">Tasks</span>
                                                    <span className="stat-value">{resource.tasksAssigned}</span>
                                                </div>
                                                <div className="stat-item">
                                                    <span className="stat-label">Completed</span>
                                                    <span className="stat-value">{resource.completedTasks}</span>
                                                </div>
                                            </div>

                                            <div className="progress-section">
                                                <div className="progress-label">
                                                    <span>Progress</span>
                                                    <span>{resource.avgProgress.toFixed(1)}%</span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-fill"
                                                        style={{ width: `${resource.avgProgress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <p className="resource-hours">
                                                Allocated: <strong>{resource.allocatedHours.toFixed(1)} hrs</strong>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Team Tab */}
                    {activeTab === 'team' && (
                        <div className="team-section">
                            {teamMembers.length === 0 ? (
                                <div className="empty-state">
                                    <Users size={48} />
                                    <p>No team members assigned</p>
                                </div>
                            ) : (
                                <div className="team-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Role</th>
                                                <th>Department</th>
                                                <th>Tasks</th>
                                                <th>Completed</th>
                                                <th>Hours</th>
                                                <th>Progress</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teamMembers.map(member => (
                                                <tr key={member.membershipId}>
                                                    <td className="name-cell">
                                                        <strong>{member.name}</strong>
                                                        <br />
                                                        <small>{member.email}</small>
                                                    </td>
                                                    <td>
                                                        <span className="badge-role">
                                                            {member.role}
                                                        </span>
                                                    </td>
                                                    <td>{member.department}</td>
                                                    <td className="center">{member.tasksInProject}</td>
                                                    <td className="center">{member.completedTasks}</td>
                                                    <td className="center">
                                                        {member.estimatedHours.toFixed(1)}
                                                    </td>
                                                    <td>
                                                        <div className="progress-bar-small">
                                                            <div
                                                                className="progress-fill"
                                                                style={{ width: `${member.avgProgress}%` }}
                                                            />
                                                        </div>
                                                        {member.avgProgress.toFixed(0)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Allocation Tab */}
                    {activeTab === 'allocation' && allocation && (
                        <div className="allocation-section">
                            <div className="allocation-summary">
                                <div className="summary-card">
                                    <p className="summary-label">Team Size</p>
                                    <p className="summary-value">{allocation.summary.teamSize}</p>
                                </div>
                                <div className="summary-card">
                                    <p className="summary-label">Total Hours</p>
                                    <p className="summary-value">
                                        {allocation.summary.totalAllocatedHours.toFixed(1)}
                                    </p>
                                </div>
                                <div className="summary-card">
                                    <p className="summary-label">Completed</p>
                                    <p className="summary-value">
                                        {allocation.summary.totalCompleted}/{allocation.summary.totalTasks}
                                    </p>
                                </div>
                                <div className="summary-card">
                                    <p className="summary-label">Progress</p>
                                    <p className="summary-value">{allocation.summary.overallProgress}%</p>
                                </div>
                            </div>

                            <div className="allocation-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Resource</th>
                                            <th>Role</th>
                                            <th>Tasks</th>
                                            <th>Completed</th>
                                            <th>Hours</th>
                                            <th>Remaining</th>
                                            <th>Progress</th>
                                            <th>Critical</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allocation.allocations.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <strong>{item.resourceName}</strong>
                                                </td>
                                                <td>
                                                    <span className="badge-role">{item.role}</span>
                                                </td>
                                                <td className="center">{item.taskCount}</td>
                                                <td className="center">{item.completedCount}</td>
                                                <td className="center">
                                                    {item.totalEstimatedHours.toFixed(1)}
                                                </td>
                                                <td className="center">
                                                    {item.remainingHours.toFixed(1)}
                                                </td>
                                                <td className="center">
                                                    {item.avgProgress.toFixed(0)}%
                                                </td>
                                                <td className="center">
                                                    {item.criticalTasks > 0 && (
                                                        <span className="critical-badge">
                                                            {item.criticalTasks}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Capacity Tab */}
                    {activeTab === 'capacity' && (
                        <div className="capacity-section">
                            {Object.keys(teamCapacity).length === 0 ? (
                                <div className="empty-state">
                                    <BarChart3 size={48} />
                                    <p>No capacity data available</p>
                                </div>
                            ) : (
                                Object.entries(teamCapacity).map(([department, members]) => (
                                    <div key={department} className="department-capacity">
                                        <h3>{department || 'Unassigned'}</h3>
                                        <div className="capacity-grid">
                                            {members.map(member => (
                                                <div key={member.id} className="capacity-card">
                                                    <div className="capacity-header">
                                                        <h4>{member.name}</h4>
                                                        <span
                                                            className="workload-badge"
                                                            style={{
                                                                backgroundColor: getWorkloadColor(member.workload)
                                                            }}
                                                        >
                                                            {member.workload}
                                                        </span>
                                                    </div>
                                                    <p className="capacity-position">{member.position}</p>

                                                    <div className="capacity-metrics">
                                                        <div className="metric">
                                                            <span className="metric-label">Projects</span>
                                                            <span className="metric-value">
                                                                {member.projectsCount}
                                                            </span>
                                                        </div>
                                                        <div className="metric">
                                                            <span className="metric-label">Active Tasks</span>
                                                            <span className="metric-value">
                                                                {member.activeTasks}
                                                            </span>
                                                        </div>
                                                        <div className="metric">
                                                            <span className="metric-label">Utilization</span>
                                                            <span className="metric-value">
                                                                {member.utilization}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="capacity-indicator">
                                                        <p className="indicator-label">Capacity Status</p>
                                                        <p
                                                            className="indicator-value"
                                                            style={{
                                                                color: getCapacityColor(member.capacity)
                                                            }}
                                                        >
                                                            {member.capacity}
                                                        </p>
                                                    </div>

                                                    <div className="hours-section">
                                                        <p>
                                                            <strong>{member.totalHours.toFixed(1)}</strong> hrs
                                                            allocated
                                                        </p>
                                                        <p>
                                                            <strong>{member.completedHours.toFixed(1)}</strong> hrs
                                                            completed
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ResourceManagement;
