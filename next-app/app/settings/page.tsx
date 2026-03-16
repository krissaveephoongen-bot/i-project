"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Layout,
  Card,
  Typography,
  Form,
  Input,
  Switch,
  Select,
  Button,
  Space,
  Divider,
  Tabs,
  Upload,
  Avatar,
} from "antd";
import {
  UserOutlined,
  SettingOutlined,
  UploadOutlined,
  SaveOutlined,
  ReloadOutlined,
  LockOutlined,
  BellOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useAuth } from "../components/AuthProvider";
import { message } from "antd";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface UserSettings {
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoSave: boolean;
  pageSize: number;
}

interface NotificationSettings {
  emailAlerts: boolean;
  taskAssigned: boolean;
  taskCompleted: boolean;
  projectUpdates: boolean;
  deadlineReminders: boolean;
  weeklyReports: boolean;
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    theme: "light",
    language: "en",
    timezone: "Asia/Bangkok",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    emailNotifications: true,
    pushNotifications: true,
    autoSave: true,
    pageSize: 10,
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailAlerts: true,
    taskAssigned: true,
    taskCompleted: true,
    projectUpdates: true,
    deadlineReminders: true,
    weeklyReports: false,
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [form] = Form.useForm();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchUserSettings();
  }, [user]);

  const fetchUserSettings = async () => {
    try {
      const response = await fetch("/api/user-preferences");
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setUserSettings(data.data);
          setNotificationSettings(data.data.notifications || notificationSettings);
          form.setFieldsValue(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
    }
  };

  const handleSaveSettings = async (values: any) => {
    try {
      setLoading(true);
      
      const response = await fetch("/api/user-preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success("Settings saved successfully");
      } else {
        message.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      message.error("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info: any) => {
    if (info.file.status === "done") {
      // Handle avatar upload
      message.success("Avatar updated successfully");
    }
  };

  const handlePasswordChange = () => {
    router.push("/change-password");
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-6">
        <div className="max-w-4xl mx-auto">
          <Title level={2}>Settings</Title>
          
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Profile" key="profile">
              <Card>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSaveSettings}
                  initialValues={userSettings}
                >
                  <div className="flex justify-center mb-6">
                    <Avatar 
                      size={80} 
                      src={user?.avatar_url} 
                      icon={<UserOutlined />}
                    />
                    <div className="ml-4">
                      <Button 
                        icon={<UploadOutlined />}
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                      >
                        Change Avatar
                      </Button>
                      <Upload
                        id="avatar-upload"
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: "Please enter your name" }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      { type: "email", message: "Please enter a valid email" }
                    ]}
                  >
                    <Input prefix={<UserOutlined />} disabled />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Phone Number"
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="bio"
                    label="Bio"
                  >
                    <Input.TextArea rows={4} placeholder="Tell us about yourself" />
                  </Form.Item>

                  <Form.Item>
                    <Space>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        icon={<SaveOutlined />}
                      >
                        Save Profile
                      </Button>
                      <Button 
                        icon={<LockOutlined />}
                        onClick={handlePasswordChange}
                      >
                        Change Password
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </TabPane>

            <TabPane tab="Preferences" key="preferences">
              <Card>
                <Form
                  layout="vertical"
                  onFinish={handleSaveSettings}
                  initialValues={userSettings}
                >
                  <Title level={4}>Appearance</Title>
                  
                  <Form.Item
                    name="theme"
                    label="Theme"
                  >
                    <Select>
                      <Select.Option value="light">Light</Select.Option>
                      <Select.Option value="dark">Dark</Select.Option>
                      <Select.Option value="auto">Auto</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="language"
                    label="Language"
                  >
                    <Select>
                      <Select.Option value="en">English</Select.Option>
                      <Select.Option value="th">ไทย</Select.Option>
                      <Select.Option value="zh">中文</Select.Option>
                    </Select>
                  </Form.Item>

                  <Divider />

                  <Title level={4}>Date & Time</Title>
                  
                  <Form.Item
                    name="timezone"
                    label="Timezone"
                  >
                    <Select>
                      <Select.Option value="Asia/Bangkok">Bangkok (GMT+7)</Select.Option>
                      <Select.Option value="UTC">UTC</Select.Option>
                      <Select.Option value="America/New_York">New York (GMT-5)</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="dateFormat"
                    label="Date Format"
                  >
                    <Select>
                      <Select.Option value="DD/MM/YYYY">DD/MM/YYYY</Select.Option>
                      <Select.Option value="MM/DD/YYYY">MM/DD/YYYY</Select.Option>
                      <Select.Option value="YYYY-MM-DD">YYYY-MM-DD</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="timeFormat"
                    label="Time Format"
                  >
                    <Select>
                      <Select.Option value="12h">12-hour</Select.Option>
                      <Select.Option value="24h">24-hour</Select.Option>
                    </Select>
                  </Form.Item>

                  <Divider />

                  <Title level={4}>Behavior</Title>
                  
                  <Form.Item
                    name="pageSize"
                    label="Default Page Size"
                  >
                    <Select>
                      <Select.Option value={5}>5 items</Select.Option>
                      <Select.Option value={10}>10 items</Select.Option>
                      <Select.Option value={20}>20 items</Select.Option>
                      <Select.Option value={50}>50 items</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="autoSave"
                    label="Auto-save"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      Save Preferences
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </TabPane>

            <TabPane tab="Notifications" key="notifications">
              <Card>
                <Title level={4}>Email Notifications</Title>
                
                <Form
                  layout="vertical"
                  onFinish={handleSaveSettings}
                  initialValues={notificationSettings}
                >
                  <Form.Item
                    name="emailAlerts"
                    label="Email Alerts"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="taskAssigned"
                    label="Task Assigned"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="taskCompleted"
                    label="Task Completed"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="projectUpdates"
                    label="Project Updates"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="deadlineReminders"
                    label="Deadline Reminders"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="weeklyReports"
                    label="Weekly Reports"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="pushNotifications"
                    label="Push Notifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      Save Notification Settings
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </TabPane>

            <TabPane tab="System" key="system">
              <Card>
                <Space direction="vertical" size="large" className="w-full">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <div>
                      <Title level={5} className="mb-0">Application Version</Title>
                      <Text type="secondary">v1.0.0</Text>
                    </div>
                    <Button 
                      icon={<ReloadOutlined />}
                      onClick={() => window.location.reload()}
                    >
                      Check for Updates
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <div>
                      <Title level={5} className="mb-0">Database Status</Title>
                      <Text type="secondary">Connected</Text>
                    </div>
                    <Button 
                      icon={<SettingOutlined />}
                      onClick={() => router.push("/admin/database")}
                    >
                      Manage
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <div>
                      <Title level={5} className="mb-0">Cache Status</Title>
                      <Text type="secondary">Clear cache to improve performance</Text>
                    </div>
                    <Button 
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        if ('caches' in window) {
                          caches.keys().then(names => {
                            names.forEach(name => {
                              caches.delete(name);
                            });
                          });
                        }
                        message.success("Cache cleared successfully");
                      }}
                    >
                      Clear Cache
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <div>
                      <Title level={5} className="mb-0">Export Data</Title>
                      <Text type="secondary">Download all your data</Text>
                    </div>
                    <Button 
                      icon={<DownloadOutlined />}
                      onClick={() => router.push("/export")}
                    >
                      Export All Data
                    </Button>
                  </div>
                </Space>
              </Card>
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
}
