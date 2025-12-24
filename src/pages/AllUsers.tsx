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
import ScrollContainer from '@/components/layout/ScrollContainer';

const { Search } = Input;
const { Option } = Select;

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    hireDate: string;
    lastLogin: string;
    department?: string;
    phone?: string;
}

const AllUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [newPassword, setNewPassword] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/prisma/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
            setPagination({
                ...pagination,
                total: data.length,
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Failed to load users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || user.status === statusFilter;
        const matchesRole = !roleFilter || user.role === roleFilter;
        return matchesSearch && matchesStatus && matchesRole;
    });

    const handleAddUser = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        form.setFieldsValue({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            department: user.department,
            phone: user.phone,
        });
        setIsModalOpen(true);
    };

    const handleDeleteUser = (userId: string) => {
        Modal.confirm({
            title: 'Delete User',
            content: 'Are you sure you want to remove this user?',
            okText: 'Yes',
            cancelText: 'No',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const token = localStorage.getItem('accessToken');
                    const response = await fetch(`/api/prisma/users/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Failed to delete user');
                    }

                    message.success('User deleted successfully');
                    fetchUsers();
                } catch (error) {
                    console.error('Error deleting user:', error);
                    message.error('Failed to delete user');
                }
            },
        });
    };

    const handleToggleStatus = async (user: User) => {
        try {
            const newStatus = user.status === 'active' ? 'inactive' : 'active';
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`/api/prisma/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: newStatus,
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update status');
            }

            message.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
            await fetchUsers();
        } catch (error: any) {
            console.error('Error updating status:', error);
            message.error(error.message || 'Failed to update status');
        }
    };

    const handleResetPassword = (user: User) => {
        setEditingUser(user);
        passwordForm.resetFields();
        setNewPassword(null);
        setIsPasswordModalOpen(true);
    };

    const handlePasswordModalOk = async () => {
        try {
            const values = await passwordForm.validateFields();

            if (!editingUser) return;

            const response = await fetch(`/api/prisma/users/${editingUser.id}/admin-reset-password`, {
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
            const token = localStorage.getItem('accessToken');

            if (editingUser) {
                // Update existing user
                const response = await fetch(`/api/prisma/users/${editingUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: values.name,
                        email: values.email,
                        role: values.role,
                        status: values.status,
                        department: values.department,
                        phone: values.phone,
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to update user');
                }

                message.success('User updated successfully');
                await fetchUsers();
            } else {
                // Add new user
                const response = await fetch('/api/prisma/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: values.name,
                        email: values.email,
                        role: values.role,
                        status: values.status,
                        department: values.department,
                        phone: values.phone,
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to create user');
                }

                message.success('User added successfully');
                await fetchUsers();
            }

            setIsModalOpen(false);
            form.resetFields();
        } catch (error: any) {
            console.error('Error:', error);
            message.error(error.message || 'Operation failed');
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'red';
            case 'PROJECT_MANAGER': return 'blue';
            case 'TEAM_LEAD': return 'green';
            case 'DEVELOPER': return 'purple';
            case 'DESIGNER': return 'orange';
            case 'TESTER': return 'cyan';
            default: return 'default';
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: User, b: User) => a.name.localeCompare(b.name),
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
                <Tag color={getRoleColor(role)}>{role.replace('_', ' ')}</Tag>
            ),
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
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
            title: 'Hire Date',
            dataIndex: 'hireDate',
            key: 'hireDate',
            render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
        },
        {
            title: 'Last Login',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: User) => (
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
                        onClick={() => handleEditUser(record)}
                        title="Edit"
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteUser(record.id)}
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
                        <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
                        <p className="text-gray-600 mt-1">Manage all system users</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={handleAddUser}
                        size="large"
                    >
                        Add New User
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{users.length}</div>
                            <div className="text-gray-600 mt-2">Total Users</div>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                                {users.filter(u => u.status === 'active').length}
                            </div>
                            <div className="text-gray-600 mt-2">Active Users</div>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-600">
                                {users.filter(u => u.status === 'inactive').length}
                            </div>
                            <div className="text-gray-600 mt-2">Inactive Users</div>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">
                                {users.filter(u => u.role === 'PROJECT_MANAGER').length}
                            </div>
                            <div className="text-gray-600 mt-2">Project Managers</div>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600">
                                {users.filter(u => u.role === 'ADMIN').length}
                            </div>
                            <div className="text-gray-600 mt-2">Admins</div>
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
                            className="w-full md:w-40"
                            size="large"
                        >
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                        <Select
                            placeholder="Filter by role"
                            allowClear
                            value={roleFilter || undefined}
                            onChange={(value) => setRoleFilter(value)}
                            className="w-full md:w-48"
                            size="large"
                        >
                            <Option value="ADMIN">Admin</Option>
                            <Option value="PROJECT_MANAGER">Project Manager</Option>
                            <Option value="TEAM_LEAD">Team Lead</Option>
                            <Option value="DEVELOPER">Developer</Option>
                            <Option value="DESIGNER">Designer</Option>
                            <Option value="TESTER">Tester</Option>
                            <Option value="CLIENT">Client</Option>
                            <Option value="USER">User</Option>
                        </Select>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchUsers}
                            size="large"
                        >
                            Refresh
                        </Button>
                    </div>
                </Card>

                {/* Users Table */}
                <Card>
                    <Table
                        columns={columns}
                        dataSource={filteredUsers}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            pageSize: 10,
                            total: filteredUsers.length,
                            showSizeChanger: true,
                            itemRender: (current, type, originalElement) => {
                              if (type === 'page') {
                                return <span style={{ color: current === pagination.current ? 'black' : 'inherit' }}>{current}</span>;
                              }
                              return originalElement;
                            },
                            pageSizeOptions: ['5', '10', '20', '50'],
                            showTotal: (total) => `Total ${total} users`,
                        }}
                        scroll={{ x: 1200 }}
                    />
                </Card>

                {/* Add/Edit Modal */}
                <Modal
                    title={editingUser ? 'Edit User' : 'Add New User'}
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
                                <Option value="USER">User</Option>
                                <Option value="DEVELOPER">Developer</Option>
                                <Option value="DESIGNER">Designer</Option>
                                <Option value="TESTER">Tester</Option>
                                <Option value="TEAM_LEAD">Team Lead</Option>
                                <Option value="PROJECT_MANAGER">Project Manager</Option>
                                <Option value="ADMIN">Admin</Option>
                                <Option value="CLIENT">Client</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Department"
                            name="department"
                        >
                            <Input placeholder="e.g., Engineering" />
                        </Form.Item>

                        <Form.Item
                            label="Phone"
                            name="phone"
                        >
                            <Input placeholder="e.g., +66 123 456 789" />
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
                    title={`Reset Password for ${editingUser?.name || ''}`}
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
                                <p className="text-sm text-gray-600 mb-2">New password for <strong>{editingUser?.email}</strong>:</p>
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

export default AllUsers;