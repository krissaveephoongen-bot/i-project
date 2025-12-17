import { Card, Col, Row, Statistic, Tag } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  AuditOutlined, 
  DatabaseOutlined 
} from '@ant-design/icons';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { useEffect, useState } from 'react';
import { timesheetService } from '@/services/timesheetService';

// Register ChartJS components
ChartJS.register(...registerables);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAdmins: 0,
    totalManagers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{ status: 'connected' | 'disconnected'; timestamp?: string } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/admin/dashboard/stats`, {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch stats');

        const data = await response.json();
        setStats({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          totalAdmins: data.totalAdmins || 0,
          totalManagers: data.totalManagers || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    let mounted = true;
    const loadDbStatus = async () => {
      try {
        const status = await timesheetService.getDbStatus();
        if (!mounted) return;
        setDbStatus({ status: status.status === 'connected' ? 'connected' : 'disconnected', timestamp: new Date().toISOString() });
      } catch (e) {
        if (!mounted) return;
        setDbStatus({ status: 'disconnected', timestamp: new Date().toISOString() });
      }
    };
    loadDbStatus();
    const interval = setInterval(loadDbStatus, 60000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // Chart data
  const userActivityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Active Users',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const systemHealthData = {
    labels: ['CPU', 'Memory', 'Storage', 'Database', 'API'],
    datasets: [
      {
        label: 'System Health',
        data: [85, 59, 80, 81, 95],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(54, 162, 235, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Tag color={dbStatus?.status === 'connected' ? 'green' : 'red'}>
          Database: {dbStatus?.status === 'connected' ? 'Connected' : 'Disconnected'}
        </Tag>
      </div>
      
      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={stats.activeUsers}
              prefix={<TeamOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Administrators"
              value={stats.totalAdmins}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Managers"
              value={stats.totalManagers}
              prefix={<TeamOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} xl={16}>
          <Card title="User Activity" className="h-full">
            <Line 
              data={userActivityData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                height: 300,
              }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="System Health" className="h-full">
            <Bar 
              data={systemHealthData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                height: 300,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`,
                    },
                  },
                },
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24}>
          <Card title="Quick Actions">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card 
                hoverable 
                className="text-center"
                onClick={() => {/* Navigate to users */}}
              >
                <UserOutlined className="text-2xl mb-2" />
                <div>Manage Users</div>
              </Card>
              <Card 
                hoverable 
                className="text-center"
                onClick={() => {/* Navigate to roles */}}
              >
                <TeamOutlined className="text-2xl mb-2" />
                <div>Manage Roles</div>
              </Card>
              <Card 
                hoverable 
                className="text-center"
                onClick={() => {/* Navigate to logs */}}
              >
                <AuditOutlined className="text-2xl mb-2" />
                <div>View Logs</div>
              </Card>
              <Card 
                hoverable 
                className="text-center"
                onClick={() => {/* Navigate to settings */}}
              >
                <DatabaseOutlined className="text-2xl mb-2" />
                <div>Database Tools</div>
              </Card>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
