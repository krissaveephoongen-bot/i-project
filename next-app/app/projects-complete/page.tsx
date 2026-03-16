"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Layout,
  Row,
  Col,
  Card,
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Tag,
  Progress,
  Avatar,
  Dropdown,
  Menu,
  Space,
  Typography,
  Statistic,
  Timeline,
  Badge,
  Tooltip,
  Modal,
  Form,
  message,
  Tabs,
  Empty,
  Spin,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  ExportOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
  CalendarOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  UserOutlined,
  DollarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Mock data
const mockProjects = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete redesign of company website with modern UI/UX",
    status: "in_progress",
    priority: "high",
    progress: 80,
    budget: 50000,
    budgetSpent: 25000,
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    team: ["John Doe", "Jane Smith", "Mike Johnson"],
    client: "Tech Corp",
    tags: ["Web Development", "Design"],
    tasks: 8,
    completedTasks: 6,
    lastUpdated: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Native mobile app for iOS and Android platforms",
    status: "planning",
    priority: "medium",
    progress: 40,
    budget: 100000,
    budgetSpent: 5000,
    startDate: "2024-02-01",
    endDate: "2024-12-31",
    team: ["Alice Brown", "Bob Wilson"],
    client: "Startup Inc",
    tags: ["Mobile", "Development"],
    tasks: 15,
    completedTasks: 5,
    lastUpdated: "2024-01-14T15:45:00Z",
  },
  {
    id: "3",
    name: "Database Migration",
    description: "Migrate legacy database to new PostgreSQL system",
    status: "completed",
    priority: "low",
    progress: 100,
    budget: 25000,
    budgetSpent: 22000,
    startDate: "2023-11-01",
    endDate: "2024-01-31",
    team: ["Charlie Davis"],
    client: "Enterprise Ltd",
    tags: ["Database", "Migration"],
    tasks: 10,
    completedTasks: 10,
    lastUpdated: "2024-01-20T09:15:00Z",
  },
];

const statusColors = {
  in_progress: "#1890ff",
  planning: "#faad14",
  completed: "#52c41a",
  on_hold: "#ff4d4f",
};

const statusLabels = {
  in_progress: "In Progress",
  planning: "Planning",
  completed: "Completed",
  on_hold: "On Hold",
};

const priorityColors = {
  high: "#ff4d4f",
  medium: "#faad14",
  low: "#52c41a",
};

