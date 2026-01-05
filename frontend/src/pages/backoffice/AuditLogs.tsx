import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Button, DatePicker, Select, Input, Badge } from 'antd';
import { SearchOutlined, ReloadOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  status: 'success' | 'failed';
  ipAddress: string;
  userAgent: string;
};

const AuditLogs: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    status: '',
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
    search: '',
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockLogs: AuditLog[] = [
          {
            id: '1',
            action: 'login',
            entity: 'User',
            entityId: 'user-123',
            userId: 'user-123',
            userEmail: 'admin@example.com',
            timestamp: new Date().toISOString(),
            status: 'success',
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          // Add more mock data as needed
        ];
        
        setLogs(mockLogs);
        setPagination(prev => ({ ...prev, total: mockLogs.length }));
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [pagination.current, pagination.pageSize, filters]);

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
  };

  const handleReset = () => {
    setFilters({
      action: '',
      entity: '',
      status: '',
      dateRange: null,
      search: '',
    });
  };

  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text: string) => <Tag color="blue">{text.toUpperCase()}</Tag>,
    },
    {
      title: 'Entity',
      dataIndex: 'entity',
      key: 'entity',
    },
    {
      title: 'User',
      dataIndex: 'userEmail',
      key: 'userEmail',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'success' ? 'success' : 'error'}
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
    },
    {
      title: 'Date & Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AuditLog) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<FileTextOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewDetails = (log: AuditLog) => {
    console.log('View details:', log);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <Select
              placeholder="Select action"
              className="w-full"
              value={filters.action || undefined}
              onChange={(value) => setFilters({ ...filters, action: value })}
              allowClear
            >
              <Option value="create">Create</Option>
              <Option value="update">Update</Option>
              <Option value="delete">Delete</Option>
              <Option value="login">Login</Option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity</label>
            <Select
              placeholder="Select entity"
              className="w-full"
              value={filters.entity || undefined}
              onChange={(value) => setFilters({ ...filters, entity: value })}
              allowClear
            >
              <Option value="User">User</Option>
              <Option value="Role">Role</Option>
              <Option value="Project">Project</Option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select
              placeholder="Select status"
              className="w-full"
              value={filters.status || undefined}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
            >
              <Option value="success">Success</Option>
              <Option value="failed">Failed</Option>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <RangePicker
              className="w-full"
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] })}
              showTime
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="w-64">
            <Input
              placeholder="Search logs..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              allowClear
            />
          </div>
          
          <Space>
            <Button onClick={handleReset} icon={<ReloadOutlined />}>
              Reset
            </Button>
            <Button type="primary" icon={<SearchOutlined />}>
              Search
            </Button>
          </Space>
        </div>
      </Card>
      
      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default AuditLogs;
