import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { LoadingStage } from '../components/ProgressLoading';

type ProgressMessage = {
  type: 'start' | 'update' | 'complete' | 'error' | 'connection_ack';
  stages?: LoadingStage[];
  progress?: number;
  message?: string;
};

export const useProgressSocket = (serverUrl: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stages, setStages] = useState<LoadingStage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!serverUrl) return;

    const ws = new WebSocket(serverUrl);
    webSocketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
      // Optional: implement reconnect logic here
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      const errorMessage = 'WebSocket connection failed. Please ensure the backend server is running.';
      setError(errorMessage);
      toast.error(errorMessage);
    };

    ws.onmessage = (event) => {
      try {
        const data: ProgressMessage = JSON.parse(event.data);
        
        switch (data.type) {
          case 'connection_ack':
            console.log('Server acknowledged connection');
            break;
          case 'start':
            setIsLoading(true);
            setStages(data.stages || []);
            setProgress(data.progress || 0);
            setError(null);
            break;
          case 'update':
            if (data.stages) {
              setStages(data.stages);
            }
            if (data.progress) {
              setProgress(data.progress);
            }
            break;
          case 'complete':
            setIsLoading(false);
            if (data.stages) {
              setStages(data.stages);
            }
            setProgress(100);
            toast.success('Data simulation completed successfully!');
            // Can be closed after a delay
            // setTimeout(() => setProgress(0), 2000); 
            break;
          case 'error':
            setIsLoading(false);
            const errorMessage = data.message || 'An unknown error occurred during the process.';
            setError(errorMessage);
            toast.error(errorMessage);
            break;
        }
      } catch (e) {
        console.error('Failed to parse message:', event.data);
        toast.error('Received an invalid message from the server.');
      }
    };

    return () => {
      ws.close();
    };
  }, [serverUrl]);

  const startSimulation = useCallback(async (apiUrl: string) => {
    if (isLoading) {
      const msg = 'Simulation is already in progress.';
      console.warn(msg);
      toast.error(msg);
      return;
    }
    console.log('Requesting to start simulation...');
    try {
      const response = await fetch(apiUrl, { method: 'POST' });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to start simulation: ${response.status} ${errorText}`);
      }
      // The simulation starts on the backend, and progress will be sent via WebSocket
      const result = await response.json();
      console.log('Simulation started:', result.message);
      toast.success('Simulation initiated!');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast.error(err.message);
    }
  }, [isLoading]);

  return { isConnected, isLoading, progress, stages, error, startSimulation };
};
