"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Layout,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  DatePicker,
  Modal,
  Form,
  Card,
  Typography,
  Popconfirm,
  message,
  Badge,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckSquareOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useAuth } from "../components/AuthProvider";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
  due_date: string;
  assigned_to: string;
  project_id: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  users?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
  projects?: {
    name: string;
  };
}

const statusColors = {
  pending: "warning",
  in_progress: "processing",
  completed: "success",
  cancelled: "error",
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

export default function TasksPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<number | undefined>();
  const [assignedToFilter, setAssignedToFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, [currentPage, pageSize, searchText, statusFilter, priorityFilter, assignedToFilter, dateRange]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      if (searchText) params.append("search", searchText);
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter.toString());
      if (assignedToFilter) params.append("assignedTo", assignedToFilter);
      if (dateRange) {
        params.append("startDate", dateRange[0].format("YYYY-MM-DD"));
        params.append("endDate", dateRange[1].format("YYYY-MM-DD"));
      }

      const response = await fetch(`/api/tasks?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.data || []);
        setTotal(data.total || 0);
      } else {
        message.error("Failed to fetch tasks");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      message.error("Error loading tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects?pageSize=100");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users?pageSize=100");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreate = () => {
    setEditingTask(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      due_date: task.due_date ? dayjs(task.due_date) : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        message.success("Task deleted successfully");
        fetchTasks();
      } else {
        message.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      message.error("Error deleting task");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        due_date: values.due_date?.format("YYYY-MM-DD"),
        created_by: user?.id,
      };

      const url = editingTask 
        ? `/api/tasks/${editingTask.id}`
        : "/api/tasks";
      const method = editingTask ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success(`Task ${editingTask ? "updated" : "created"} successfully`);
        setIsModalVisible(false);
        fetchTasks();
      } else {
        message.error(`Failed to ${editingTask ? "update" : "create"} task`);
      }
    } catch (error) {
      console.error("Error saving task:", error);
      message.error("Error saving task");
    }
  };

  const columns = [
    {
      title: "Task",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Task) => (
        <Space>
          <CheckSquareOutlined />
          <div>
            <div className="font-medium">{text}</div>
            {record.description && (
              <div className="text-sm text-gray-500">{record.description}</div>
            )}
          </div>
        </Space>
      ),
      sorter: true,
    },
    {
      title: "Project",
      dataIndex: "projects",
      key: "project",
      render: (project: any) => project?.name || "Unassigned",
      filters: projects.map((p: any) => ({ text: p.name, value: p.id })),
    },
    {
      title: "Assigned To",
      dataIndex: "users",
      key: "assigned_to",
      render: (user: any, record: Task) => (
        <Space>
          <Avatar 
            size="small" 
            src={user?.avatar_url} 
            icon={<UserOutlined />}
          />
          <span>{user?.name || "Unassigned"}</span>
        </Space>
      ),
      filters: users.map((u: any) => ({ text: u.name, value: u.id })),
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
        { text: "Pending", value: "pending" },
        { text: "In Progress", value: "in_progress" },
        { text: "Completed", value: "completed" },
        { text: "Cancelled", value: "cancelled" },
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
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          <span>{date ? dayjs(date).format("DD MMM YYYY") : "No due date"}</span>
        </Space>
      ),
      sorter: true,
    },
    {
      title: "Hours",
      key: "hours",
      render: (record: Task) => (
        <Space direction="vertical" size="small">
          <div>Est: {record.estimated_hours || 0}h</div>
          <div>Actual: {record.actual_hours || 0}h</div>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record: Task) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this task?"
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
            <Title level={2}>Tasks</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              New Task
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Search
              placeholder="Search tasks..."
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
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="in_progress">In Progress</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
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
            <Select
              placeholder="Filter by assignee"
              allowClear
              value={assignedToFilter}
              onChange={setAssignedToFilter}
              style={{ width: "100%" }}
            >
              {users.map((u: any) => (
                <Select.Option key={u.id} value={u.id}>
                  {u.name}
                </Select.Option>
              ))}
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
            dataSource={tasks}
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
            scroll={{ x: 1400 }}
          />
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          title={editingTask ? "Edit Task" : "Create Task"}
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
              status: "pending",
              priority: 2,
            }}
          >
            <Form.Item
              name="title"
              label="Task Title"
              rules={[{ required: true, message: "Please enter task title" }]}
            >
              <Input placeholder="Enter task title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea rows={3} placeholder="Enter task description" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="project_id"
                label="Project"
                rules={[{ required: true, message: "Please select project" }]}
              >
                <Select placeholder="Select project">
                  {projects.map((project: any) => (
                    <Select.Option key={project.id} value={project.id}>
                      {project.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="assigned_to"
                label="Assigned To"
                rules={[{ required: true, message: "Please select assignee" }]}
              >
                <Select placeholder="Select assignee">
                  {users.map((user: any) => (
                    <Select.Option key={user.id} value={user.id}>
                      {user.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select>
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="in_progress">In Progress</Select.Option>
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

              <Form.Item
                name="due_date"
                label="Due Date"
                rules={[{ required: true, message: "Please select due date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="estimated_hours"
                label="Estimated Hours"
              >
                <Input 
                  type="number" 
                  min={0}
                  placeholder="Enter estimated hours"
                />
              </Form.Item>

              <Form.Item
                name="actual_hours"
                label="Actual Hours"
              >
                <Input 
                  type="number" 
                  min={0}
                  placeholder="Enter actual hours"
                />
              </Form.Item>
            </div>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}
