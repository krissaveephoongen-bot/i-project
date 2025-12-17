import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Switch, message } from 'antd';
import { SettingOutlined, NotificationOutlined, SecurityOutlined, ApiOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const SystemSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to save settings');

      message.success('Settings saved successfully');
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      
      <Card>
        <Tabs defaultActiveKey="general">
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                General
              </span>
            }
            key="general"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                appName: 'Project Management',
                timezone: 'Asia/Bangkok',
                maintenanceMode: false,
              }}
            >
              <Form.Item
                label="Application Name"
                name="appName"
                rules={[{ required: true, message: 'Please input application name!' }]}
              >
                <Input placeholder="Enter application name" />
              </Form.Item>

              <Form.Item
                label="Timezone"
                name="timezone"
                rules={[{ required: true, message: 'Please select timezone!' }]}
              >
                <Input placeholder="Select timezone" />
              </Form.Item>

              <Form.Item
                name="maintenanceMode"
                valuePropName="checked"
                label="Maintenance Mode"
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save Settings
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <NotificationOutlined />
                Notifications
              </span>
            }
            key="notifications"
          >
            <p>Notification settings will be available soon.</p>
          </TabPane>

          <TabPane
            tab={
              <span>
                <SecurityOutlined />
                Security
              </span>
            }
            key="security"
          >
            <p>Security settings will be available soon.</p>
          </TabPane>

          <TabPane
            tab={
              <span>
                <ApiOutlined />
                API
              </span>
            }
            key="api"
          >
            <p>API settings will be available soon.</p>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SystemSettings;
