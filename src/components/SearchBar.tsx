import { useState, useRef, useEffect } from 'react';
import { Search, Clock, FileText, Users, FolderKanban } from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';

interface SearchResult {
  id: string;
  title: string;
  type: 'project' | 'task' | 'user' | 'document';
  description: string;
  url: string;
  metadata?: {
    status?: string;
    priority?: string;
    assignee?: string;
  };
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ placeholder = "Search...", className, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Mobile App Development',
    'API Integration',
    'Design System',
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'Mobile App Development',
        type: 'project',
        description: 'Native mobile application for iOS and Android platforms',
        url: '/projects/1',
        metadata: { status: 'active', priority: 'high' },
      },
      {
        id: '2',
        title: 'Design user authentication flow',
        type: 'task',
        description: 'Create wireframes and mockups for login, registration',
        url: '/tasks/2',
        metadata: { status: 'in-progress', assignee: 'Sarah Chen' },
      },
      {
        id: '3',
        title: 'Sarah Chen',
        type: 'user',
        description: 'UI/UX Designer',
        url: '/team/sarah-chen',
      },
      {
        id: '4',
        title: 'API Documentation',
        type: 'document',
        description: 'REST API endpoints and integration guide',
        url: '/docs/api',
      },
    ].filter(result =>
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) as SearchResult[];

    setResults(mockResults);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim()) {
        addToRecentSearches(query.trim());
        onSearch?.(query.trim());
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const addToRecentSearches = (search: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== search);
      return [search, ...filtered].slice(0, 5);
    });
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'project': return <FolderKanban className="h-4 w-4 text-blue-600" />;
      case 'task': return <FileText className="h-4 w-4 text-green-600" />;
      case 'user': return <Users className="h-4 w-4 text-purple-600" />;
      case 'document': return <FileText className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            {/* Recent Searches */}
            {query === '' && recentSearches.length > 0 && (
              <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Recent Searches</h3>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(search);
                        addToRecentSearches(search);
                        onSearch?.(search);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md text-left"
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {query !== '' && (
              <div className="p-2">
                {results.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No results found for "{query}"
                  </div>
                ) : (
                  <div className="space-y-1">
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => {
                          addToRecentSearches(query);
                          setIsOpen(false);
                          // Navigate to result URL
                          console.log('Navigate to:', result.url);
                        }}
                        className="w-full flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md text-left"
                      >
                        {getIcon(result.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {result.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {result.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                            {result.description}
                          </p>
                          <div className="flex items-center space-x-2">
                            {result.metadata?.status && (
                              <Badge className={getStatusColor(result.metadata.status)}>
                                {result.metadata.status}
                              </Badge>
                            )}
                            {result.metadata?.priority && (
                              <Badge className={getPriorityColor(result.metadata.priority)}>
                                {result.metadata.priority}
                              </Badge>
                            )}
                            {result.metadata?.assignee && (
                              <span className="text-xs text-gray-500">
                                {result.metadata.assignee}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="p-2 border-t bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Press ↑↓ to navigate</span>
                <span>Press Enter to select</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
