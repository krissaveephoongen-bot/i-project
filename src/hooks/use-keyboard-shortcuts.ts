import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key === shortcut.key;
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.altKey ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export function useGlobalShortcuts() {
  const navigate = useNavigate();

  const shortcuts: Shortcut[] = [
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        // Focus search input
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      },
    },
    {
      key: '/',
      action: () => {
        // Focus search input
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      },
    },
    {
      key: 'g',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        navigate('/');
      },
    },
    {
      key: 'p',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        navigate('/projects');
      },
    },
    {
      key: 't',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        navigate('/tasks');
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);
}
