"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Layout,
  Table,
  Button,
  Space,
  Tag,
  Progress,
  Input,
  Select,
  DatePicker,
  Modal,
  Form,
  Card,
  Typography,
  Popconfirm,
  message,
  Drawer,
  Badge,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import { useAuth } from "../components/AuthProvider";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: number;
  progress_percentage: number;
  start_date: string;
  end_date: string;
  budget_allocated: number;
  budget_spent: number;
  status_color?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  active: "processing",
  completed: "success",
  on_hold: "warning",
  cancelled: "error",
  planning: "default",
};

const priorityColors = {
  1: "green",
  2: "blue", 
  3: "orange",
  4: "red",
  5: "purple",
};

const priorityLabels = {
  1: "Low",
  2: "Normal",
  3: "Medium", 
  4: "High",
  5: "Critical",
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchProjects();
  }, [user, currentPage, pageSize, searchText, statusFilter, priorityFilter, dateRange]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      if (searchText) params.append("search", searchText);
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter.toString());
      if (dateRange) {
        params.append("startDate", dateRange[0].format("YYYY-MM-DD"));
        params.append("endDate", dateRange[1].format("YYYY-MM-DD"));
      }

      const response = await fetch(`/api/projects?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
        setTotal(data.total || 0);
      } else {
        message.error("Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      message.error("Error loading projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({
      ...project,
      start_date: project.start_date ? dayjs(project.start_date) : null,
      end_date: project.end_date ? dayjs(project.end_date) : null,
    });
    setIsModalVisible(true);
  };

  const handleView = (project: Project) => {
    setViewingProject(project);
    setIsDrawerVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        message.success("Project deleted successfully");
        fetchProjects();
      } else {
        message.error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      message.error("Error deleting project");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        start_date: values.start_date?.format("YYYY-MM-DD"),
        end_date: values.end_date?.format("YYYY-MM-DD"),
        created_by: user?.id,
      };

      const url = editingProject 
        ? `/api/projects/${editingProject.id}`
        : "/api/projects";
      const method = editingProject ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success(`Project ${editingProject ? "updated" : "created"} successfully`);
        setIsModalVisible(false);
        fetchProjects();
      } else {
        message.error(`Failed to ${editingProject ? "update" : "create"} project`);
      }
    } catch (error) {
      console.error("Error saving project:", error);
      message.error("Error saving project");
    }
  };

  const columns = [
    {
      title: "Project Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Project) => (
        <Space>
          <ProjectOutlined />
          <Button 
            type="link" 
            onClick={() => handleView(record)}
            style={{ padding: 0, height: "auto" }}
          >
            {text}
          </Button>
        </Space>
      ),
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge 
          status={statusColors[status as keyof typeof statusColors] as any}
          text={status.replace("_", " ").toUpperCase()}
        />
      ),
      filters: [
        { text: "Active", value: "active" },
        { text: "Completed", value: "completed" },
        { text: "On Hold", value: "on_hold" },
        { text: "Cancelled", value: "cancelled" },
        { text: "Planning", value: "planning" },
      ],
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: number) => (
        <Tag color={priorityColors[priority as keyof typeof priorityColors]}>
          {priorityLabels[priority as keyof typeof priorityLabels]}
        </Tag>
      ),
      filters: [
        { text: "Low", value: 1 },
        { text: "Normal", value: 2 },
        { text: "Medium", value: 3 },
        { text: "High", value: 4 },
        { text: "Critical", value: 5 },
      ],
    },
    {
      title: "Progress",
      dataIndex: "progress_percentage",
      key: "progress_percentage",
      render: (progress: number) => (
        <Progress 
          percent={progress} 
          size="small"
          status={progress === 100 ? "success" : "active"}
        />
      ),
      sorter: true,
    },
    {
      title: "Budget",
      key: "budget",
      render: (record: Project) => (
        <Space direction="vertical" size="small">
          <div>฿{record.budget_allocated?.toLocaleString() || 0}</div>
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
    {
      title: "Actions",
      key: "actions",
      render: (_, record: Project) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this project?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-6">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <Title level={2}>Projects</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              New Project
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Search
              placeholder="Search projects..."
              allowClear
              onSearch={setSearchText}
              style={{ width: "100%" }}
            />
            <Select
              placeholder="Filter by status"
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="on_hold">On Hold</Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
              <Select.Option value="planning">Planning</Select.Option>
            </Select>
            <Select
              placeholder="Filter by priority"
              allowClear
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: "100%" }}
            >
              <Select.Option value={1}>Low</Select.Option>
              <Select.Option value={2}>Normal</Select.Option>
              <Select.Option value={3}>Medium</Select.Option>
              <Select.Option value={4}>High</Select.Option>
              <Select.Option value={5}>Critical</Select.Option>
            </Select>
            <RangePicker
              placeholder={["Start Date", "End Date"]}
              onChange={setDateRange}
              style={{ width: "100%" }}
            />
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={projects}
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} items`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          title={editingProject ? "Edit Project" : "Create Project"}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => setIsModalVisible(false)}
          width={800}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              status: "planning",
              priority: 2,
              progress_percentage: 0,
            }}
          >
            <Form.Item
              name="name"
              label="Project Name"
              rules={[{ required: true, message: "Please enter project name" }]}
            >
              <Input placeholder="Enter project name" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea rows={3} placeholder="Enter project description" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select>
                  <Select.Option value="planning">Planning</Select.Option>
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="on_hold">On Hold</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
                  <Select.Option value="cancelled">Cancelled</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: "Please select priority" }]}
              >
                <Select>
                  <Select.Option value={1}>Low</Select.Option>
                  <Select.Option value={2}>Normal</Select.Option>
                  <Select.Option value={3}>Medium</Select.Option>
                  <Select.Option value={4}>High</Select.Option>
                  <Select.Option value={5}>Critical</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="start_date"
                label="Start Date"
                rules={[{ required: true, message: "Please select start date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="end_date"
                label="End Date"
                rules={[{ required: true, message: "Please select end date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="budget_allocated"
                label="Budget Allocated"
                rules={[{ required: true, message: "Please enter budget" }]}
              >
                <Input 
                  type="number" 
                  placeholder="Enter budget amount"
                  prefix="฿"
                />
              </Form.Item>

              <Form.Item
                name="progress_percentage"
                label="Progress (%)"
                rules={[{ required: true, message: "Please enter progress" }]}
              >
                <Input 
                  type="number" 
                  min={0}
                  max={100}
                  placeholder="Enter progress percentage"
                />
              </Form.Item>
            </div>
          </Form>
        </Modal>

        {/* View Drawer */}
        <Drawer
          title="Project Details"
          placement="right"
          size="large"
          open={isDrawerVisible}
          onClose={() => setIsDrawerVisible(false)}
        >
          {viewingProject && (
            <div className="space-y-4">
              <div>
                <Title level={4}>{viewingProject.name}</Title>
                <p>{viewingProject.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Status:</strong>
                  <div>
                    <Badge 
                      status={statusColors[viewingProject.status as keyof typeof statusColors] as any}
                      text={viewingProject.status.replace("_", " ").toUpperCase()}
                    />
                  </div>
                </div>
                <div>
                  <strong>Priority:</strong>
                  <div>
                    <Tag color={priorityColors[viewingProject.priority as keyof typeof priorityColors]}>
                      {priorityLabels[viewingProject.priority as keyof typeof priorityLabels]}
                    </Tag>
                  </div>
                </div>
              </div>

              <div>
                <strong>Progress:</strong>
                <Progress 
                  percent={viewingProject.progress_percentage} 
                  status={viewingProject.progress_percentage === 100 ? "success" : "active"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Start Date:</strong>
                  <div>{dayjs(viewingProject.start_date).format("DD MMM YYYY")}</div>
                </div>
                <div>
                  <strong>End Date:</strong>
                  <div>{dayjs(viewingProject.end_date).format("DD MMM YYYY")}</div>
                </div>
              </div>

              <div>
                <strong>Budget:</strong>
                <div>฿{viewingProject.budget_allocated?.toLocaleString()}</div>
                <Progress 
                  percent={viewingProject.budget_allocated ? 
                    Math.round((viewingProject.budget_spent || 0) / viewingProject.budget_allocated * 100) : 0
                  } 
                  status="active"
                />
                <div className="text-sm text-gray-500">
                  Spent: ฿{viewingProject.budget_spent?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          )}
        </Drawer>
      </Content>
    </Layout>
  );
}
