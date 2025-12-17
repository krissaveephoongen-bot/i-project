import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminPINContextType {
  isPINVerified: boolean;
  verifyPIN: () => void;
  clearPINVerification: () => void;
  lastVerifiedAt: Date | null;
  isSessionExpired: () => boolean;
}

const AdminPINContext = createContext<AdminPINContextType | undefined>(undefined);

const PIN_SESSION_DURATION = 60 * 60 * 1000; // 1 hour
const PIN_SESSION_KEY = 'adminPINVerified';
const PIN_TIMESTAMP_KEY = 'adminPINVerifiedAt';

export const AdminPINProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPINVerified, setIsPINVerified] = useState(false);
  const [lastVerifiedAt, setLastVerifiedAt] = useState<Date | null>(null);

  // Check if PIN verification exists in sessionStorage on mount
  useEffect(() => {
    const storedVerification = sessionStorage.getItem(PIN_SESSION_KEY);
    const storedTimestamp = sessionStorage.getItem(PIN_TIMESTAMP_KEY);

    if (storedVerification === 'true' && storedTimestamp) {
      const verifiedAt = new Date(storedTimestamp);
      const now = new Date();
      const timeDiff = now.getTime() - verifiedAt.getTime();

      // Check if session is still valid
      if (timeDiff < PIN_SESSION_DURATION) {
        setIsPINVerified(true);
        setLastVerifiedAt(verifiedAt);
      } else {
        // Session expired, clear it
        sessionStorage.removeItem(PIN_SESSION_KEY);
        sessionStorage.removeItem(PIN_TIMESTAMP_KEY);
        setIsPINVerified(false);
        setLastVerifiedAt(null);
      }
    }
  }, []);

  const verifyPIN = () => {
    const now = new Date();
    sessionStorage.setItem(PIN_SESSION_KEY, 'true');
    sessionStorage.setItem(PIN_TIMESTAMP_KEY, now.toISOString());
    setIsPINVerified(true);
    setLastVerifiedAt(now);
  };

  const clearPINVerification = () => {
    sessionStorage.removeItem(PIN_SESSION_KEY);
    sessionStorage.removeItem(PIN_TIMESTAMP_KEY);
    setIsPINVerified(false);
    setLastVerifiedAt(null);
  };

  const isSessionExpired = (): boolean => {
    if (!lastVerifiedAt) return true;
    const now = new Date();
    const timeDiff = now.getTime() - lastVerifiedAt.getTime();
    return timeDiff >= PIN_SESSION_DURATION;
  };

  return (
    <AdminPINContext.Provider
      value={{
        isPINVerified,
        verifyPIN,
        clearPINVerification,
        lastVerifiedAt,
        isSessionExpired,
      }}
    >
      {children}
    </AdminPINContext.Provider>
  );
};

export const useAdminPIN = () => {
  const context = useContext(AdminPINContext);
  if (context === undefined) {
    throw new Error('useAdminPIN must be used within AdminPINProvider');
  }
  return context;
};
