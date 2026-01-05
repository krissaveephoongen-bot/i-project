/**
 * Authentication and Session Management
 * 
 * Session Management Features:
 * - Token-based authentication with JWT
 * - Session timeout after inactivity
 * - Forced re-authentication for sensitive operations
 * - Token refresh mechanism
 * - Multiple device session tracking
 */

// Session configuration
const SESSION_CONFIG = {
    // Session will expire after 30 minutes of inactivity
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
    // Token refresh interval (5 minutes before token expires)
    TOKEN_REFRESH_INTERVAL: 25 * 60 * 1000, // 25 minutes
    // Force re-authentication for sensitive operations
    FORCE_REAUTH_AFTER: 8 * 60 * 60 * 1000, // 8 hours
    // Session storage keys
    KEYS: {
        TOKEN: 'auth_token',
        REFRESH_TOKEN: 'refresh_token',
        USER: 'user_data',
        LAST_ACTIVITY: 'last_activity',
        SESSION_START: 'session_start',
        SESSION_ID: 'session_id',
        DEVICE_ID: 'device_id',
        REQUIRES_REAUTH: 'requires_reauth'
    }
};

// Initialize session tracking
const initSession = () => {
    // Generate a unique session ID if it doesn't exist
    if (!localStorage.getItem(SESSION_CONFIG.KEYS.SESSION_ID)) {
        localStorage.setItem(SESSION_CONFIG.KEYS.SESSION_ID, generateUUID());
    }
    
    // Generate a device ID if it doesn't exist
    if (!localStorage.getItem(SESSION_CONFIG.KEYS.DEVICE_ID)) {
        localStorage.setItem(SESSION_CONFIG.KEYS.DEVICE_ID, generateUUID());
    }
    
    // Initialize last activity time
    updateLastActivity();
    
    // Set up activity listeners
    setupActivityListeners();
};

// Generate a UUID v4
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Update last activity timestamp
const updateLastActivity = () => {
    localStorage.setItem(SESSION_CONFIG.KEYS.LAST_ACTIVITY, Date.now().toString());
};

// Set up activity listeners to track user activity
const setupActivityListeners = () => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach(event => {
        window.addEventListener(event, updateLastActivity, { passive: true });
    });
};

// Check if session is valid
const isSessionValid = () => {
    const lastActivity = localStorage.getItem(SESSION_CONFIG.KEYS.LAST_ACTIVITY);
    const sessionStart = localStorage.getItem(SESSION_CONFIG.KEYS.SESSION_START);
    const currentTime = Date.now();
    
    // Check if session has timed out due to inactivity
    if (lastActivity && (currentTime - parseInt(lastActivity) > SESSION_CONFIG.SESSION_TIMEOUT)) {
        return false;
    }
    
    // Check if session has exceeded maximum duration
    if (sessionStart && (currentTime - parseInt(sessionStart) > SESSION_CONFIG.FORCE_REAUTH_AFTER)) {
        return false;
    }
    
    return true;
};

// Check if user is authenticated with valid session
export const isAuthenticated = () => {
    const token = localStorage.getItem(SESSION_CONFIG.KEYS.TOKEN);
    const userData = localStorage.getItem(SESSION_CONFIG.KEYS.USER);
    const userRole = userData ? JSON.parse(userData).role : null;
    
    // Basic validation
    if (!token || !userData || userRole !== 'admin') {
        return false;
    }
    
    // Check session validity
    return isSessionValid();
};

// Require authentication with optional force re-authentication
export const requireAuth = (options = {}) => {
    const { forceReauth = false } = options;
    
    // Check if already requires re-authentication
    if (forceReauth || localStorage.getItem(SESSION_CONFIG.KEYS.REQUIRES_REAUTH) === 'true') {
        redirectToLogin({ reauth: true });
        return false;
    }
    
    // Check authentication and session validity
    if (!isAuthenticated()) {
        redirectToLogin();
        return false;
    }
    
    // Update last activity
    updateLastActivity();
    
    return true;
};

