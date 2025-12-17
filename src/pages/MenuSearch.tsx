import { useState, useEffect } from 'react';
import {
  Search,
  ArrowLeft,
  Clock,
  MoreVertical,
  AlertCircle,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  path: string;
  category: string;
  relevance: number; // Score 0-100
  matchedField: 'title' | 'description' | 'category';
}

const MenuSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('menuSearchHistory');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }

    // Get query from URL if present
    const params = new URLSearchParams(location.search);
    const urlQuery = params.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      handleSearch(urlQuery);
    }
  }, []);

  // Sample menu items for search (in production, fetch from API)
  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'View your project overview and key metrics',
      path: '/dashboard',
      category: 'Main',
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'Manage and view all projects',
      path: '/projects',
      category: 'Projects',
    },
    {
      id: 'timesheet',
      title: 'Timesheet',
      description: 'Log and track your working hours',
      path: '/timesheet',
      category: 'Time Tracking',
    },
    {
      id: 'expenses',
      title: 'Expenses',
      description: 'Track and manage project expenses',
      path: '/expenses',
      category: 'Financial',
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Generate and view detailed reports',
      path: '/reports',
      category: 'Analytics',
    },
    {
      id: 'activity',
      title: 'Activity Log',
      description: 'View system activity and changes',
      path: '/activity',
      category: 'Analytics',
    },
    {
      id: 'search',
      title: 'Search',
      description: 'Search projects, tasks, and documents',
      path: '/search',
      category: 'Tools',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage account and application settings',
      path: '/settings',
      category: 'Settings',
    },
  ];

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const normalizedQuery = searchQuery.toLowerCase().trim();

    // Search with scoring
    const scored = menuItems
      .map(item => {
        let score = 0;
        let matchedField: 'title' | 'description' | 'category' = 'title';

        // Exact title match
        if (item.title.toLowerCase() === normalizedQuery) {
          score = 100;
          matchedField = 'title';
        }
        // Title starts with
        else if (item.title.toLowerCase().startsWith(normalizedQuery)) {
          score = 80;
          matchedField = 'title';
        }
        // Title includes
        else if (item.title.toLowerCase().includes(normalizedQuery)) {
          score = 60;
          matchedField = 'title';
        }
        // Description includes
        else if (item.description.toLowerCase().includes(normalizedQuery)) {
          score = 40;
          matchedField = 'description';
        }
        // Category includes
        else if (item.category.toLowerCase().includes(normalizedQuery)) {
          score = 20;
          matchedField = 'category';
        }

        return { ...item, relevance: score, matchedField };
      })
      .filter(x => x.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance);

    setResults(scored);

    // Save to history
    if (normalizedQuery.length > 2) {
      const updated = [
        normalizedQuery,
        ...searchHistory.filter(q => q !== normalizedQuery),
      ].slice(0, 10);
      setSearchHistory(updated);
      localStorage.setItem('menuSearchHistory', JSON.stringify(updated));
    }

    setLoading(false);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    handleSearch(value);
  };

  const handleQuickSearch = (keyword: string) => {
    setQuery(keyword);
    handleSearch(keyword);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('menuSearchHistory');
  };

  const getRelevanceBadge = (relevance: number) => {
    if (relevance >= 80) return <Badge variant="success">Exact Match</Badge>;
    if (relevance >= 60) return <Badge variant="info">High Match</Badge>;
    if (relevance >= 40) return <Badge>Good Match</Badge>;
    return <Badge variant="outline">Low Match</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Search className="h-8 w-8" />
            Search Menu
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            Find features and navigate quickly
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <Input
            placeholder="Search features, pages, or actions..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="text-lg h-12"
            autoFocus
          />
        </div>

        {/* Results or Suggestions */}
        {query.trim().length === 0 ? (
          // Suggestions when no query
          <div className="space-y-6">
            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Searches
                  </h3>
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map(item => (
                    <Button
                      key={item}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSearch(item)}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {/* Quick Search */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Search
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {['Dashboard', 'Projects', 'Timesheet', 'Expenses', 'Reports', 'Settings'].map(
                  item => (
                    <Button
                      key={item}
                      variant="outline"
                      onClick={() => handleQuickSearch(item)}
                      className="justify-start"
                    >
                      {item}
                    </Button>
                  )
                )}
              </div>
            </Card>

            {/* Help */}
            <Card className="p-4 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary-900 dark:text-primary-100 mb-1">
                  Tips
                </p>
                <ul className="text-primary-800 dark:text-primary-200 space-y-1">
                  <li>• Type at least 3 characters to search</li>
                  <li>• Search works on titles and descriptions</li>
                  <li>• Results are sorted by relevance</li>
                </ul>
              </div>
            </Card>
          </div>
        ) : loading ? (
          // Loading
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <Search className="h-8 w-8 text-primary-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Searching...</p>
          </div>
        ) : results.length === 0 ? (
          // No Results
          <Card className="p-12 text-center">
            <Search className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Results Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try searching with different keywords or browse the menu
            </p>
            <Button onClick={() => navigate('/menu')}>
              Go to Menu
            </Button>
          </Card>
        ) : (
          // Search Results
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </p>

            <div className="space-y-3">
              {results.map(result => (
                <Card
                  key={result.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {result.title}
                        </h3>
                        {getRelevanceBadge(result.relevance)}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {result.description}
                      </p>

                      <Badge variant="outline">{result.category}</Badge>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => navigate(result.path)}
                      >
                        Open
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              const url = `${window.location.origin}${result.path}`;
                              navigator.clipboard.writeText(url);
                            }}
                          >
                            Copy Link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuSearch;
