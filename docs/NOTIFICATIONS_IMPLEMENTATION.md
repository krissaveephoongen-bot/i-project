# 🔔 Real-time Notifications System - Implementation Guide

## Overview
This guide walks you through building a complete notification system with real-time updates, email digests, and notification center UI.

---

## Phase 1: Backend Setup (API Layer)

### 1. Create Notification Service

**File:** `src/services/realtimeNotificationService.ts`

```typescript
import axios from 'axios';

export interface Notification {
  id: string;
  userId: string;
  type: 'task' | 'approval' | 'alert' | 'mention' | 'deadline' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  read: boolean;
  icon?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  approvalAlerts: boolean;
  weeklyDigest: boolean;
  doNotDisturb: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  notificationFrequency: 'instant' | 'daily' | 'weekly';
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class RealtimeNotificationService {
  private socket: any = null;
  private listeners: Map<string, Function[]> = new Map();

  // Initialize WebSocket connection
  async initializeWebSocket() {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      // For development, use Socket.io or Server-Sent Events
      // const io = await import('socket.io-client');
      // this.socket = io.default(API_URL, {
      //   auth: { token }
      // });

      // this.socket.on('notification', (data: Notification) => {
      //   this.emit('notification', data);
      // });

      // this.socket.on('disconnect', () => {
      //   console.log('Notification socket disconnected');
      // });

      return true;
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      return false;
    }
  }

  // Get notifications list
  async getNotifications(
    filters?: {
      read?: boolean;
      type?: Notification['type'];
      limit?: number;
      offset?: number;
    }
  ): Promise<Notification[]> {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const params = new URLSearchParams();

      if (filters?.read !== undefined) params.append('read', String(filters.read));
      if (filters?.type) params.append('type', filters.type);
      if (filters?.limit) params.append('limit', String(filters.limit));
      if (filters?.offset) params.append('offset', String(filters.offset));

      const response = await axios.get(`${API_URL}/notifications`, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data.count;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      await axios.patch(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  // Mark all as read
  async markAllAsRead(): Promise<boolean> {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      await axios.patch(`${API_URL}/notifications/read-all`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      return false;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      await axios.delete(`${API_URL}/notifications/${notificationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  }

  // Clear all notifications
  async clearAll(): Promise<boolean> {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      await axios.delete(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      return false;
    }
  }

  // Get preferences
  async getPreferences(): Promise<NotificationPreferences | null> {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notifications/preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return null;
    }
  }

  // Update preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      await axios.put(`${API_URL}/notifications/preferences`, preferences, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      return false;
    }
  }

  // Send test notification (for development)
  async sendTestNotification(type: Notification['type']): Promise<boolean> {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      await axios.post(`${API_URL}/notifications/test`, { type }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      return false;
    }
  }

  // Event emitter methods
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Clean up
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.listeners.clear();
  }
}

