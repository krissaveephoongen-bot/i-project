"use client";

import { ConfigProvider, theme } from "antd";
import { ReactNode } from "react";
import { useAuth } from "./AuthProvider";

interface AntdProviderProps {
  children: ReactNode;
}

export default function AntdProvider({ children }: AntdProviderProps) {
  const { user } = useAuth();

  const antdTheme = {
    token: {
      colorPrimary: "#1890ff",
      colorSuccess: "#52c41a",
      colorWarning: "#faad14",
      colorError: "#ff4d4f",
      colorInfo: "#1890ff",
      borderRadius: 6,
      fontSize: 14,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
      Layout: {
        headerBg: "#001529",
        siderBg: "#001529",
        bodyBg: "#f0f2f5",
      },
      Menu: {
        darkItemBg: "#001529",
        darkSubMenuItemBg: "#000c17",
        darkItemSelectedBg: "#1890ff",
      },
      Card: {
        borderRadius: 8,
      },
      Table: {
        borderRadius: 8,
      },
    },
    algorithm: theme.defaultAlgorithm,
  };

  return (
    <ConfigProvider theme={antdTheme}>
      {children}
    </ConfigProvider>
  );
}
