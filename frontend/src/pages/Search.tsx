import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Search as SearchIcon,
  CheckSquare,
  FolderKanban,
  Users,
  Clock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import ScrollContainer from '../components/layout/ScrollContainer';
import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import { parseApiError } from '@/lib/error-handler';

interface SearchResult {
  id: string;
  type: 'task' | 'project' | 'client' | 'timesheet';
  title: string;
  description: string;
  status?: string;
  priority?: string;
  progress?: number;
  dueDate?: string;
  budget?: number;
  spent?: number;
  clientName?: string;
  projectName?: string;
  assignee?: string;
  hours?: number;
  date?: string;
  score: number; // Relevance score for sorting
}

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [recentSearches] = useState<string[]>([
    'mobile app',
    'api integration',
    'john doe',
    'overdue tasks'
  ]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Fetch from real API
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResults(Array.isArray(data) ? data : data.data || []);
        return;
      } else {
        throw new Error(`Search failed: ${response.status}`);
      }
    } catch (err) {
      console.warn('Search error:', err);
      setError(parseApiError(err));
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    performSearch(searchQuery);
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'task': return CheckSquare;
      case 'project': return FolderKanban;
      case 'client': return Users;
      case 'timesheet': return Clock;
      default: return SearchIcon;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'task': return 'text-blue-600 bg-blue-100';
      case 'project': return 'text-purple-600 bg-purple-100';
      case 'client': return 'text-green-600 bg-green-100';
      case 'timesheet': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const navigateToResult = (result: SearchResult) => {
    switch (result.type) {
      case 'task':
        navigate('/tasks');
        break;
      case 'project':
        navigate(`/projects/${result.id}`);
        break;
      case 'client':
        navigate('/clients');
        break;
      case 'timesheet':
        navigate('/timesheet');
        break;
      default:
        break;
    }
  };

  return (
    <ScrollContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Search</h1>
        <p className="text-gray-500 mt-1">Find anything in your project management system</p>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search tasks, projects, clients, timesheets..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                className="pl-12 pr-4 py-3 text-lg"
              />
              <Button
                onClick={() => handleSearch(query)}
                disabled={isSearching}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Type Filter */}
            <div className="flex justify-center mt-4 space-x-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'task', label: 'Tasks' },
                { value: 'project', label: 'Projects' },
                { value: 'client', label: 'Clients' },
                { value: 'timesheet', label: 'Timesheets' }
              ].map(filter => (
                <Button
                  key={filter.value}
                  variant={typeFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter(filter.value)}
                  className="bg-white"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <ErrorState 
          error={error}
          onRetry={() => performSearch(query)}
        />
      )}

      {/* Loading State */}
      {isSearching && !error && (
        <LoadingState message="Searching..." />
      )}

      {/* Recent Searches */}
      {!query && !results.length && !error && !isSearching && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(search)}
                  className="bg-white"
                >
                  <SearchIcon className="h-3 w-3 mr-2" />
                  {search}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty Search Results */}
      {query && results.length === 0 && !error && !isSearching && (
        <EmptyState 
          icon="🔍"
          title="No results found"
          description={`No items match your search for "${query}"`}
          action={{
            label: "Clear Search",
            onClick: () => {
              setQuery('');
              setResults([]);
            }
          }}
        />
      )}

      {/* Search Results */}
      {results.length > 0 && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SearchIcon className="h-5 w-5" />
              Search Results
              <Badge variant="outline" className="ml-auto">
                {results.length} results
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map(result => {
                const IconComponent = getTypeIcon(result.type);
                return (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigateToResult(result)}
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getTypeColor(result.type)}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{result.title}</h3>
                        <Badge variant="outline" className="capitalize">
                          {result.type}
                        </Badge>
                        {result.status && (
                          <Badge className={getStatusBadgeColor(result.status)}>
                            {result.status}
                          </Badge>
                        )}
                        {result.priority && (
                          <Badge className={getStatusBadgeColor(result.priority)}>
                            {result.priority}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{result.description}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {result.assignee && (
                          <span>👤 {result.assignee}</span>
                        )}
                        {result.projectName && (
                          <span>📁 {result.projectName}</span>
                        )}
                        {result.clientName && (
                          <span>🏢 {result.clientName}</span>
                        )}
                        {result.dueDate && (
                          <span>📅 Due {new Date(result.dueDate).toLocaleDateString()}</span>
                        )}
                        {result.hours && (
                          <span>⏰ {result.hours}h</span>
                        )}
                        {result.progress !== undefined && (
                          <span>📊 {result.progress}% complete</span>
                        )}
                        {result.budget && (
                          <span>💰 ฿{result.budget.toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {query && !isSearching && results.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 mb-4">
              We couldn't find anything matching "{query}"
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => setTypeFilter('all')}>
                Search all types
              </Button>
              <Button variant="outline" onClick={() => setQuery('')}>
                Clear search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Tips */}
      {!query && !results.length && (
        <Card>
          <CardHeader>
            <CardTitle>Search Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">What you can search for:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Task titles and descriptions</li>
                  <li>• Project names and details</li>
                  <li>• Client names and companies</li>
                  <li>• Timesheet entries and hours</li>
                  <li>• User names and assignees</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Search filters:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Filter by content type (Tasks, Projects, etc.)</li>
                  <li>• Click on results to navigate directly</li>
                  <li>• Results are ranked by relevance</li>
                  <li>• Recent searches are saved</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </ScrollContainer>
  );
}
