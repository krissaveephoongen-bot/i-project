import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Statistic, Table, Tag, Space, Button, Tabs, Skeleton, Select, Alert } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardMetrics, useProjectSummaries, useUserWorkloads, useSCurveData } from '@/hooks/use-dashboard';

interface ProjectStats {
  id: string;
  name: string;
  status: string;
  progress: number;
  startDate: Date;
  endDate?: Date;
  budget: number;
  actualCost: number;
  taskCount: number;
  completedTasks: number;
  teamMembers: number;
  totalHours: number;
  allocatedHours: number;
}

interface TaskStats {
  id: string;
  title: string;
  status: string;
  progress: number;
  dueDate?: Date;
  assignee: string;
  estimatedHours: number;
  actualHours: number;
}

const ProjectDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [projectFilters, setProjectFilters] = useState<{
    status?: string;
    category?: string;
    priority?: string;
    isArchived?: boolean;
  }>({});

  // Use performance views for optimized data fetching
  const { data: dashboardMetrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: projectSummaries, isLoading: projectsLoading, refetch: refetchProjects } = useProjectSummaries(projectFilters);
  const { data: userWorkloads, isLoading: workloadsLoading } = useUserWorkloads();

  // Convert project summaries to component format
  const projects: ProjectStats[] = projectSummaries?.map(p => ({
    id: p.id,
    name: p.name,
    status: p.status,
    progress: p.progress,
    startDate: new Date(p.start_date),
    endDate: p.end_date ? new Date(p.end_date) : undefined,
    budget: p.budget || 0,
    actualCost: p.actual_cost,
    taskCount: p.total_tasks,
    completedTasks: p.completed_tasks,
    teamMembers: 0, // Not available in summary view
    totalHours: p.total_hours,
    allocatedHours: 0, // Not available in summary view
  })) || [];

  // Mock tasks data for now (would come from task progress view)
  const [tasks] = useState<TaskStats[]>([]);

  const loading = metricsLoading || projectsLoading || workloadsLoading;

  const projectColumns = [
    {
      title: 'Project',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: { [key: string]: string } = {
          PLANNING: 'blue',
          IN_PROGRESS: 'processing',
          COMPLETED: 'success',
          ON_HOLD: 'warning',
          CANCELLED: 'error',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress: number) => (
        <Progress percent={progress} size="small" status={progress === 100 ? 'success' : 'active'} />
      ),
    },
    {
      title: 'Tasks',
      key: 'tasks',
      render: (_: any, record: ProjectStats) => (
        <span>
          {record.completedTasks}/{record.taskCount}
        </span>
      ),
    },
    {
      title: 'Team',
      dataIndex: 'teamMembers',
      key: 'teamMembers',
      render: (count: number) => (
        <Space>
          <TeamOutlined />
          <span>{count}</span>
        </Space>
      ),
    },
    {
      title: 'Budget',
      key: 'budget',
      render: (_: any, record: ProjectStats) => (
        <div className="text-right">
          <div className="text-sm font-semibold">
            ${record.actualCost.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            of ${record.budget.toFixed(2)}
          </div>
        </div>
      ),
    },
  ];

  const taskColumns = [
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: { [key: string]: string } = {
          TODO: 'default',
          IN_PROGRESS: 'processing',
          DONE: 'success',
          BLOCKED: 'error',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number) => (
        <Progress
          type="circle"
          percent={progress}
          width={40}
          strokeColor={progress === 100 ? '#52c41a' : '#1890ff'}
        />
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: Date | undefined) =>
        date ? dayjs(date).format('MMM DD, YYYY') : 'N/A',
    },
    {
      title: 'Hours',
      key: 'hours',
      render: (_: any, record: TaskStats) => (
        <div className="text-right text-sm">
          <div className="font-semibold">{record.actualHours}h</div>
          <div className="text-gray-500">{record.estimatedHours}h est.</div>
        </div>
      ),
    },
  ];

  // Calculate summary statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS').length;
  const avgProgress =
    projects.length > 0
      ? (projects.reduce((sum, p) => sum + p.progress, 0) / projects.length).toFixed(0)
      : 0;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.actualCost, 0);
  const budgetVariance = totalBudget - totalSpent;
  const totalTeamMembers = projects.reduce((sum, p) => sum + p.teamMembers, 0);

  if (loading) {
    return <Skeleton active />;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={totalProjects}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={activeProjects}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Progress"
              value={avgProgress}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Team Members"
              value={totalTeamMembers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Budget Summary */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Budget Overview">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    ${totalBudget.toFixed(2)}
                  </div>
                  <div className="text-gray-500">Total Budget</div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    ${totalSpent.toFixed(2)}
                  </div>
                  <div className="text-gray-500">Total Spent</div>
                </div>
              </Col>
            </Row>
            <div className="mt-6">
              <Progress
                percent={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0}
                format={(percent) => `${percent?.toFixed(0)}% of budget`}
              />
            </div>
            <div className="mt-4 text-center text-lg">
              <span
                className={
                  budgetVariance >= 0 ? 'text-green-600' : 'text-red-600'
                }
              >
                ${budgetVariance.toFixed(2)} remaining
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Hours Summary">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {projects.reduce((sum, p) => sum + p.allocatedHours, 0)}h
                  </div>
                  <div className="text-gray-500">Allocated Hours</div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {projects.reduce((sum, p) => sum + p.totalHours, 0)}h
                  </div>
                  <div className="text-gray-500">Hours Logged</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Projects and Tasks Tabs */}
      <Tabs
        items={[
          {
            key: 'projects',
            label: 'Projects',
            children: (
              <Card size="small">
                <Table
                  columns={projectColumns}
                  dataSource={projects}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </Card>
            ),
          },
          {
            key: 'tasks',
            label: 'My Tasks',
            children: (
              <Card size="small">
                <Table
                  columns={taskColumns}
                  dataSource={tasks}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ProjectDashboard;
