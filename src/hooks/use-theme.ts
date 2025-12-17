import { useContext } from 'react';
import { useThemeContext } from '@/contexts/ThemeContext';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const { theme, setTheme, actualTheme } = useThemeContext();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark');
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    actualTheme,
    mounted: true,
  };
}
