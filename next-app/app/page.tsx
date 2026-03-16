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
} from "@ant-design/icons";
import { useAuth } from "./components/AuthProvider";
import { useRouter } from "next/navigation";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  priority: number;
  start_date: string;
  end_date: string;
  budget_allocated: number;
  budget_spent: number;
  created_by: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: number;
  due_date: string;
  assigned_to: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  read: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalBudget: 0,
    spentBudget: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
          p.status !== 'completed' && p.status !== 'cancelled'
        ).length;
        const completedProjects = projectsList.filter((p: Project) => 
          p.status === 'completed'
        ).length;
        const totalBudget = projectsList.reduce((sum: number, p: Project) => 
          sum + (p.budget_allocated || 0), 0
        );
        const spentBudget = projectsList.reduce((sum: number, p: Project) => 
          sum + (p.budget_spent || 0), 0
        );

        // Fetch tasks
        const tasksRes = await fetch("/api/tasks");
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          const tasksList = tasksData.data || [];
          setTasks(tasksList);

          // Calculate task stats
          const totalTasks = tasksList.length;
          const pendingTasks = tasksList.filter((t: Task) => 
            t.status !== 'completed'
          ).length;
          const completedTasks = tasksList.filter((t: Task) => 
            t.status === 'completed'
          ).length;

          setStats({
            totalProjects,
            activeProjects,
            completedProjects,
            totalTasks,
            pendingTasks,
            completedTasks,
            totalBudget,
            spentBudget,
          });
        }
      }

      // Fetch notifications
      const notificationsRes = await fetch("/api/notifications?pageSize=5");
      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData.data || []);
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
          <Text strong>{text}</Text>
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
          <Badge 
            color={priorityColors[priority - 1]} 
            text={priorityLabels[priority - 1]}
          />
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
          />
        </Space>
      ),
    },
  ];

  const taskColumns = [
    {
      title: "Task",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusConfig = {
          pending: { color: "warning", text: "Pending" },
          in_progress: { color: "processing", text: "In Progress" },
          completed: { color: "success", text: "Completed" },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { color: "default", text: status };
        return <Badge status={config.color as any} text={config.text} />;
      },
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date: string) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{date ? new Date(date).toLocaleDateString() : "No due date"}</Text>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header className="bg-white shadow-sm px-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={3} className="mb-0 text-gray-800">
              Dashboard
            </Title>
            <Text type="secondary">
              Welcome back, {user?.name || "User"}
            </Text>
          </div>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Text>{user?.email}</Text>
          </Space>
        </div>
      </Header>

      <Content className="p-6">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Projects"
                value={stats.totalProjects}
                prefix={<ProjectOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Projects"
                value={stats.activeProjects}
                prefix={<RocketOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Tasks"
                value={stats.totalTasks}
                prefix={<CheckSquareOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Completed Tasks"
                value={stats.completedTasks}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Budget Overview */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={12}>
            <Card title="Budget Overview" extra={<Button type="link">View All</Button>}>
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
                  status="active"
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Recent Notifications" extra={<Button type="link">View All</Button>}>
              <List
                dataSource={notifications}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong={!item.read}>{item.title}</Text>
                          {!item.read && <Badge dot />}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary">{item.message}</Text>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            {new Date(item.created_at).toLocaleString()}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Projects Table */}
        <Card 
          title="Recent Projects" 
          extra={<Button type="primary" onClick={() => router.push("/projects")}>View All</Button>}
        >
          <Table
            columns={projectColumns}
            dataSource={projects.slice(0, 5)}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Tasks Table */}
        <Card 
          title="Recent Tasks" 
          extra={<Button type="primary" onClick={() => router.push("/tasks")}>View All</Button>}
          className="mt-6"
        >
          <Table
            columns={taskColumns}
            dataSource={tasks.slice(0, 5)}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 600 }}
          />
        </Card>
      </Content>
    </Layout>
  );
}
