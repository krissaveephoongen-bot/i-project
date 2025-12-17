import { useState, useEffect } from 'react';
import { collaborationService } from '../services/collaborationService';
import { Task, Project, Activity } from '../services/dataService';

export function useCollaboration() {
  const [connectionStatus, setConnectionStatus] = useState(collaborationService.getConnectionStatus());
  const [activeUsers, setActiveUsers] = useState<Array<{ userId: string; lastActive: string; status: string }>>([]);
  const [chatMessages, setChatMessages] = useState<Array<{
    projectId: string;
    senderId: string;
    content: string;
    timestamp: string;
  }>>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Connect to collaboration service on mount
  useEffect(() => {
    collaborationService.connect();

    // Set up event listeners
    const unsubscribePresence = collaborationService.subscribe('presence:update', (data: { userId: string; lastActive: string; status: string }) => {
      setActiveUsers(prev => {
        const existingIndex = prev.findIndex(u => u.userId === data.userId);
        if (existingIndex >= 0) {
          return [...prev.slice(0, existingIndex), data, ...prev.slice(existingIndex + 1)];
        }
        return [...prev, data];
      });
    });

    const unsubscribeChat = collaborationService.subscribe('chat:message', (message: {
      projectId: string;
      senderId: string;
      content: string;
      timestamp: string;
    }) => {
      setChatMessages(prev => [...prev, message]);
    });

    const unsubscribeConnection = collaborationService.getMockWebSocket().onopen = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
    };

    collaborationService.getMockWebSocket().onclose = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };

    // Cleanup
    return () => {
      unsubscribePresence();
      unsubscribeChat();
      collaborationService.disconnect();
    };
  }, []);

  // Update user presence
  const updatePresence = (status: string) => {
    // In a real app, this would use the current user ID
    collaborationService.updateUserPresence('current-user-id', status);
  };

  // Send chat message
  const sendMessage = (projectId: string, content: string) => {
    collaborationService.sendChatMessage(projectId, {
      senderId: 'current-user-id', // Would be actual user ID in real app
      content,
      timestamp: new Date().toISOString()
    });
  };

  // Update task in real-time
  const updateTaskRealTime = (taskId: string, updates: Partial<Task>) => {
    collaborationService.updateTaskInRealTime(taskId, updates);
  };

  // Update project in real-time
  const updateProjectRealTime = (projectId: string, updates: Partial<Project>) => {
    collaborationService.updateProjectInRealTime(projectId, updates);
  };

  // Add activity in real-time
  const addActivityRealTime = (activity: Activity) => {
    collaborationService.addRealTimeActivity(activity);
  };

  // Start document collaboration
  const startDocumentCollaboration = (documentId: string, initialContent: string) => {
    collaborationService.startDocumentCollaboration(documentId, initialContent);
  };

  // Update document content
  const updateDocumentContent = (documentId: string, delta: any) => {
    collaborationService.updateDocumentContent(documentId, delta, 'current-user');
  };

  return {
    connectionStatus,
    isConnected,
    activeUsers,
    chatMessages,
    updatePresence,
    sendMessage,
    updateTaskRealTime,
    updateProjectRealTime,
    addActivityRealTime,
    startDocumentCollaboration,
    updateDocumentContent,
    connect: collaborationService.connect,
    disconnect: collaborationService.disconnect,
  };
}