import React, { useState, useEffect, useRef } from 'react';
import { X, Bell, CheckCircle, AlertTriangle, Info, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  variant?: 'default' | 'outline';
  };
  user?: {
    name: string;
    avatar?: string;
    role?: string;
  };
}

interface NotificationSystemProps {
  className?: string;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'โครงการใหม่',
      message: 'โครงการใหม่ 1 ถูกอนุมัติ',
      type: 'info',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      action: {
        label: 'ดูรายการ',
        onClick: () => console.log('View project details')
      }
    },
    {
      id: '2',
      title: 'งานที่สำเร็จ',
      message: 'งานที่สำเร็จ 2 ถูกอนุมัติ',
      type: 'success',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false,
      action: {
        label: 'ดูรายการ',
        onClick: () => console.log('View task details')
      }
    },
    {
      id: '3',
      title: 'คำเตือน',
      message: 'คำเตือนในงานที่ 1',
      type: 'warning',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      action: {
        label: 'แก้ไข',
        onClick: () => console.log('Dismiss notification')
      }
    },
    {
      id: '4',
      title: 'ระบบคำสั่ง',
      message: 'ระบบคำสั่ง 1 ถูกอนุมัติ',
      type: 'error',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      read: false,
      action: {
        label: 'แก้ไข',
        onClick: () => console.log('Retry submission')
      }
    }
  ]);

  const [showNotifications, setShowNotifications] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-50 text-green-800';
      case 'error':
        return 'border-red-500 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'info':
        return 'border-blue-500 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-500 bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div
          ref={notificationRef}
          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">การแจ้ง</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">4 รายการ</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
              >
                ทั้งหมดอ่านทั้งหมด
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'flex items-start space-x-3 p-4 border-b border-gray-100',
                  'hover:bg-gray-50',
                  'transition-colors duration-200',
                  getNotificationColor(notification.type)
                )}
              >
                <div className="flex-shrink-0">
                  <div className={cn(
                    'w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center',
                    notification.read ? 'opacity-50' : ''
                  )}
                  >
                    {notification.user?.avatar ? (
                      <img
                        src={notification.user.avatar}
                        alt={notification.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-full h-full text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-shrink-0">
                          <div className="sr-only">
                            {notification.type} notification
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.timestamp).toLocaleString('th-TH')}
                        </p>
                      </div>
                    </div>
                  </div>

                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="sr-only">Mark as read</div>
                      </div>
                    )}
                  </div>

                  {notification.action && (
                    <Button
                      variant={notification.action.variant}
                      size="sm"
                      onClick={notification.action.onClick}
                      className="ml-2"
                    >
                      {notification.action.label}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationSystem;
