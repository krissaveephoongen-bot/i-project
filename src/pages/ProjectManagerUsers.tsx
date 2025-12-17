import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Input, Select, Tag, message, Modal, Form } from 'antd';
import {
    UserAddOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    LockOutlined,
    UnlockOutlined,
    KeyOutlined,
    CopyOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ScrollContainer from '@/components/layout/ScrollContainer';

const { Search } = Input;
const { Option } = Select;

interface ProjectManager {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    projectsManaged: number;
    joinDate: string;
    lastActive: string;
}

const ProjectManagerUsers = () => {
    const [managers, setManagers] = useState<ProjectManager[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [editingManager, setEditingManager] = useState<ProjectManager | null>(null);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [newPassword, setNewPassword] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Mock data for project managers
    const mockManagers: ProjectManager[] = [
        {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@company.com',
            role: 'Project Manager',
            status: 'active',
            projectsManaged: 5,
            joinDate: '2024-01-15',
            lastActive: '2024-12-17',
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@company.com',
            role: 'Senior Project Manager',
            status: 'active',
            projectsManaged: 8,
            joinDate: '2023-06-20',
            lastActive: '2024-12-16',
        },
        {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike.johnson@company.com',
            role: 'Project Manager',
            status: 'inactive',
            projectsManaged: 3,
            joinDate: '2024-03-10',
            lastActive: '2024-10-30',
        },
        {
            id: '4',
            name: 'Sarah Williams',
            email: 'sarah.williams@company.com',
            role: 'Project Manager',
            status: 'active',
            projectsManaged: 6,
            joinDate: '2023-11-05',
            lastActive: '2024-12-17',
        },
    ];

    const fetchManagers = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            // const response = await fetch(`${API_URL}/project-managers`);
            setManagers(mockManagers);
            setPagination({
                ...pagination,
                total: mockManagers.length,
            });
        } catch (error) {
            console.error('Error fetching project managers:', error);
            message.error('Failed to load project managers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManagers();
    }, []);

    const filteredManagers = managers.filter(manager => {
        const matchesSearch =
            manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            manager.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || manager.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAddManager = () => {
        setEditingManager(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEditManager = (manager: ProjectManager) => {
        setEditingManager(manager);
        form.setFieldsValue({
            name: manager.name,
            email: manager.email,
            role: manager.role,
            status: manager.status,
        });
        setIsModalOpen(true);
    };

    const handleDeleteManager = (managerId: string) => {
        Modal.confirm({
            title: 'Delete Project Manager',
            content: 'Are you sure you want to remove this project manager?',
            okText: 'Yes',
            cancelText: 'No',
            okButtonProps: { danger: true },
            onOk() {
                setManagers(managers.filter(m => m.id !== managerId));
                message.success('Project manager removed successfully');
            },
        });
    };

    const handleToggleStatus = (manager: ProjectManager) => {
        const newStatus = manager.status === 'active' ? 'inactive' : 'active';
        setManagers(
            managers.map(m =>
                m.id === manager.id ? { ...m, status: newStatus as 'active' | 'inactive' } : m
            )
        );
        message.success(`Project manager ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    };

    const handleResetPassword = (manager: ProjectManager) => {
        setEditingManager(manager);
        passwordForm.resetFields();
        setNewPassword(null);
        setIsPasswordModalOpen(true);
    };

    const handlePasswordModalOk = async () => {
        try {
            const values = await passwordForm.validateFields();

            if (!editingManager) return;

            const response = await fetch(`/api/prisma/users/${editingManager.id}/admin-reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword: values.password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update password');
            }

            setNewPassword(values.password);
            message.success('Password updated successfully');
            // Keep modal open to show the password
        } catch (error) {
            console.error('Error updating password:', error);
            message.error(error instanceof Error ? error.message : 'Failed to update password');
        }
    };

    const handleCopyPassword = () => {
        if (newPassword) {
            navigator.clipboard.writeText(newPassword);
            message.success('Password copied to clipboard');
        }
    };

    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setNewPassword(null);
        passwordForm.resetFields();
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            if (editingManager) {
                // Update existing manager
                setManagers(
                    managers.map(m =>
                        m.id === editingManager.id
                            ? {
                                ...m,
                                name: values.name,
                                email: values.email,
                                role: values.role,
                                status: values.status,
                            }
                            : m
                    )
                );
                message.success('Project manager updated successfully');
            } else {
                // Add new manager
                const newManager: ProjectManager = {
                    id: Date.now().toString(),
                    ...values,
                    projectsManaged: 0,
                    joinDate: new Date().toISOString().split('T')[0],
                    lastActive: new Date().toISOString().split('T')[0],
                };
                setManagers([...managers, newManager]);
                message.success('Project manager added successfully');
            }

            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.error('Form validation failed:', error);
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: ProjectManager, b: ProjectManager) => a.name.localeCompare(b.name),
            render: (text: string) => <strong>{text}</strong>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag color="blue">{role}</Tag>
            ),
        },
        {
            title: 'Projects Managed',
            dataIndex: 'projectsManaged',
            key: 'projectsManaged',
            sorter: (a: ProjectManager, b: ProjectManager) => a.projectsManaged - b.projectsManaged,
            align: 'center' as const,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'active' ? 'success' : 'default'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Join Date',
            dataIndex: 'joinDate',
            key: 'joinDate',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Last Active',
            dataIndex: 'lastActive',
            key: 'lastActive',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: ProjectManager) => (
                <Space size="middle">
                    <Button
                        type="text"
                        size="small"
                        icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
                        onClick={() => handleToggleStatus(record)}
                        title={record.status === 'active' ? 'Deactivate' : 'Activate'}
                    />
                    <Button
                        type="text"
                        icon={<KeyOutlined />}
                        onClick={() => handleResetPassword(record)}
                        title="Reset Password"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditManager(record)}
                        title="Edit"
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteManager(record.id)}
                        title="Delete"
                    />
                </Space>
            ),
        },
    ];

    return (
        <ScrollContainer>
            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Project Manager Users</h1>
                        <p className="text-gray-600 mt-1">Manage project managers and their assignments</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={handleAddManager}
                        size="large"
                    >
                        Add New Manager
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{managers.length}</div>
                            <div className="text-gray-600 mt-2">Total Managers</div>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                                {managers.filter(m => m.status === 'active').length}
                            </div>
                            <div className="text-gray-600 mt-2">Active Managers</div>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-600">
                                {managers.filter(m => m.status === 'inactive').length}
                            </div>
                            <div className="text-gray-600 mt-2">Inactive Managers</div>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">
                                {managers.reduce((sum, m) => sum + m.projectsManaged, 0)}
                            </div>
                            <div className="text-gray-600 mt-2">Projects Managed</div>
                        </div>
                    </Card>
                </div>

                {/* Search and Filter */}
                <Card>
                    <div className="flex flex-col md:flex-row gap-4">
                        <Search
                            placeholder="Search by name or email..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            onSearch={(value) => setSearchQuery(value)}
                            className="flex-1"
                            size="large"
                        />
                        <Select
                            placeholder="Filter by status"
                            allowClear
                            value={statusFilter || undefined}
                            onChange={(value) => setStatusFilter(value)}
                            className="w-full md:w-48"
                            size="large"
                        >
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchManagers}
                            size="large"
                        >
                            Refresh
                        </Button>
                    </div>
                </Card>

                {/* Managers Table */}
                <Card>
                    <Table
                        columns={columns}
                        dataSource={filteredManagers}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            pageSize: 10,
                            total: filteredManagers.length,
                            showSizeChanger: true,
                            pageSizeOptions: ['5', '10', '20', '50'],
                            showTotal: (total) => `Total ${total} managers`,
                        }}
                        scroll={{ x: 1200 }}
                    />
                </Card>

                {/* Add/Edit Modal */}
                <Modal
                    title={editingManager ? 'Edit Project Manager' : 'Add New Project Manager'}
                    open={isModalOpen}
                    onOk={handleModalOk}
                    onCancel={() => {
                        setIsModalOpen(false);
                        form.resetFields();
                    }}
                    width={500}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        className="mt-4"
                    >
                        <Form.Item
                            label="Full Name"
                            name="name"
                            rules={[{ required: true, message: 'Please enter the full name' }]}
                        >
                            <Input placeholder="e.g., John Doe" />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Please enter the email' },
                                { type: 'email', message: 'Invalid email format' }
                            ]}
                        >
                            <Input placeholder="e.g., john@company.com" />
                        </Form.Item>

                        <Form.Item
                            label="Role"
                            name="role"
                            rules={[{ required: true, message: 'Please select a role' }]}
                        >
                            <Select placeholder="Select role">
                                <Option value="Project Manager">Project Manager</Option>
                                <Option value="Senior Project Manager">Senior Project Manager</Option>
                                <Option value="Lead Project Manager">Lead Project Manager</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Status"
                            name="status"
                            rules={[{ required: true, message: 'Please select a status' }]}
                        >
                            <Select placeholder="Select status">
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Reset Password Modal */}
                <Modal
                    title={`Reset Password for ${editingManager?.name || ''}`}
                    open={isPasswordModalOpen}
                    onCancel={handleClosePasswordModal}
                    width={500}
                    footer={newPassword ? [
                        <Button key="copy" type="primary" onClick={handleCopyPassword}>
                            Copy Password
                        </Button>,
                        <Button key="close" onClick={handleClosePasswordModal}>
                            Close
                        </Button>
                    ] : [
                        <Button key="cancel" onClick={handleClosePasswordModal}>
                            Cancel
                        </Button>,
                        <Button key="submit" type="primary" onClick={handlePasswordModalOk}>
                            Set Password
                        </Button>
                    ]}
                >
                    {newPassword ? (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded p-4">
                                <p className="text-sm text-gray-600 mb-2">New password for <strong>{editingManager?.email}</strong>:</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded font-mono text-sm break-all">
                                        {newPassword}
                                    </code>
                                    <Button
                                        type="text"
                                        icon={<CopyOutlined />}
                                        onClick={handleCopyPassword}
                                        title="Copy to clipboard"
                                    />
                                </div>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> Please share this password securely with the user. They can change it later in their account settings.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Form
                            form={passwordForm}
                            layout="vertical"
                            className="mt-4"
                        >
                            <Form.Item
                                label="New Password"
                                name="password"
                                rules={[
                                    { required: true, message: 'Please enter a new password' },
                                    { min: 8, message: 'Password must be at least 8 characters' }
                                ]}
                            >
                                <Input.Password
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Confirm Password"
                                name="confirmPassword"
                                rules={[
                                    { required: true, message: 'Please confirm the password' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Passwords do not match'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                />
                            </Form.Item>

                            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                                <p className="mb-2"><strong>Password requirements:</strong></p>
                                <ul className="space-y-1">
                                    <li>• At least 8 characters</li>
                                    <li>• Can contain letters, numbers, and special characters</li>
                                </ul>
                            </div>
                        </Form>
                    )}
                </Modal>
            </div>
        </ScrollContainer>
    );
};

export default ProjectManagerUsers;
