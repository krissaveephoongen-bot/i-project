import React, { useEffect, useState } from 'react';
import { sessionManagement } from '../utils/auth';
import SessionTimeoutWarning from './SessionTimeoutWarning';

const SessionManager = ({ children, onSessionExpire, onReauthRequired }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [logoutTimer, setLogoutTimer] = useState(null);
  const [reauthTimer, setReauthTimer] = useState(null);

  // Check session validity and update UI accordingly
  const checkSession = () => {
    const sessionInfo = sessionManagement.getSessionInfo();
    const lastActivity = parseInt(sessionInfo.lastActivity || '0');
    const sessionStart = parseInt(sessionInfo.sessionStart || '0');
    const currentTime = Date.now();

    // Check if session has been active for too long (force reauth)
    if (sessionStart && (currentTime - sessionStart) > sessionManagement.FORCE_REAUTH_AFTER) {
      handleReauthRequired();
      return;
    }

    // Check for session timeout
    const timeRemaining = (lastActivity + sessionManagement.SESSION_TIMEOUT) - currentTime;
    
    if (timeRemaining <= 0) {
      handleSessionExpire();
      return;
    }

    // Show warning if less than 5 minutes remain
    if (timeRemaining <= 5 * 60 * 1000) {
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

  // Start countdown timer for session expiration
  const startCountdown = (seconds) => {
    setCountdown(seconds);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSessionExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setLogoutTimer(timer);
  };

  // Handle session expiration
  const handleSessionExpire = () => {
    if (logoutTimer) {
      clearInterval(logoutTimer);
    }
    if (reauthTimer) {
      clearTimeout(reauthTimer);
    }
    setShowWarning(false);
    onSessionExpire?.();
  };

  // Handle reauthentication required
  const handleReauthRequired = () => {
    if (logoutTimer) {
      clearInterval(logoutTimer);
    }
    if (reauthTimer) {
      clearTimeout(reauthTimer);
    }
    setShowWarning(false);
    onReauthRequired?.();
  };

  // Continue the current session
  const handleContinueSession = () => {
    // Reset the last activity time
    sessionManagement.updateLastActivity();
    setShowWarning(false);
    
    if (logoutTimer) {
      clearInterval(logoutTimer);
      setLogoutTimer(null);
    }
    
    // Check session again after continuing
    checkSession();
  };

  // Set up session monitoring
  useEffect(() => {
    // Initial check
    checkSession();

    // Set up interval to check session periodically
    const sessionCheckInterval = setInterval(checkSession, 30000); // Check every 30 seconds

    // Set up activity listeners to update last activity time
    const updateActivity = () => {
      if (document.visibilityState === 'visible') {
        sessionManagement.updateLastActivity();
      }
    };

    const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Clean up
    return () => {
      clearInterval(sessionCheckInterval);
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      if (logoutTimer) clearInterval(logoutTimer);
      if (reauthTimer) clearTimeout(reauthTimer);
    };
  }, [logoutTimer, reauthTimer]);

  return (
    <>
      {children}
      {showWarning && (
        <SessionTimeoutWarning
          countdown={countdown}
          onContinue={handleContinueSession}
          onLogout={handleSessionExpire}
        />
      )}
    </>
  );
};

export default SessionManager;
