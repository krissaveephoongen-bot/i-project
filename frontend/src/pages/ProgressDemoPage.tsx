import React, { useState } from 'react';
import { useProgressSocket } from '../hooks/useProgressSocket';
import { ProgressLoading } from '../components/ProgressLoading';

// Configuration
// Use VITE_WS_URL from environment, fallback to local for dev.
const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
// Use relative path for API, Vite proxy will handle it.
const API_URL = '/api/progress/start-simulation'; 

const ProgressDemoPage: React.FC = () => {
  const { isConnected, isLoading, progress, stages, error, startSimulation } = useProgressSocket(WEBSOCKET_URL);
  const [showLoader, setShowLoader] = useState(false);

  const handleStartClick = () => {
    startSimulation(API_URL);
    setShowLoader(true);
  };

  const handleCloseLoader = () => {
    setShowLoader(false);
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Real-Time Progress Demo</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          This page demonstrates the `ProgressLoading` component driven by real-time updates from the backend via WebSockets.
        </p>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-3">Controls</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleStartClick}
              disabled={isLoading || !isConnected}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Loading...' : 'Start Data Simulation'}
            </button>
            <div className={`text-sm flex items-center gap-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
              <span className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
            </div>
          </div>
           {error && <p className="text-red-500 mt-4">Error: {error}</p>}
        </div>

        {showLoader && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Live `ProgressLoading` Component</h2>
            
            <h3 className="text-lg font-medium mb-3">"Detailed" Variant (Default)</h3>
            <div className="mb-8 relative -mx-8">
              <ProgressLoading
                variant="detailed"
                stages={stages}
                progress={progress}
                title="Simulating Data Fetch"
                subtitle="Receiving live updates from the server..."
              />
            </div>

            <h3 className="text-lg font-medium mb-3">"Toast" Variant</h3>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">This variant is non-blocking and appears in the corner.</p>
            <ProgressLoading
              variant="toast"
              stages={stages}
              progress={progress}
              title="Background Sync"
              onClose={handleCloseLoader}
              showStages={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressDemoPage;