export default new RealtimeNotificationService();
```

---

## Phase 2: Frontend Components

### 2. Create Notification Center Page

**File:** `src/pages/NotificationCenter.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Bell, Trash2, Check, CheckCheck, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScrollContainer from '@/components/layout/ScrollContainer';
import realtimeNotificationService, { Notification } from '@/services/realtimeNotificationService';
import { toast } from 'react-hot-toast';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadNotifications();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      const [notifications, unreadCount] = await Promise.all([
        realtimeNotificationService.getNotifications({ limit: 100 }),
        realtimeNotificationService.getUnreadCount(),
      ]);

      setNotifications(notifications);
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await realtimeNotificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
      toast.success('Marked as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await realtimeNotificationService.markAllAsRead();
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    const success = await realtimeNotificationService.deleteNotification(notificationId);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Delete all notifications?')) {
      const success = await realtimeNotificationService.clearAll();
      if (success) {
        setNotifications([]);
        setUnreadCount(0);
        toast.success('All notifications cleared');
      }
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    const colors: Record<Notification['type'], string> = {
      task: 'bg-blue-100 text-blue-800',
      approval: 'bg-purple-100 text-purple-800',
      alert: 'bg-red-100 text-red-800',
      mention: 'bg-green-100 text-green-800',
      deadline: 'bg-orange-100 text-orange-800',
      system: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.system;
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    const colors: Record<Notification['priority'], string> = {
      low: 'border-l-2 border-blue-500',
      medium: 'border-l-4 border-orange-500',
      high: 'border-l-4 border-red-500',
      critical: 'border-l-4 border-red-700 bg-red-50',
    };
    return colors[priority] || colors.low;
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  return (
    <ScrollContainer>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Notifications
            </h1>
            <p className="text-gray-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => window.location.href = '/settings?tab=notifications'}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {filteredNotifications.length === 0 ? (
              <Card className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                <p className="text-gray-600 mt-2">
                  You're all caught up!
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map(notification => (
                  <Card
                    key={notification.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50' : 'hover:bg-gray-50'
                    } ${getPriorityColor(notification.priority)}`}
                    onClick={() => {
                      if (!notification.read) {
                        handleMarkAsRead(notification.id);
                      }
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <Badge className={getTypeColor(notification.type)}>
                            {notification.type}
                          </Badge>
                          {!notification.read && (
                            <Badge className="bg-blue-600">New</Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-700 mb-2">
                          {notification.message}
                        </p>

                        <p className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString('th-TH', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {notifications.length > 0 && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={handleClearAll}>
                  Clear all notifications
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollContainer>
  );
}
```

---

### 3. Create Notification Bell Widget

**File:** `src/components/NotificationBell.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import realtimeNotificationService, { Notification } from '@/services/realtimeNotificationService';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    const [notifications, unreadCount] = await Promise.all([
      realtimeNotificationService.getNotifications({ limit: 5 }),
      realtimeNotificationService.getUnreadCount(),
    ]);
    setNotifications(notifications);
    setUnreadCount(unreadCount);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No notifications
              </p>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg cursor-pointer text-sm ${
                    !notif.read ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setOpen(false);
                    navigate('/notifications');
                  }}
                >
                  <p className="font-medium text-gray-900">{notif.title}</p>
                  <p className="text-gray-600 line-clamp-2">{notif.message}</p>
                </div>
              ))
            )}
          </div>

          <button
            className="w-full mt-2 p-2 text-sm text-blue-600 hover:bg-gray-50 rounded"
            onClick={() => {
              setOpen(false);
              navigate('/notifications');
            }}
          >
            View all notifications →
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## Phase 3: Hook for Easy Integration

### 4. Create useNotifications Hook

**File:** `src/hooks/useNotifications.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import realtimeNotificationService, { Notification } from '@/services/realtimeNotificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        realtimeNotificationService.getNotifications({ limit: 100 }),
        realtimeNotificationService.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    const success = await realtimeNotificationService.markAsRead(id);
    if (success) {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    return success;
  }, []);

  const markAllAsRead = useCallback(async () => {
    const success = await realtimeNotificationService.markAllAsRead();
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
    return success;
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    const success = await realtimeNotificationService.deleteNotification(id);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
    return success;
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
```

---

## Phase 4: Add to Sidebar Navigation

Update `src/components/layout/Sidebar.tsx` to include notification bell:

```typescript
import NotificationBell from '../NotificationBell';

// In the header section, add:
<div className="flex items-center gap-2">
  <NotificationBell />
  {/* ... existing buttons ... */}
</div>
```

---

## Backend API Endpoints Required

```typescript
// Endpoints your backend needs to implement:

GET    /api/notifications                    // Get all notifications
GET    /api/notifications/unread-count       // Get unread count
POST   /api/notifications                    // Create notification (internal)
PATCH  /api/notifications/:id/read           // Mark as read
PATCH  /api/notifications/read-all           // Mark all as read
DELETE /api/notifications/:id                // Delete notification
DELETE /api/notifications                    // Clear all

GET    /api/notifications/preferences        // Get user preferences
PUT    /api/notifications/preferences        // Update preferences

POST   /api/notifications/test               // Send test (dev only)
```

---

## Testing the Feature

### Manual Testing Checklist

- [ ] Load notification center
- [ ] Mark single notification as read
- [ ] Mark all as read
- [ ] Delete notification
- [ ] Clear all notifications
- [ ] View unread count
- [ ] Open notification and navigate
- [ ] Check notification bell widget
- [ ] Test on mobile
- [ ] Check dark mode support

### API Testing

```bash
# Get notifications
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/notifications

# Mark as read
curl -X PATCH -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/notifications/NOTIF_ID/read

# Get preferences
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/notifications/preferences
```

---

## Next Steps

1. **Backend Implementation:**
   - Create API endpoints
   - Add database schema
   - Implement WebSocket connection

2. **Frontend Integration:**
   - Copy the above files
   - Update Sidebar.tsx
   - Add route: `/notifications`

3. **Testing:**
   - Test all CRUD operations
   - Test real-time updates
   - Test mobile responsiveness

4. **Deployment:**
   - Set environment variables
   - Enable WebSocket on server
   - Configure email service

---

**Estimated Implementation Time:** 2-3 days (backend + frontend + testing)

