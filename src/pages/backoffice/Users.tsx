import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Input, Select, Tag, message } from 'antd';
import { 
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Search } = Input;
const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
  });

  // Fetch users from API
  const fetchUsers = async (params = {}) => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/admin/users`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.data || []);
      setPagination({
        ...pagination,
        total: data.total,
        current: data.current_page || 1,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...filters,
    });
  }, [pagination.current, pagination.pageSize, filters]);

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPagination({
      ...pagination,
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const handleSearch = (value: string) => {
    setFilters({
      ...filters,
      search: value,
    });
    setPagination({
      ...pagination,
      current: 1, // Reset to first page on new search
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value,
    });
    setPagination({
      ...pagination,
      current: 1, // Reset to first page on filter change
    });
  };

  const handleResetFilters = () => {
    setFilters({
      role: '',
      status: '',
      search: '',
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (text: string, record: any) => (
        <Link to={`/backoffice/users/${record.id}`} className="text-blue-600 hover:underline">
          {text}
        </Link>
      ),
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
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Manager', value: 'manager' },
        { text: 'User', value: 'user' },
      ],
      filteredValue: filters.role ? [filters.role] : null,
      onFilter: (value: any, record: any) => record.role === value,
      render: (role: string) => {
        let color = role === 'admin' ? 'red' : role === 'manager' ? 'blue' : 'green';
        return (
          <Tag color={color} key={role}>
            {role.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      filteredValue: filters.status ? [filters.status] : null,
      onFilter: (value: any, record: any) => record.status === value,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'} key={status}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      sorter: (a: any, b: any) => new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime(),
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            title="Edit"
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  const handleEdit = (user: any) => {
    // Navigate to edit page or open edit modal
    message.info(`Edit user: ${user.name}`);
  };

  const handleDelete = (userId: number) => {
    // Show confirmation dialog and delete user
    if (window.confirm('Are you sure you want to delete this user?')) {
      // Call API to delete user
      message.success('User deleted successfully');
      // Refresh users list
      fetchUsers({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button 
          type="primary" 
          icon={<UserAddOutlined />}
          onClick={() => {}}
        >
          Add New User
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <Search
            placeholder="Search users..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            className="w-full md:w-1/3"
          />
          
          <div className="flex flex-wrap gap-2">
            <Select
              placeholder="Filter by role"
              style={{ width: 150 }}
              allowClear
              value={filters.role || undefined}
              onChange={(value) => handleFilterChange('role', value)}
              className="w-full md:w-auto"
            >
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
              <Option value="user">User</Option>
            </Select>
            
            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              allowClear
              value={filters.status || undefined}
              onChange={(value) => handleFilterChange('status', value)}
              className="w-full md:w-auto"
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleResetFilters}
              className="w-full md:w-auto"
            >
              Reset
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Total ${total} users`,
            itemRender: (current, type, originalElement) => {
              if (type === 'page') {
                return <span style={{ color: current === pagination.current ? 'black' : 'inherit' }}>{current}</span>;
              }
              return originalElement;
            }
          }}
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default Users;
