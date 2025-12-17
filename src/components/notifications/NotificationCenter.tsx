import React, { useEffect, useState, useCallback } from 'react';
import { Bell, X, Check, Settings, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getNotificationService,
  Notification,
  NotificationPreference
} from '@/services/notificationService';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import { Badge } from '../ui/badge';

interface NotificationCenterProps {
  userId: string;
  token: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, token }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const notificationService = getNotificationService();

  // Initialize connection
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Connect to WebSocket
        await notificationService.connect(userId, token);

        // Load preferences
        const prefs = await notificationService.getPreferences();
        if (prefs) setPreferences(prefs);

        // Load unread count
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);

        // Subscribe to notifications
        const unsubscribe = notificationService.subscribe('all', (notification) => {
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast
          showNotificationToast(notification);
        });

        // Subscribe to connection changes
        const unsubscribeConnection = notificationService.onConnectionChange((connected) => {
          setConnected(connected);
        });

        return () => {
          unsubscribe();
          unsubscribeConnection();
        };
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
        toast.error('Failed to connect to notifications');
      }
    };

    if (userId && token) {
      initializeNotifications();
    }

    return () => {
      notificationService.disconnect();
    };
  }, [userId, token, notificationService]);

  const showNotificationToast = (notification: Notification) => {
    const getMessage = () => {
      switch (notification.type) {
        case 'error':
          return toast.error(notification.title);
        case 'warning':
          return toast(notification.title, {
            icon: '⚠️'
          });
        case 'success':
          return toast.success(notification.title);
        default:
          return toast(notification.title);
      }
    };
    getMessage();
  };

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [notificationService]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [notificationService]);

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all notifications?')) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handlePreferenceChange = useCallback(async (key: keyof NotificationPreference, value: any) => {
    try {
      setLoading(true);
      await notificationService.updatePreferences({
        [key]: value
      });
      setPreferences(prev => prev ? { ...prev, [key]: value } : null);
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  }, [notificationService]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        title="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {!connected && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-gray-50">
            <div>
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <p className="text-xs text-gray-600">{unreadCount} unread</p>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <Settings className="h-4 w-4 text-gray-600" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Notification Preferences</DialogTitle>
                  </DialogHeader>
                  {preferences && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={preferences.emailNotifications}
                            onChange={(e) =>
                              handlePreferenceChange('emailNotifications', e.target.checked)
                            }
                            disabled={loading}
                          />
                          <span>Email Notifications</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={preferences.pushNotifications}
                            onChange={(e) =>
                              handlePreferenceChange('pushNotifications', e.target.checked)
                            }
                            disabled={loading}
                          />
                          <span>Push Notifications</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={preferences.inAppNotifications}
                            onChange={(e) =>
                              handlePreferenceChange('inAppNotifications', e.target.checked)
                            }
                            disabled={loading}
                          />
                          <span>In-App Notifications</span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Notification Frequency
                        </label>
                        <select
                          value={preferences.notificationFrequency}
                          onChange={(e) =>
                            handlePreferenceChange(
                              'notificationFrequency',
                              e.target.value as any
                            )
                          }
                          disabled={loading}
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="immediate">Immediate</option>
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Categories</label>
                        {Object.entries(preferences.categories).map(([key, value]) => (
                          <label key={key} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                handlePreferenceChange('categories', {
                                  ...preferences.categories,
                                  [key]: e.target.checked
                                })
                              }
                              disabled={loading}
                            />
                            <span className="capitalize">{key}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${
                      notification.type === 'error'
                        ? 'border-red-500'
                        : notification.type === 'success'
                        ? 'border-green-500'
                        : notification.type === 'warning'
                        ? 'border-yellow-500'
                        : 'border-blue-500'
                    }`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          notification.type === 'error'
                            ? 'bg-red-100 text-red-600'
                            : notification.type === 'success'
                            ? 'bg-green-100 text-green-600'
                            : notification.type === 'warning'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50 flex gap-2">
              <button
                onClick={handleMarkAllAsRead}
                className="flex-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
