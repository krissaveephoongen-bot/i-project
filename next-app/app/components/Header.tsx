"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Badge,
  Input,
  Space,
  Typography,
  Breadcrumb,
  Drawer,
} from "antd";
import {
  MenuOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  TeamOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useAuth } from "./AuthProvider";
import { useTranslation } from "react-i18next";

const { Header: AntHeader } = Layout;
const { Search } = Input;
const { Title, Text } = Typography;

interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Header({ title, breadcrumbs }: HeaderProps) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  // Menu items configuration
  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Dashboard",
    },
    {
      key: "/projects",
      icon: <ProjectOutlined />,
      label: "Projects",
    },
    {
      key: "/tasks",
      icon: <CheckSquareOutlined />,
      label: "Tasks",
    },
    {
      key: "/reports",
      icon: <BarChartOutlined />,
      label: "Reports",
    },
    {
      key: "/team",
      icon: <TeamOutlined />,
      label: "Team",
    },
    {
      key: "/documents",
      icon: <FileTextOutlined />,
      label: "Documents",
    },
  ];

  // User menu items
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => router.push("/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => router.push("/settings"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  function handleLogout() {
    signOut();
    router.push("/login");
  }

  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
    setMobileMenuVisible(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?unreadOnly=true&pageSize=5");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
        setNotificationCount(data.data?.length || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const notificationMenuItems = notifications.map((notif) => ({
    key: notif.id,
    label: (
      <div className="p-2 max-w-xs">
        <div className="font-medium">{notif.title}</div>
        <div className="text-sm text-gray-600">{notif.message}</div>
        <div className="text-xs text-gray-400 mt-1">
          {new Date(notif.created_at).toLocaleString()}
        </div>
      </div>
    ),
    onClick: () => {
      if (notif.action_url) {
        router.push(notif.action_url);
      }
    },
  }));

  if (notificationMenuItems.length === 0) {
    notificationMenuItems.push({
      key: "no-notifications",
      label: <div className="p-2 text-center text-gray-500">No notifications</div>,
    } as any);
  }

  return (
    <AntHeader className="bg-white shadow-sm px-4 lg:px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Left Section - Logo & Mobile Menu */}
      <div className="flex items-center">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setMobileMenuVisible(true)}
          className="lg:hidden mr-4"
        />
        
        <div className="flex items-center">
          <Title level={3} className="mb-0 text-blue-600 mr-4">
            I-PROJECT
          </Title>
          
          {/* Desktop Menu */}
          <Menu
            mode="horizontal"
            selectedKeys={[pathname || "/"]}
            items={menuItems}
            className="hidden lg:flex border-none"
            style={{ minWidth: 0, flex: "auto" }}
          />
        </div>
      </div>

      {/* Right Section - Search, Notifications, User */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <Search
          placeholder="Search..."
          allowClear
          onSearch={handleSearch}
          style={{ width: 200 }}
          className="hidden md:block"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Notifications */}
        <Dropdown
          menu={{ items: notificationMenuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button type="text" icon={<Badge count={notificationCount} offset={[0, 0]}>
            <BellOutlined />
          </Badge>} />
        </Dropdown>

        {/* User Menu */}
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button type="text" className="flex items-center space-x-2">
            <Avatar 
              size="small" 
              src={(user as any)?.avatar_url} 
              icon={<UserOutlined />}
            />
            <span className="hidden md:inline">{user?.name || "User"}</span>
          </Button>
        </Dropdown>
      </div>

      {/* Mobile Menu Drawer */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
      >
        <Menu
          mode="vertical"
          selectedKeys={[pathname || "/"]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Drawer>
    </AntHeader>
  );
}
