import { Outlet } from 'react-router-dom';
import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    SettingOutlined,
    AuditOutlined,
    DatabaseOutlined,
    TeamOutlined,
    BarChartOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { DatabaseStatus } from '../components/DatabaseStatus';

type MenuItem = Required<MenuProps>['items'][number];

const { Header, Sider, Content } = Layout;

export const BackofficeLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const menuItems: MenuItem[] = [
        {
            key: '1',
            icon: React.createElement(DashboardOutlined),
            label: 'Dashboard',
        },
        {
            key: '2',
            icon: React.createElement(UserOutlined),
            label: 'Users',
        },
        {
            key: '3',
            icon: React.createElement(TeamOutlined),
            label: 'Roles & Permissions',
        },
        {
            key: '4',
            icon: React.createElement(SettingOutlined),
            label: 'Settings',
        },
        {
            key: '5',
            icon: React.createElement(AuditOutlined),
            label: 'Audit Logs',
        },
        {
            key: '6',
            icon: React.createElement(DatabaseOutlined),
            label: 'Database',
        },
        {
            key: '7',
            icon: React.createElement(BarChartOutlined),
            label: 'Reports',
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div className="logo" style={{
                    height: '32px',
                    margin: '16px',
                    background: 'rgba(255, 255, 255, 0.3)',
                }} />
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    items={menuItems}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: '100%',
                        padding: '0 16px',
                        justifyContent: 'space-between'
                    }}>
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            className: 'trigger',
                            onClick: () => setCollapsed(!collapsed),
                            style: { fontSize: '18px', cursor: 'pointer' },
                        })}
                        <div style={{ paddingRight: '16px' }}>
                            <DatabaseStatus />
                        </div>
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: 8,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default BackofficeLayout;
