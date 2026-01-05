import React, { useState } from 'react';
import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Button,
  Card,
  Space,
  Table,
  Tag,
  Select,
  Modal,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '@/contexts/AuthContext';

interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  date: Date;
  hoursWorked: number;
  description?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

interface TimesheetEntryProps {
  projectId: string;
  taskId?: string;
  onEntrySubmitted?: () => void;
}

const TimesheetEntry: React.FC<TimesheetEntryProps> = ({
  projectId,
  taskId,
  onEntrySubmitted,
}) => {
  const [form] = Form.useForm();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  // Fetch entries for the week
  const fetchWeeklyEntries = async () => {
    if (!projectId || !currentUser?.id) return;

    try {
      setLoading(true);
      const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD');
      const endOfWeek = dayjs().endOf('week').format('YYYY-MM-DD');

      const response = await fetch(
        `/api/timesheets?projectId=${projectId}&userId=${currentUser.id}&startDate=${startOfWeek}&endDate=${endOfWeek}`
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
      console.error('Error fetching timesheet entries:', error);
      message.error('Failed to load timesheet entries');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchWeeklyEntries();
  }, [projectId, currentUser?.id]);

  const handleSubmitEntry = async () => {
    try {
      const values = await form.validateFields();

      const entryData = {
        projectId,
        taskId: taskId || null,
        date: values.date.format('YYYY-MM-DD'),
        hoursWorked: values.hoursWorked,
        description: values.description,
        status: 'DRAFT',
      };

      const url = editingEntry
        ? `/api/timesheets/${editingEntry.id}`
        : '/api/timesheets';

      const method = editingEntry ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData),
      });

      const result = await response.json();

      if (result.success) {
        message.success(editingEntry ? 'Entry updated' : 'Entry added');
        form.resetFields();
        setEditingEntry(null);
        fetchWeeklyEntries();
        onEntrySubmitted?.();
      } else {
        message.error('Failed to save entry');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      message.error('Failed to save entry');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    Modal.confirm({
      title: 'Delete Entry',
      content: 'Are you sure you want to delete this timesheet entry?',
      onOk: async () => {
        try {
          const response = await fetch(`/api/timesheets/${entryId}`, {
            method: 'DELETE',
          });

          const result = await response.json();

          if (result.success) {
            message.success('Entry deleted');
            fetchWeeklyEntries();
          } else {
            message.error('Failed to delete entry');
          }
        } catch (error) {
          console.error('Error deleting entry:', error);
          message.error('Failed to delete entry');
        }
      },
    });
  };

  const handleSubmitWeek = async () => {
    Modal.confirm({
      title: 'Submit Timesheet',
      content: 'Submit all draft entries for approval?',
      onOk: async () => {
        try {
          const draftEntries = entries.filter((e) => e.status === 'DRAFT');

          for (const entry of draftEntries) {
            await fetch(`/api/timesheets/${entry.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'SUBMITTED' }),
            });
          }

          message.success('Timesheet submitted for approval');
          fetchWeeklyEntries();
          onEntrySubmitted?.();
        } catch (error) {
          console.error('Error submitting timesheet:', error);
          message.error('Failed to submit timesheet');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: Date) => dayjs(date).format('ddd, MMM DD'),
    },
    {
      title: 'Hours',
      dataIndex: 'hoursWorked',
      key: 'hoursWorked',
      render: (hours: number) => <span className="font-semibold">{hours}h</span>,
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
          DRAFT: 'default',
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
      width: 100,
      render: (_: any, record: TimeEntry) =>
        record.status === 'DRAFT' ? (
          <Space size="small">
            <Button
              type="text"
              size="small"
              onClick={() => {
                setEditingEntry(record);
                form.setFieldsValue({
                  date: dayjs(record.date),
                  hoursWorked: record.hoursWorked,
                  description: record.description,
                });
              }}
            >
              Edit
            </Button>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteEntry(record.id)}
            />
          </Space>
        ) : (
          <Tag>{record.status}</Tag>
        ),
    },
  ];

  const totalHours = entries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
  const draftHours = entries
    .filter((e) => e.status === 'DRAFT')
    .reduce((sum, e) => sum + e.hoursWorked, 0);

  return (
    <div className="space-y-6">
      {/* Entry Form */}
      <Card title="Log Hours" size="small">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitEntry}
          initialValues={{
            hoursWorked: 8,
            date: dayjs(),
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="hoursWorked"
              label="Hours"
              rules={[{ required: true }]}
            >
              <InputNumber
                min={0.5}
                max={24}
                step={0.5}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description (optional)"
            >
              <Input placeholder="What did you work on?" />
            </Form.Item>
          </div>

          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleSubmitEntry}>
              {editingEntry ? 'Update' : 'Add Entry'}
            </Button>
            {editingEntry && (
              <Button onClick={() => {
                setEditingEntry(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            )}
          </Space>
        </Form>
      </Card>

      {/* Weekly Summary */}
      <Card size="small">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500">Total Hours</div>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Draft Hours</div>
            <div className="text-2xl font-bold text-yellow-600">
              {draftHours.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Submitted</div>
            <div className="text-2xl font-bold">
              {entries.filter((e) => e.status === 'SUBMITTED').length}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Approved</div>
            <div className="text-2xl font-bold text-green-600">
              {entries.filter((e) => e.status === 'APPROVED').length}
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly Entries Table */}
      <Card title={`Week of ${dayjs().startOf('week').format('MMM DD')} - ${dayjs().endOf('week').format('MMM DD')}`} size="small">
        <Table
          columns={columns}
          dataSource={entries}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
        />

        {draftHours > 0 && (
          <div className="mt-4">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleSubmitWeek}
            >
              Submit Week for Approval
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TimesheetEntry;