// Redirect to login page with optional re-authentication flag
const redirectToLogin = ({ reauth = false } = {}) => {
    // Clear sensitive data but keep device ID and session ID
    const deviceId = localStorage.getItem(SESSION_CONFIG.KEYS.DEVICE_ID);
    const sessionId = localStorage.getItem(SESSION_CONFIG.KEYS.SESSION_ID);
    
    // Clear all auth-related data
    Object.values(SESSION_CONFIG.KEYS).forEach(key => {
        if (key !== SESSION_CONFIG.KEYS.DEVICE_ID && key !== SESSION_CONFIG.KEYS.SESSION_ID) {
            localStorage.removeItem(key);
        }
    });
    
    // Redirect to login with re-authentication flag if needed
    const redirectUrl = reauth ? 'login.html?reauth=1' : 'login.html';
    window.location.href = redirectUrl;
};

// Login function to set up session
export const login = (authData) => {
    const { token, refreshToken, user } = authData;
    
    // Store authentication data
    localStorage.setItem(SESSION_CONFIG.KEYS.TOKEN, token);
    localStorage.setItem(SESSION_CONFIG.KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(SESSION_CONFIG.KEYS.USER, JSON.stringify(user));
    localStorage.setItem(SESSION_CONFIG.KEYS.SESSION_START, Date.now().toString());
    localStorage.setItem(SESSION_CONFIG.KEYS.LAST_ACTIVITY, Date.now().toString());
    localStorage.setItem('isLoggedIn', 'true');
    
    // Start token refresh interval
    startTokenRefresh();
    
    // Start session monitoring
    startSessionMonitor();
};

// Logout function
export const logout = () => {
    // Clear all session data
    Object.values(SESSION_CONFIG.KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    
    // Clear other auth-related data
    localStorage.removeItem('isLoggedIn');
    
    // Redirect to login page
    window.location.href = 'login.html';
};

// Force re-authentication for sensitive operations
export const requireReauthentication = () => {
    localStorage.setItem(SESSION_CONFIG.KEYS.REQUIRES_REAUTH, 'true');
    redirectToLogin({ reauth: true });
};

// Start token refresh interval
const startTokenRefresh = () => {
    // Clear any existing refresh interval
    if (window.tokenRefreshInterval) {
        clearInterval(window.tokenRefreshInterval);
    }
    
    // Set up new refresh interval
    window.tokenRefreshInterval = setInterval(() => {
        refreshToken().catch(() => {
            // If refresh fails, log out the user
            logout();
        });
    }, SESSION_CONFIG.TOKEN_REFRESH_INTERVAL);
};

// Refresh access token
const refreshToken = async () => {
    const refreshToken = localStorage.getItem(SESSION_CONFIG.KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }
    
    try {
        const response = await fetch('/api/auth/refresh-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`
            },
            body: JSON.stringify({
                deviceId: localStorage.getItem(SESSION_CONFIG.KEYS.DEVICE_ID),
                sessionId: localStorage.getItem(SESSION_CONFIG.KEYS.SESSION_ID)
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }
        
        const data = await response.json();
        
        // Update tokens
        localStorage.setItem(SESSION_CONFIG.KEYS.TOKEN, data.token);
        if (data.refreshToken) {
            localStorage.setItem(SESSION_CONFIG.KEYS.REFRESH_TOKEN, data.refreshToken);
        }
        
        return data.token;
    } catch (error) {
        console.error('Token refresh failed:', error);
        throw error;
    }
};

// Monitor session activity
const startSessionMonitor = () => {
    // Clear any existing monitor
    if (window.sessionMonitorInterval) {
        clearInterval(window.sessionMonitorInterval);
    }
    
    // Check session validity every minute
    window.sessionMonitorInterval = setInterval(() => {
        if (!isSessionValid()) {
            logout();
        }
    }, 60000); // Check every minute
};

// Initialize session management when module loads
initSession();

// Export session management functions
export const sessionManagement = {
    initSession,
    isSessionValid,
    updateLastActivity,
    requireReauthentication,
    refreshToken,
    getSessionInfo: () => ({
        sessionId: localStorage.getItem(SESSION_CONFIG.KEYS.SESSION_ID),
        deviceId: localStorage.getItem(SESSION_CONFIG.KEYS.DEVICE_ID),
        lastActivity: localStorage.getItem(SESSION_CONFIG.KEYS.LAST_ACTIVITY),
        sessionStart: localStorage.getItem(SESSION_CONFIG.KEYS.SESSION_START)
    })
};
