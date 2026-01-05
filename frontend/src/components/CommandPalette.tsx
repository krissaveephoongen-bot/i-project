import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command } from 'lucide-react';
import { cn } from '../lib/utils';

interface Command {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'action' | 'help';
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Go to dashboard',
      category: 'navigation',
      action: () => navigate('/'),
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'View all projects',
      category: 'navigation',
      action: () => navigate('/projects'),
    },
    {
      id: 'tasks',
      title: 'Tasks',
      description: 'View all tasks',
      category: 'navigation',
      action: () => navigate('/tasks'),
    },
    {
      id: 'team',
      title: 'Team',
      description: 'View team members',
      category: 'navigation',
      action: () => navigate('/team'),
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'View reports',
      category: 'navigation',
      action: () => navigate('/reports'),
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Application settings',
      category: 'navigation',
      action: () => navigate('/settings'),
    },
    {
      id: 'new-project',
      title: 'New Project',
      description: 'Create a new project',
      category: 'action',
      action: () => navigate('/projects/new'),
    },
    {
      id: 'new-task',
      title: 'New Task',
      description: 'Create a new task',
      category: 'action',
      action: () => navigate('/tasks/new'),
    },
    {
      id: 'shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'View keyboard shortcuts',
      category: 'help',
      action: () => alert('Keyboard shortcuts:\nCtrl+K: Open command palette\nCtrl+Shift+G: Go to dashboard\nCtrl+Shift+P: Go to projects\nCtrl+Shift+T: Go to tasks'),
    },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
      } else if (event.key === 'Escape') {
        setIsOpen(false);
      } else if (isOpen) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (event.key === 'Enter') {
          event.preventDefault();
          const selectedCommand = filteredCommands[selectedIndex];
          if (selectedCommand) {
            selectedCommand.action();
            setIsOpen(false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, navigate]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[20vh] z-50">
      <div className="w-full max-w-2xl mx-4">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center px-4 py-3 border-b">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              className="flex-1 outline-none text-gray-900 placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
            />
            <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">ESC</kbd>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No commands found
              </div>
            ) : (
              <div className="py-2">
                {['navigation', 'action', 'help'].map(category => {
                  const categoryCommands = filteredCommands.filter(cmd => cmd.category === category);
                  if (categoryCommands.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-4">
                      <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {category}
                      </div>
                      {categoryCommands.map((command, index) => {
                        const globalIndex = filteredCommands.indexOf(command);
                        return (
                          <button
                            key={command.id}
                            className={cn(
                              'w-full px-4 py-2 flex items-center text-left hover:bg-gray-100 transition-colors',
                              globalIndex === selectedIndex && 'bg-gray-100'
                            )}
                            onClick={() => {
                              command.action();
                              setIsOpen(false);
                            }}
                          >
                            {command.icon && <div className="mr-3">{command.icon}</div>}
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{command.title}</div>
                              {command.description && (
                                <div className="text-sm text-gray-500">{command.description}</div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="px-4 py-2 border-t bg-gray-50">
            <div className="flex items-center text-xs text-gray-500">
              <Command className="h-3 w-3 mr-1" />
              Press Ctrl+K to open
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
