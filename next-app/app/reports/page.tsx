"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  DatePicker,
  Select,
  Button,
  Space,
  Table,
  Progress,
  Tag,
  Spin,
} from "antd";
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  ReloadOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  UserOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useAuth } from "../components/AuthProvider";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ReportData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalBudget: number;
  spentBudget: number;
  totalUsers: number;
  activeUsers: number;
}

interface ProjectReport {
  id: string;
  name: string;
  status: string;
  progress: number;
  budget_allocated: number;
  budget_spent: number;
  tasks_count: number;
  completed_tasks: number;
}

interface TaskReport {
  id: string;
  title: string;
  status: string;
  priority: number;
  assigned_to_name: string;
  project_name: string;
  due_date: string;
  completed_at?: string;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [projectReports, setProjectReports] = useState<ProjectReport[]>([]);
  const [taskReports, setTaskReports] = useState<TaskReport[]>([]);
  const [dateRange, setDateRange] = useState<any>(null);
  const [reportType, setReportType] = useState<string>("overview");

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (dateRange) {
        params.append("startDate", dateRange[0].format("YYYY-MM-DD"));
        params.append("endDate", dateRange[1].format("YYYY-MM-DD"));
      }
      if (reportType) {
        params.append("type", reportType);
      }

      const response = await fetch(`/api/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data.overview);
        setProjectReports(data.projects || []);
        setTaskReports(data.tasks || []);
      } else {
        console.error("Failed to fetch report data");
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append("startDate", dateRange[0].format("YYYY-MM-DD"));
        params.append("endDate", dateRange[1].format("YYYY-MM-DD"));
      }
      if (reportType) {
        params.append("type", reportType);
      }

      const response = await fetch(`/api/reports/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report-${reportType}-${dayjs().format("YYYY-MM-DD")}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  const projectColumns = [
    {
      title: "Project Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
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
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { color: "default", text: status };
        return <Tag color={config.color as any}>{config.text}</Tag>;
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
      title: "Budget Utilization",
      key: "budget_util",
      render: (record: ProjectReport) => (
        <div>
          <Progress 
            percent={record.budget_allocated ? 
              Math.round((record.budget_spent || 0) / record.budget_allocated * 100) : 0
            } 
            size="small"
            format={(percent) => `${percent}%`}
          />
          <div className="text-xs text-gray-500">
            ฿{record.budget_spent?.toLocaleString() || 0} / ฿{record.budget_allocated?.toLocaleString() || 0}
          </div>
        </div>
      ),
    },
    {
      title: "Tasks",
      key: "tasks",
      render: (record: ProjectReport) => (
        <Space direction="vertical" size="small">
          <div>Total: {record.tasks_count}</div>
          <div>Completed: {record.completed_tasks}</div>
          <Progress 
            percent={record.tasks_count ? 
              Math.round((record.completed_tasks || 0) / record.tasks_count * 100) : 0
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
      title: "Task Title",
      dataIndex: "title",
      key: "title",
      render: (text: string) => (
        <Space>
          <CheckSquareOutlined />
          <Text>{text}</Text>
        </Space>
      ),
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
        return <Tag color={config.color as any}>{config.text}</Tag>;
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: number) => {
        const priorityColors = ["green", "blue", "orange", "red", "purple"];
        const priorityLabels = ["Low", "Normal", "Medium", "High", "Critical"];
        return (
          <Tag color={priorityColors[priority - 1] as any}>
            {priorityLabels[priority - 1]}
          </Tag>
        );
      },
    },
    {
      title: "Assigned To",
      dataIndex: "assigned_to_name",
      key: "assigned_to_name",
      render: (text: string) => (
        <Space>
          <UserOutlined />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Project",
      dataIndex: "project_name",
      key: "project_name",
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date: string) => (
        <Text>{date ? dayjs(date).format("DD MMM YYYY") : "No due date"}</Text>
      ),
    },
    {
      title: "Completed Date",
      dataIndex: "completed_at",
      key: "completed_at",
      render: (date: string) => (
        <Text>{date ? dayjs(date).format("DD MMM YYYY") : "-"}</Text>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-6">
        <Spin spinning={loading}>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <Title level={2}>Reports & Analytics</Title>
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchReportData}
                >
                  Refresh
                </Button>
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={exportReport}
                  type="primary"
                >
                  Export
                </Button>
              </Space>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <RangePicker
                placeholder={["Start Date", "End Date"]}
                onChange={setDateRange}
                style={{ width: "100%" }}
              />
              <Select
                placeholder="Select Report Type"
                value={reportType}
                onChange={setReportType}
                style={{ width: "100%" }}
              >
                <Select.Option value="overview">Overview</Select.Option>
                <Select.Option value="projects">Projects</Select.Option>
                <Select.Option value="tasks">Tasks</Select.Option>
                <Select.Option value="financial">Financial</Select.Option>
                <Select.Option value="users">Users</Select.Option>
              </Select>
            </div>
          </div>

          {/* Overview Statistics */}
          {reportType === "overview" && reportData && (
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Projects"
                    value={reportData.totalProjects}
                    prefix={<ProjectOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Active Projects"
                    value={reportData.activeProjects}
                    prefix={<BarChartOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Tasks"
                    value={reportData.totalTasks}
                    prefix={<CheckSquareOutlined />}
                    valueStyle={{ color: "#faad14" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Completed Tasks"
                    value={reportData.completedTasks}
                    prefix={<LineChartOutlined />}
                    valueStyle={{ color: "#722ed1" }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* Financial Overview */}
          {reportType === "financial" && reportData && (
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} lg={8}>
                <Card>
                  <Statistic
                    title="Total Budget"
                    value={reportData.totalBudget}
                    prefix="฿"
                    precision={2}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Card>
                  <Statistic
                    title="Spent Budget"
                    value={reportData.spentBudget}
                    prefix="฿"
                    precision={2}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Card>
                  <Statistic
                    title="Budget Utilization"
                    value={reportData.totalBudget ? 
                      Math.round((reportData.spentBudget / reportData.totalBudget) * 100) : 0
                    }
                    suffix="%"
                    valueStyle={{ 
                      color: reportData.spentBudget > reportData.totalBudget ? "#ff4d4f" : "#52c41a" 
                    }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* User Overview */}
          {reportType === "users" && reportData && (
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} lg={8}>
                <Card>
                  <Statistic
                    title="Total Users"
                    value={reportData.totalUsers}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Card>
                  <Statistic
                    title="Active Users"
                    value={reportData.activeUsers}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Card>
                  <Statistic
                    title="User Activity Rate"
                    value={reportData.totalUsers ? 
                      Math.round((reportData.activeUsers / reportData.totalUsers) * 100) : 0
                    }
                    suffix="%"
                    valueStyle={{ color: "#722ed1" }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* Projects Table */}
          {(reportType === "projects" || reportType === "overview") && (
            <Card title="Project Performance" className="mb-6">
              <Table
                columns={projectColumns}
                dataSource={projectReports}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                scroll={{ x: 1000 }}
              />
            </Card>
          )}

          {/* Tasks Table */}
          {(reportType === "tasks" || reportType === "overview") && (
            <Card title="Task Performance">
              <Table
                columns={taskColumns}
                dataSource={taskReports}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                scroll={{ x: 1200 }}
              />
            </Card>
          )}
        </Spin>
      </Content>
    </Layout>
  );
}
