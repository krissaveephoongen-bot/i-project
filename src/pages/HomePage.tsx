import React from 'react';
import { Layout, Menu, Tabs } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import ProjectDashboard from '@/components/dashboard/ProjectDashboard';
import TaskManagementEnhanced from '@/components/tasks/TaskManagementEnhanced';
import TimesheetEntry from '@/components/timesheet/TimesheetEntry';
import TimesheetApproval from '@/components/timesheet/TimesheetApproval';
import { useAuth } from '@/contexts/AuthContext';

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'PROJECT_MANAGER' || currentUser?.role === 'ADMIN';

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'tasks',
      icon: <FileTextOutlined />,
      label: 'Task Management',
    },
    {
      key: 'timesheet',
      icon: <ClockCircleOutlined />,
      label: 'Timesheet',
    },
    ...(isManager
      ? [
          {
            key: 'approvals',
            icon: <CheckCircleOutlined />,
            label: 'Approvals',
          },
        ]
      : []),
  ];

  const [activeTab, setActiveTab] = React.useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProjectDashboard />;
      case 'tasks':
        return <TaskManagementEnhanced />;
      case 'timesheet':
        return <TimesheetEntry projectId="" />;
      case 'approvals':
        return isManager ? <TimesheetApproval /> : null;
      default:
        return <ProjectDashboard />;
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Layout.Content className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {currentUser?.name}
          </h1>
          <p className="text-gray-600">
            Manage your projects, tasks, and timesheets in one place
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 px-6 pt-4">
            <div className="flex gap-8">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`pb-4 px-2 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === item.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default HomePage;
