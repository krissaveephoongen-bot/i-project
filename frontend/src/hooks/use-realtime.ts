import { useEffect, useState, useRef } from 'react';
import { db } from '../lib/neon-db';

interface UseRealtimeOptions {
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
}

interface RealtimePayload<T = any> {
  new: T;
  old: T;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

export function useRealtime<T = any>(
  options: UseRealtimeOptions,
  callback?: (payload: RealtimePayload<T>) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Polling interval in milliseconds
  const POLL_INTERVAL = 5000; // 5 seconds

  // Function to fetch updates
  const fetchUpdates = async () => {
    if (!callback) return;
    
    try {
      // Get the current timestamp
      const currentTime = new Date();
      
      // Query for updates since the last check using Drizzle ORM
      const client = await db.$client.connect();
      try {
        const query = `SELECT * FROM ${options.table} WHERE updated_at > $1 ORDER BY updated_at DESC`;
        const result = await client.query(query, [lastUpdate.toISOString()]);
        
        // If we have updates, call the callback for each one
        if (result.rows.length > 0) {
          result.rows.forEach((row: any) => {
            if (callback) {
              callback({
                new: row as T,
                old: {} as T, // We don't have the old values with this approach
                eventType: 'UPDATE' as const
              });
            }
          });
          
          // Update the last update time
          setLastUpdate(currentTime);
        }
      } catch (error) {
        console.error('Error executing query:', error);
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching updates:', error);
    }
  };

  useEffect(() => {
    // Set up polling
    intervalRef.current = setInterval(fetchUpdates, POLL_INTERVAL);
    setIsConnected(true);

    // Initial fetch
    fetchUpdates();

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [options.table, lastUpdate, callback]);

  return { isConnected };
}

// Hook for real-time project updates
export function useRealtimeProjects(callback?: (payload: RealtimePayload) => void) {
  return useRealtime({ table: 'projects' }, callback);
}

// Hook for real-time task updates
export function useRealtimeTasks(callback?: (payload: RealtimePayload) => void) {
  return useRealtime({ table: 'tasks' }, callback);
}

// Hook for real-time comments
export function useRealtimeComments(
  projectId?: string,
  taskId?: string,
  callback?: (payload: RealtimePayload) => void
) {
  // For polling, we'll handle the filtering in the fetchUpdates function
  return useRealtime({ 
    table: 'comments',
    // We'll handle the filtering in the fetchUpdates function
  }, (payload) => {
    // Apply filters here if needed
    if (projectId && payload.new.project_id !== projectId) return;
    if (taskId && payload.new.task_id !== taskId) return;
    
    if (callback) {
      callback(payload);
    }
  });
}
