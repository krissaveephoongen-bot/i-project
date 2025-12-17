import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        { title: 'New Task', message: 'You have been assigned a new task', type: 'info' as const },
        { title: 'Project Update', message: 'Project "Mobile App" status changed', type: 'success' as const },
        { title: 'Deadline Reminder', message: 'Task "API Integration" is due tomorrow', type: 'warning' as const },
        { title: 'Team Message', message: 'John Doe mentioned you in a comment', type: 'info' as const },
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      const newNotification: Notification = {
        id: Date.now().toString(),
        ...randomMessage,
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      const getIcon = () => {
        switch(randomMessage.type) {
          case 'success': return '✅';
          case 'error': return '❌';
          case 'warning': return '⚠️';
          case 'info': return 'ℹ️';
          default: return 'ℹ️';
        }
      };
      
      toast(randomMessage.message, {
        icon: getIcon(),
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}
