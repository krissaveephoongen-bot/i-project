import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  read: boolean;
  createdAt: Date;
  action?: {
    label: string;
    href: string;
  };
}

interface NotificationCenterProps {
  notifications?: NotificationItem[];
  onClear?: () => void;
  onMarkAsRead?: (id: string) => void;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
    case 'error':
      return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500';
    case 'info':
      return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
    default:
      return 'bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-600';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ℹ';
    default:
      return '•';
  }
};

export function NotificationCenter({
  notifications = [],
  onClear,
  onMarkAsRead,
}: NotificationCenterProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-600 rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="text-xs"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700 ${getTypeColor(
                    notification.type
                  )} ${!notification.read ? 'opacity-100' : 'opacity-75'}`}
                  onClick={() => onMarkAsRead?.(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 font-bold text-lg">
                      {getTypeIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="flex-shrink-0 h-2 w-2 mt-2 bg-indigo-600 rounded-full" />
                        )}
                      </div>

                      {notification.message && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>

                        {notification.action && (
                          <a
                            href={notification.action.href}
                            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {notification.action.label}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
