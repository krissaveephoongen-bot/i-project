import { useState, useEffect } from 'react';
import {
  Star,
  Trash2,
  ChevronRight,
  MoreVertical,
  Grid,
  List as ListIcon,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ScrollContainer from '@/components/layout/ScrollContainer';

interface FavoriteItem {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  addedAt: string;
  lastVisited?: string;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'category'>('recent');

  useEffect(() => {
    // Load favorites from localStorage
    const stored = localStorage.getItem('menuFavorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    }
  }, []);

  // Sort favorites
  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case 'name':
        return a.title.localeCompare(b.title);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const handleRemoveFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('menuFavorites', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (window.confirm('Remove all favorites? This cannot be undone.')) {
      setFavorites([]);
      localStorage.removeItem('menuFavorites');
    }
  };

  const handleNavigate = (path: string, id: string) => {
    // Update last visited
    const updated = favorites.map(f =>
      f.id === id ? { ...f, lastVisited: new Date().toISOString() } : f
    );
    setFavorites(updated);
    localStorage.setItem('menuFavorites', JSON.stringify(updated));

    // Navigate
    window.location.href = path;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollContainer>
      <div className="bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                Favorites
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {favorites.length} saved item{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Toolbar */}
          {favorites.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="recent">Sort by Recent</option>
                <option value="name">Sort by Name</option>
                <option value="category">Sort by Category</option>
              </select>

              {favorites.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearAll}
                  className="ml-auto"
                >
                  Clear All
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <Card className="p-12 text-center">
            <Star className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Favorites Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add items from the menu to your favorites for quick access
            </p>
            <Button onClick={() => window.location.href = '/menu'}>
              Go to Menu
            </Button>
          </Card>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedFavorites.map(favorite => (
              <Card
                key={favorite.id}
                className="p-6 hover:shadow-lg transition-all cursor-pointer group flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {favorite.title}
                    </h3>
                    <Badge variant="outline" className="mb-2">
                      {favorite.category}
                    </Badge>
                  </div>
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
                        onClick={() => handleRemoveFavorite(favorite.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
                  {favorite.description}
                </p>

                {favorite.lastVisited && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    Last visited: {formatDate(favorite.lastVisited)}
                  </p>
                )}

                <Button
                  onClick={() => handleNavigate(favorite.path, favorite.id)}
                  className="w-full"
                >
                  Open
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          // List View
          <Card className="divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden">
            {sortedFavorites.map(favorite => (
              <div
                key={favorite.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {favorite.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {favorite.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {favorite.category}
                    </Badge>
                    {favorite.lastVisited && (
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        Visited: {formatDate(favorite.lastVisited)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleNavigate(favorite.path, favorite.id)}
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
                        onClick={() => handleRemoveFavorite(favorite.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Info Section */}
        <Card className="mt-8 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary-900 dark:text-primary-100 mb-1">
              Favorites are stored locally on your device
            </p>
            <p className="text-primary-800 dark:text-primary-200">
              They will persist across browser sessions but won't sync across devices. To save favorites on your account, upgrade to a premium plan.
            </p>
          </div>
        </Card>
      </div>
      </div>
    </ScrollContainer>
  );
};

export default Favorites;
