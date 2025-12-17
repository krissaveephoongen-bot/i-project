import React, { useEffect, useState } from 'react';
import { sessionManagement } from '../utils/auth';

const SESSION_TIMEOUT_WARNING = 5 * 60 * 1000; // Show warning 5 minutes before session expires

const SessionTimeoutWarning = ({ onLogout, onContinue }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [logoutTimer, setLogoutTimer] = useState(null);

  useEffect(() => {
    const checkSession = () => {
      const lastActivity = parseInt(localStorage.getItem('last_activity') || '0');
      const currentTime = Date.now();
      const timeRemaining = (lastActivity + sessionManagement.SESSION_TIMEOUT) - currentTime;

      // Show warning if less than SESSION_TIMEOUT_WARNING remains
      if (timeRemaining <= SESSION_TIMEOUT_WARNING) {
        setShowWarning(true);
        startCountdown(Math.floor(timeRemaining / 1000));
      } else {
        setShowWarning(false);
        if (logoutTimer) {
          clearTimeout(logoutTimer);
          setLogoutTimer(null);
        }
      }
    };

    // Check session every 30 seconds
    const sessionCheckInterval = setInterval(checkSession, 30000);
    checkSession(); // Initial check

    return () => {
      clearInterval(sessionCheckInterval);
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
    };
  }, [logoutTimer]);

  const startCountdown = (seconds) => {
    setCountdown(seconds);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setLogoutTimer(timer);
  };

  const handleLogout = () => {
    if (logoutTimer) {
      clearInterval(logoutTimer);
    }
    onLogout();
  };

  const handleContinue = () => {
    // Reset activity and hide warning
    sessionManagement.updateLastActivity();
    setShowWarning(false);
    if (logoutTimer) {
      clearInterval(logoutTimer);
      setLogoutTimer(null);
    }
    onContinue();
  };

  if (!showWarning) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Session Timeout Warning
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Your session will expire in {minutes}:{seconds < 10 ? '0' : ''}{seconds} due to inactivity.
            Would you like to continue?
          </p>
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={handleContinue}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue Session
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
