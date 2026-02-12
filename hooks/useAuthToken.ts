import { useEffect, useState } from 'react';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Hook to manage authentication tokens
 * Handles token storage, retrieval, and refresh
 */
export function useAuthToken() {
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const storedTokens = localStorage.getItem('authTokens');
    if (storedTokens) {
      try {
        setTokens(JSON.parse(storedTokens));
      } catch (error) {
        console.error('Failed to parse stored tokens:', error);
        localStorage.removeItem('authTokens');
      }
    }
    setIsLoading(false);
  }, []);

  const setTokensAndPersist = (newTokens: AuthTokens) => {
    setTokens(newTokens);
    localStorage.setItem('authTokens', JSON.stringify(newTokens));
  };

  const clearTokens = () => {
    setTokens(null);
    localStorage.removeItem('authTokens');
  };

  const getAccessToken = (): string | null => {
    return tokens?.accessToken || null;
  };

  const getRefreshToken = (): string | null => {
    return tokens?.refreshToken || null;
  };

  const getAuthHeader = (): string | null => {
    const accessToken = getAccessToken();
    return accessToken ? `Bearer ${accessToken}` : null;
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        clearTokens();
        return false;
      }

      const data = await response.json();
      setTokensAndPersist({
        accessToken: data.accessToken,
        refreshToken: refreshToken // Refresh token stays the same
      });

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearTokens();
      return false;
    }
  };

  return {
    tokens,
    isLoading,
    setTokens: setTokensAndPersist,
    clearTokens,
    getAccessToken,
    getRefreshToken,
    getAuthHeader,
    refreshAccessToken,
    isAuthenticated: !!tokens?.accessToken
  };
}
