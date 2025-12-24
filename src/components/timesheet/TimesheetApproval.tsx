import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Tag,
  Space,
  Card,
  message,
  Tooltip,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '@/contexts/AuthContext';

interface TimesheetEntry {
  id: string;
  userId: string;
  userName: string;
  projectId: string;
  projectName: string;
  date: Date;
  hoursWorked: number;
  description?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const TimesheetApproval: React.FC = () => {
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimesheetEntry | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchPendingTimesheets();
  }, [currentUser?.id]);

  const fetchPendingTimesheets = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/timesheets?status=SUBMITTED&managerId=${currentUser.id}`
      );
      const result = await response.json();

      if (result.success) {
        setEntries(
          result.data.map((entry: any) => ({
            ...entry,
            date: new Date(entry.date),
            createdAt: new Date(entry.createdAt),
            updatedAt: new Date(entry.updatedAt),
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching pending timesheets:', error);
      message.error('Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (entryId: string) => {
    Modal.confirm({
      title: 'Approve Timesheet',
      content: 'Are you sure you want to approve this timesheet entry?',
      onOk: async () => {
        try {
          const response = await fetch(`/api/timesheets/${entryId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });

          const result = await response.json();

          if (result.success) {
            message.success('Timesheet approved');
            fetchPendingTimesheets();
          } else {
            message.error('Failed to approve timesheet');
          }
        } catch (error) {
          console.error('Error approving timesheet:', error);
          message.error('Failed to approve timesheet');
        }
      },
    });
  };

  const handleReject = (entry: TimesheetEntry) => {
    setSelectedEntry(entry);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSubmitRejection = async () => {
    if (!selectedEntry) return;

    try {
      const values = await form.validateFields();

      const response = await fetch(
        `/api/timesheets/${selectedEntry.id}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rejectionReason: values.reason }),
        }
      );

      const result = await response.json();

      if (result.success) {
        message.success('Timesheet rejected');
        setIsModalVisible(false);
        fetchPendingTimesheets();
      } else {
        message.error('Failed to reject timesheet');
      }
    } catch (error) {
      console.error('Error rejecting timesheet:', error);
      message.error('Failed to reject timesheet');
    }
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'userName',
      key: 'userName',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Project',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: Date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Hours',
      dataIndex: 'hoursWorked',
      key: 'hoursWorked',
      render: (hours: number) => (
        <span className="font-semibold text-blue-600">{hours}h</span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: { [key: string]: string } = {
          SUBMITTED: 'processing',
          APPROVED: 'success',
          REJECTED: 'error',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: TimesheetEntry) => (
        <Space size="small">
          <Tooltip title="Approve">
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined className="text-green-500" />}
              onClick={() => handleApprove(record.id)}
            />
          </Tooltip>
          <Tooltip title="Reject">
            <Button
              type="text"
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleReject(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const pendingCount = entries.filter((e) => e.status === 'SUBMITTED').length;
  const totalHours = entries.reduce((sum, e) => sum + e.hoursWorked, 0);

  return (
    <div className="space-y-6">
      <Card size="small">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-500">Pending Approval</div>
            <div className="text-3xl font-bold text-yellow-600">
              {pendingCount}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Hours</div>
            <div className="text-3xl font-bold">{totalHours.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Avg Hours/Entry</div>
            <div className="text-3xl font-bold">
              {entries.length > 0
                ? (totalHours / entries.length).toFixed(1)
                : '0'}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Pending Approvals" size="small">
        <Table
          columns={columns}
          dataSource={entries.filter((e) => e.status === 'SUBMITTED')}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      <Modal
        title="Reject Timesheet"
        open={isModalVisible}
        onOk={handleSubmitRejection}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label="Rejection Reason"
            rules={[
              { required: true, message: 'Please provide a rejection reason' },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Explain why you're rejecting this timesheet entry"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TimesheetApproval;
