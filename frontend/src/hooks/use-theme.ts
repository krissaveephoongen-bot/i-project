import { useTheme as useThemeContext } from '@/contexts/ThemeContext';

export type Theme = 'light' | 'dark' | 'system';

export function useThemeHook() {
  const { state, setTheme } = useThemeContext();
  const theme = state.currentTheme;

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'blue' : 'dark';
    setTheme(nextTheme as any);
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    actualTheme: theme,
    mounted: true,
  };
}
