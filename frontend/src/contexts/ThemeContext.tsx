import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

export type ThemeType = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange' | 'custom';

export interface Theme {
  id: ThemeType;
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
  };
}

export const themes: Record<ThemeType, Theme> = {
  light: {
    id: 'light',
    name: 'light',
    displayName: 'สว่าง',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      accent: '#3b82f6',
    },
  },
  dark: {
    id: 'dark',
    name: 'dark',
    displayName: 'มืด',
    colors: {
      primary: '#60a5fa',
      secondary: '#4b5563',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#374151',
      accent: '#60a5fa',
    },
  },
  blue: {
    id: 'blue',
    name: 'blue',
    displayName: 'น้ำเงิน',
    colors: {
      primary: '#2563eb',
      secondary: '#1e40af',
      background: '#eff6ff',
      surface: '#dbeafe',
      text: '#1e3a8a',
      textSecondary: '#64748b',
      border: '#3b82f6',
      accent: '#2563eb',
    },
  },
  green: {
    id: 'green',
    name: 'green',
    displayName: 'เขียว',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      background: '#ecfdf5',
      surface: '#d1fae5',
      text: '#064e3b',
      textSecondary: '#047857',
      border: '#10b981',
      accent: '#10b981',
    },
  },
  purple: {
    id: 'purple',
    name: 'purple',
    displayName: 'ม่วง',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      background: '#faf5ff',
      surface: '#ede9fe',
      text: '#581c87',
      textSecondary: '#6d28d9',
      border: '#8b5cf6',
      accent: '#8b5cf6',
    },
  },
  orange: {
    id: 'orange',
    name: 'orange',
    displayName: 'ส้ม',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      background: '#fff7ed',
      surface: '#fed7aa',
      text: '#9a3412',
      textSecondary: '#c2410c',
      border: '#f97316',
      accent: '#f97316',
    },
  },
  custom: {
    id: 'custom',
    name: 'custom',
    displayName: 'กำหนดเอง',
    colors: {
      primary: '#dc2626',
      secondary: '#b91c1c',
      background: '#fef2f2',
      surface: '#fee2e2',
      text: '#991b1b',
      textSecondary: '#7f1d1d',
      border: '#dc2626',
      accent: '#dc2626',
    },
  },
};

interface ThemeState {
  currentTheme: ThemeType;
  theme: Theme;
  isAdminMode: boolean;
  customThemes: Theme[];
}

type ThemeAction =
  | { type: 'SET_THEME'; payload: { theme: ThemeType; requireAdmin?: boolean } }
  | { type: 'TOGGLE_ADMIN_MODE' }
  | { type: 'ADD_CUSTOM_THEME'; payload: Theme }
  | { type: 'REMOVE_CUSTOM_THEME'; payload: ThemeType }
  | { type: 'UPDATE_CUSTOM_THEME'; payload: { id: ThemeType; theme: Theme } };

const initialState: ThemeState = {
  currentTheme: (localStorage.getItem('selectedTheme') as ThemeType) || 'light',
  theme: themes[(localStorage.getItem('selectedTheme') as ThemeType) || 'light'],
  isAdminMode: false,
  customThemes: [],
};

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_THEME':
      // Check if admin authentication is required
      if (action.payload.requireAdmin && !state.isAdminMode) {
        return state;
      }
      
      const newTheme = themes[action.payload.theme];
      localStorage.setItem('selectedTheme', action.payload.theme);
      localStorage.setItem('themeColors', JSON.stringify(newTheme.colors));
      
      return {
        ...state,
        currentTheme: action.payload.theme,
        theme: newTheme,
      };

    case 'TOGGLE_ADMIN_MODE':
      return {
        ...state,
        isAdminMode: !state.isAdminMode,
      };

    case 'ADD_CUSTOM_THEME':
      const updatedCustomThemes = [...state.customThemes, action.payload];
      localStorage.setItem('customThemes', JSON.stringify(updatedCustomThemes));
      return {
        ...state,
        customThemes: updatedCustomThemes,
      };

    case 'REMOVE_CUSTOM_THEME':
      const filteredCustomThemes = state.customThemes.filter(t => t.id !== action.payload);
      localStorage.setItem('customThemes', JSON.stringify(filteredCustomThemes));
      return {
        ...state,
        customThemes: filteredCustomThemes,
      };

    case 'UPDATE_CUSTOM_THEME':
      const updatedThemes = state.customThemes.map(t => 
        t.id === action.payload.id ? action.payload.theme : t
      );
      localStorage.setItem('customThemes', JSON.stringify(updatedThemes));
      return {
        ...state,
        customThemes: updatedThemes,
      };

    default:
      return state;
  }
}

interface ThemeContextType {
  state: ThemeState;
  dispatch: React.Dispatch<ThemeAction>;
  setTheme: (theme: ThemeType, requireAdmin?: boolean) => void;
  toggleAdminMode: () => void;
  addCustomTheme: (theme: Theme) => void;
  removeCustomTheme: (themeId: ThemeType) => void;
  updateCustomTheme: (themeId: ThemeType, theme: Theme) => void;
  verifyAdminPassword: (password: string) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Load custom themes from localStorage on mount
  useEffect(() => {
    const savedCustomThemes = localStorage.getItem('customThemes');
    if (savedCustomThemes) {
      try {
        const customThemes = JSON.parse(savedCustomThemes);
        dispatch({ type: 'ADD_CUSTOM_THEME', payload: customThemes });
      } catch (error) {
        console.error('Error loading custom themes:', error);
      }
    }

    // Load saved theme colors for custom theme
    const savedColors = localStorage.getItem('themeColors');
    if (savedColors && state.currentTheme === 'custom') {
      try {
        const colors = JSON.parse(savedColors);
        const customTheme = {
          ...themes.custom,
          colors,
        };
        dispatch({ type: 'UPDATE_CUSTOM_THEME', payload: { id: 'custom', theme: customTheme } });
      } catch (error) {
        console.error('Error loading custom theme colors:', error);
      }
    }
  }, []);

  // Apply theme colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const colors = state.theme.colors;
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [state.theme]);

  const setTheme = (theme: ThemeType, requireAdmin = false) => {
    dispatch({ type: 'SET_THEME', payload: { theme, requireAdmin } });
  };

  const toggleAdminMode = () => {
    dispatch({ type: 'TOGGLE_ADMIN_MODE' });
  };

  const addCustomTheme = (theme: Theme) => {
    dispatch({ type: 'ADD_CUSTOM_THEME', payload: theme });
  };

  const removeCustomTheme = (themeId: ThemeType) => {
    dispatch({ type: 'REMOVE_CUSTOM_THEME', payload: themeId });
  };

  const updateCustomTheme = (themeId: ThemeType, theme: Theme) => {
    dispatch({ type: 'UPDATE_CUSTOM_THEME', payload: { id: themeId, theme } });
  };

  const verifyAdminPassword = (password: string): boolean => {
    // In production, this should verify against a secure backend endpoint
    // For demo purposes, using a simple password
    const ADMIN_PASSWORD = 'admin123';
    return password === ADMIN_PASSWORD;
  };

  const value: ThemeContextType = {
    state,
    dispatch,
    setTheme,
    toggleAdminMode,
    addCustomTheme,
    removeCustomTheme,
    updateCustomTheme,
    verifyAdminPassword,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;