export default function ProjectsCompletePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState(mockProjects);
  const [filteredProjects, setFilteredProjects] = useState(mockProjects);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Filter projects
  useEffect(() => {
    let filtered = projects;

    if (searchText) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchText.toLowerCase()) ||
        project.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchText, statusFilter, priorityFilter]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
  };

  const handlePriorityFilter = (value: string) => {
    setPriorityFilter(value);
  };

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setModalVisible(true);
  };

  const handleEditProject = (project: any) => {
    message.info(`Edit project: ${project.name}`);
  };

  const handleDeleteProject = (project: any) => {
    Modal.confirm({
      title: "Delete Project",
      content: `Are you sure you want to delete "${project.name}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        setProjects(projects.filter(p => p.id !== project.id));
        message.success("Project deleted successfully");
      },
    });
  };

  const columns = [
    {
      title: "Project Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <Space>
          <Avatar style={{ backgroundColor: "#1890ff" }} icon={<FileTextOutlined />} />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.client}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status as keyof typeof statusColors]}>
          {statusLabels[status as keyof typeof statusLabels]}
        </Tag>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: string) => (
        <Tag color={priorityColors[priority as keyof typeof priorityColors]}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: "Budget",
      dataIndex: "budget",
      key: "budget",
      render: (budget: number, record: any) => (
        <div>
          <Text>${budget.toLocaleString()}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Spent: ${record.budgetSpent.toLocaleString()}
          </Text>
        </div>
      ),
    },
    {
      title: "Team",
      dataIndex: "team",
      key: "team",
      render: (team: string[]) => (
        <Avatar.Group maxCount={3} size="small">
          {team.map((member, index) => (
            <Avatar key={index} style={{ backgroundColor: "#87d068" }}>
              {member.split(" ").map(n => n[0]).join("")}
            </Avatar>
          ))}
        </Avatar.Group>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewProject(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditProject(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteProject(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderProjectCard = (project: any) => (
    <Card
      key={project.id}
      hoverable
      style={{ marginBottom: "16px" }}
      actions={[
        <EyeOutlined key="view" onClick={() => handleViewProject(project)} />,
        <EditOutlined key="edit" onClick={() => handleEditProject(project)} />,
        <MoreOutlined key="more" />,
      ]}
    >
      <Card.Meta
        avatar={<Avatar style={{ backgroundColor: "#1890ff" }} icon={<FileTextOutlined />} />}
        title={
          <Space>
            <Text strong>{project.name}</Text>
            <Tag color={statusColors[project.status as keyof typeof statusColors]}>
              {statusLabels[project.status as keyof typeof statusLabels]}
            </Tag>
          </Space>
        }
        description={
          <div>
            <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: "8px" }}>
              {project.description}
            </Paragraph>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">Client: {project.client}</Text>
                <Tag color={priorityColors[project.priority as keyof typeof priorityColors]}>
                  {project.priority.toUpperCase()}
                </Tag>
              </div>
              <Progress percent={project.progress} size="small" />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">
                  ${project.budgetSpent.toLocaleString()} / ${project.budget.toLocaleString()}
                </Text>
                <Text type="secondary">
                  {project.completedTasks}/{project.tasks} tasks
                </Text>
              </div>
            </Space>
          </div>
        }
      />
    </Card>
  );

  if (authLoading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <Layout.Header style={{ backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", padding: "0 24px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                📊 Projects Complete
              </Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button type="primary" icon={<PlusOutlined />}>
                New Project
              </Button>
              <Button icon={<ExportOutlined />}>
                Export
              </Button>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item key="profile" icon={<UserOutlined />}>
                      Profile
                    </Menu.Item>
                    <Menu.Item key="settings">
                      Settings
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item key="logout">
                      Logout
                    </Menu.Item>
                  </Menu>
                }
              >
                <Avatar style={{ backgroundColor: "#87d068" }}>
                  {user.name?.split(" ").map(n => n[0]).join("")}
                </Avatar>
              </Dropdown>
            </Space>
          </Col>
        </Row>
      </Layout.Header>

      {/* Top Bar - Filters */}
      <div style={{ backgroundColor: "#fff", padding: "16px 24px", borderBottom: "1px solid #f0f0f0" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search projects..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={handleStatusFilter}
              style={{ width: "100%" }}
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="in_progress">In Progress</Select.Option>
              <Select.Option value="planning">Planning</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="on_hold">On Hold</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Priority"
              value={priorityFilter}
              onChange={handlePriorityFilter}
              style={{ width: "100%" }}
            >
              <Select.Option value="all">All Priority</Select.Option>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="low">Low</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Space>
              <Button
                type={viewMode === "card" ? "primary" : "default"}
                icon={<FileTextOutlined />}
                onClick={() => setViewMode("card")}
              >
                Card View
              </Button>
              <Button
                type={viewMode === "table" ? "primary" : "default"}
                icon={<BarChartOutlined />}
                onClick={() => setViewMode("table")}
              >
                Table View
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Main Content */}
      <Layout.Content style={{ padding: "24px", minHeight: "calc(100vh - 128px)" }}>
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Projects"
                value={projects.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="In Progress"
                value={projects.filter(p => p.status === "in_progress").length}
                prefix={<SyncOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Completed"
                value={projects.filter(p => p.status === "completed").length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Budget"
                value={projects.reduce((sum, p) => sum + p.budget, 0)}
                prefix={<DollarOutlined />}
                precision={0}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Projects Display */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <Empty
            description="No projects found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : viewMode === "table" ? (
          <Table
            columns={columns}
            dataSource={filteredProjects}
            rowKey="id"
            pagination={{
              total: filteredProjects.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredProjects.map(renderProjectCard)}
          </Row>
        )}
      </Layout.Content>

      {/* Project Details Modal */}
      <Modal
        title={selectedProject?.name}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          <Button key="edit" type="primary">
            Edit Project
          </Button>,
        ]}
        width={800}
      >
        {selectedProject && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
              <Col span={12}>
                <Text strong>Status:</Text>
                <Tag color={statusColors[selectedProject.status as keyof typeof statusColors]}>
                  {statusLabels[selectedProject.status as keyof typeof statusLabels]}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>Priority:</Text>
                <Tag color={priorityColors[selectedProject.priority as keyof typeof priorityColors]}>
                  {selectedProject.priority.toUpperCase()}
                </Tag>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
              <Col span={12}>
                <Text strong>Client:</Text>
                <div>{selectedProject.client}</div>
              </Col>
              <Col span={12}>
                <Text strong>Team:</Text>
                <div>{selectedProject.team.join(", ")}</div>
              </Col>
            </Row>
            <Row style={{ marginBottom: "16px" }}>
              <Col span={24}>
                <Text strong>Description:</Text>
                <Paragraph>{selectedProject.description}</Paragraph>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
              <Col span={12}>
                <Text strong>Start Date:</Text>
                <div>{selectedProject.startDate}</div>
              </Col>
              <Col span={12}>
                <Text strong>End Date:</Text>
                <div>{selectedProject.endDate}</div>
              </Col>
            </Row>
            <Row style={{ marginBottom: "16px" }}>
              <Col span={24}>
                <Text strong>Progress:</Text>
                <Progress percent={selectedProject.progress} />
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Budget:</Text>
                <div>${selectedProject.budget.toLocaleString()}</div>
              </Col>
              <Col span={12}>
                <Text strong>Spent:</Text>
                <div>${selectedProject.budgetSpent.toLocaleString()}</div>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Text strong>Tags:</Text>
                <div style={{ marginTop: "8px" }}>
                  {selectedProject.tags.map((tag: string, index: number) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
