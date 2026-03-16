"use client";

import { useEffect, useState } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Typography,
  Space,
  Badge,
  Progress,
  Avatar,
  List,
  Button,
  message,
  Tag,
  Timeline,
  Dropdown,
  Calendar,
  Rate,
} from "antd";
import {
  ProjectOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  BarChartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  RocketOutlined,
  TeamOutlined,
  ContactsOutlined,
  FileTextOutlined,
  PlusOutlined,
  FilterOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useAuth } from "./components/AuthProvider";
import { useRouter } from "next/navigation";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled' | 'planning' | 'in_progress';
  progress: number;
  priority: 1 | 2 | 3 | 4 | 5;
  start_date: string;
  end_date: string;
  budget_allocated: number;
  budget_spent: number;
  created_by: string;
  team: string[];
  client: string;
  tags: string[];
  tasks?: number;
  completed_tasks?: number;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'project_created' | 'task_completed' | 'budget_approved' | 'team_update' | 'milestone_reached';
  timestamp: string;
  user: string;
  avatar?: string;
}

export default function ProjectCentricDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onTimeProjects: 0,
    atRiskProjects: 0,
    totalBudget: 0,
    spentBudget: 0,
    teamMembers: 13,
    totalClients: 8,
    activeTasks: 0,
    completedTasks: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch projects
      const projectsRes = await fetch("/api/projects");
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        const projectsList = projectsData.data || [];
        setProjects(projectsList);

        // Calculate project stats
        const totalProjects = projectsList.length;
        const activeProjects = projectsList.filter((p: Project) => 
          p.status === 'active' || p.status === 'in_progress'
        ).length;
        const completedProjects = projectsList.filter((p: Project) => 
          p.status === 'completed'
        ).length;
        const onTimeProjects = projectsList.filter((p: Project) => {
          const endDate = new Date(p.end_date);
          const today = new Date();
          return endDate <= today;
        }).length;
        const atRiskProjects = projectsList.filter((p: Project) => 
          p.priority >= 4 && (p.status === 'active' || p.status === 'in_progress')
        ).length;
        const totalBudget = projectsList.reduce((sum: number, p: Project) => 
          sum + (p.budget_allocated || 0), 0
        );
        const spentBudget = projectsList.reduce((sum: number, p: Project) => 
          sum + (p.budget_spent || 0), 0
        );

        // Fetch activities
        const activitiesRes = await fetch("/api/activities?limit=10");
        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          setActivities(activitiesData.data || []);
        }

        setStats({
          totalProjects,
          activeProjects,
          completedProjects,
          onTimeProjects,
          atRiskProjects,
          totalBudget,
          spentBudget,
          teamMembers: 13,
          totalClients: 8,
          activeTasks: projectsList.reduce((sum, p) => sum + (p.tasks || 0), 0),
          completedTasks: projectsList.reduce((sum, p) => sum + (p.completed_tasks || 0), 0),
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const projectColumns = [
    {
      title: "Project Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Project) => (
        <Space>
          <ProjectOutlined />
          <Button 
            type="link" 
            onClick={() => router.push(`/projects-complete`)}
            style={{ padding: 0, height: "auto" }}
          >
            {text}
          </Button>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusConfig = {
          active: { color: "processing", text: "Active" },
          completed: { color: "success", text: "Completed" },
          on_hold: { color: "warning", text: "On Hold" },
          cancelled: { color: "error", text: "Cancelled" },
          planning: { color: "default", text: "Planning" },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { color: "default", text: status };
        return <Badge status={config.color as any} text={config.text} />;
      },
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (progress: number) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={progress === 100 ? "success" : "active"}
          strokeColor={progress === 100 ? "#52c41a" : "#1890ff"}
        />
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: number) => {
        const priorityColors = ["#52c41a", "#1890ff", "#faad14", "#ff4d4f", "#722ed1"];
        const priorityLabels = ["Low", "Normal", "Medium", "High", "Critical"];
        return (
          <Tag color={priorityColors[priority - 1]}>
            {priorityLabels[priority - 1]}
          </Tag>
        );
      },
    },
    {
      title: "Budget",
      key: "budget",
      render: (record: Project) => (
        <Space direction="vertical" size="small">
          <Text>฿{record.budget_allocated?.toLocaleString() || 0}</Text>
          <Progress 
            percent={record.budget_allocated ? 
              Math.round((record.budget_spent || 0) / record.budget_allocated * 100) : 0
            } 
            size="small" 
            showInfo={false}
            strokeColor={record.budget_allocated ? 
              (record.budget_spent || 0) / record.budget_allocated > 0.9 ? "#ff4d4f" : "#52c41a"
            : "#1890ff"}
          />
        </Space>
      ),
    },
    {
      title: "Team",
      dataIndex: "team",
      key: "team",
      render: (team: string[]) => (
        <Space>
          {team.slice(0, 3).map((member, index) => (
            <Avatar key={index} size="small" style={{ marginRight: 4 }}>
              {member.charAt(0).toUpperCase()}
            </Avatar>
          ))}
          {team.length > 3 && (
            <Avatar size="small" style={{ backgroundColor: "#f0f0f0" }}>
              +{team.length - 3}
            </Avatar>
          )}
        </Space>
      ),
    },
  ];

  const activityItems = activities.map((activity) => ({
    key: activity.id,
    dot: activity.type === 'project_created' ? 'green' : 
           activity.type === 'task_completed' ? 'blue' : 
           activity.type === 'budget_approved' ? 'orange' : 'gray',
    children: (
      <div>
        <Text strong>{activity.title}</Text>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {activity.description}
        </Text>
        <Text type="secondary" style={{ fontSize: "11px", color: "#666" }}>
          {activity.timestamp}
        </Text>
      </div>
    ),
  }));

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white">
      <Header className="bg-white shadow-sm px-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={3} className="mb-0 text-gray-800">
              Dashboard
            </Title>
            <Text type="secondary">
              Welcome back, {user?.name || "User"}! Here's your project overview.
            </Text>
          </div>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Text>{user?.email}</Text>
          </Space>
        </div>
      </Header>

      <Content className="p-6">
        {/* Project Statistics */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <Statistic
                title="Total Projects"
                value={stats.totalProjects}
                prefix={<ProjectOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <Statistic
                title="Active Projects"
                value={stats.activeProjects}
                prefix={<RocketOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <Statistic
                title="On Time Projects"
                value={stats.onTimeProjects}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#13c2c2" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <Statistic
                title="At Risk Projects"
                value={stats.atRiskProjects}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Budget Overview */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} lg={8}>
            <Card 
              title="Budget Overview" 
              extra={
                <Dropdown
                  menu={{
                    items: [
                      { key: 'export-pdf', label: 'Export PDF' },
                      { key: 'export-excel', label: 'Export Excel' },
                    ]
                  }}
                >
                  <Button icon={<MoreOutlined />}>
                    More Options
                  </Button>
                </Dropdown>
              }
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Total Budget"
                    value={stats.totalBudget}
                    prefix="฿"
                    precision={2}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Spent Budget"
                    value={stats.spentBudget}
                    prefix="฿"
                    precision={2}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Col>
              </Row>
              <div className="mt-4">
                <Text type="secondary">Budget Utilization</Text>
                <Progress 
                  percent={stats.totalBudget ? 
                    Math.round((stats.spentBudget / stats.totalBudget) * 100) : 0
                  } 
                  strokeColor={stats.totalBudget ? 
                    (stats.spentBudget / stats.totalBudget) > 0.9 ? "#ff4d4f" : "#52c41a"
                  : "#1890ff"}
                  status="active"
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card 
              title="Recent Activity" 
              extra={<Button type="link" onClick={() => router.push("/activities")}>View All</Button>}
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <Timeline
                items={activityItems}
                mode="left"
                className="mt-4"
              />
            </Card>
          </Col>
        </Row>

        {/* Recent Projects Table */}
        <Card 
          title="Recent Projects" 
          extra={
            <Space>
              <Button icon={<FilterOutlined />}>Filter</Button>
              <Button 
                type="primary" 
                onClick={() => router.push("/projects-complete")}
              >
                View All Projects
              </Button>
            </Space>
          }
          className="hover:shadow-lg transition-shadow duration-300"
        >
          <Table
            columns={projectColumns}
            dataSource={projects.slice(0, 6)}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 800 }}
            onRow={(record) => ({
              onClick: () => router.push(`/projects-complete/${record.id}`),
              style: { cursor: 'pointer' }
            })}
          />
        </Card>
      </Content>
    </Layout>
  );
}
