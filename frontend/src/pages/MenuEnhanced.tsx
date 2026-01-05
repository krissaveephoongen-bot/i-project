import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  Grid,
  List as ListIcon,
  Search as SearchIcon,
  LayoutDashboard,
  FolderKanban,
  Clock,
  BarChart3,
  Briefcase,
  Settings,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Activity,
  ClipboardList,
  Heart,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock as ClockIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ScrollContainer from '@/components/layout/ScrollContainer';
import { menuService, MenuStats, ProjectQuickAccess, TaskQuickAccess } from '@/services/menuService';

interface MenuItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: string;
  badge?: string;
}

const menuItems: MenuItem[] = [
  // Dashboard
  {
    title: 'Dashboard',
    description: 'View project overview and key metrics',
    icon: LayoutDashboard,
    path: '/dashboard',
    category: 'Main',
  },
  // Projects
  {
    title: 'All Projects',
    description: 'View and manage all projects',
    icon: FolderKanban,
    path: '/projects',
    category: 'Projects',
  },
  {
    title: 'Create Project',
    description: 'Start a new project',
    icon: FolderKanban,
    path: '/projects/create',
    category: 'Projects',
    badge: 'New',
  },
  {
    title: 'My Projects',
    description: 'View your assigned projects',
    icon: Briefcase,
    path: '/projects/my-projects',
    category: 'Projects',
  },
  {
    title: 'Project Table',
    description: 'View projects in table format',
    icon: FileText,
    path: '/projects/table',
    category: 'Projects',
  },
  // Project Manager
  {
    title: 'Project Manager',
    description: 'Manage projects, tasks, and team collaboration',
    icon: ClipboardList,
    path: '/project-manager',
    category: 'Project Manager',
    badge: 'New',
  },
  {
    title: 'Project Manager Users',
    description: 'Manage project manager accounts and assignments',
    icon: Users,
    path: '/project-manager-users',
    category: 'Project Manager',
    badge: 'Admin',
  },
  // Time & Expenses
  {
    title: 'Timesheet',
    description: 'Log and track work hours',
    icon: Clock,
    path: '/timesheet',
    category: 'Time & Expenses',
  },
  {
    title: 'Expenses',
    description: 'Track and manage project expenses',
    icon: DollarSign,
    path: '/expenses',
    category: 'Time & Expenses',
  },
  {
    title: 'Cost Management',
    description: 'Monitor project budgets and costs',
    icon: TrendingUp,
    path: '/cost-management',
    category: 'Time & Expenses',
  },
  // Resources
  {
    title: 'Resource Management',
    description: 'Manage team capacity and allocation',
    icon: Users,
    path: '/resources',
    category: 'Resources',
  },
  {
    title: 'Team Members',
    description: 'View and manage team members',
    icon: Users,
    path: '/resources/team',
    category: 'Resources',
  },
  {
    title: 'Allocation',
    description: 'Allocate resources to projects',
    icon: Users,
    path: '/resources/allocation',
    category: 'Resources',
  },
  // Analytics
  {
    title: 'Reports',
    description: 'Generate and view reports',
    icon: BarChart3,
    path: '/reports',
    category: 'Analytics',
  },
  {
    title: 'Analytics',
    description: 'View detailed analytics and insights',
    icon: TrendingUp,
    path: '/analytics',
    category: 'Analytics',
  },
  // Organization
  {
    title: 'Activity Log',
    description: 'Track system activities and changes',
    icon: Activity,
    path: '/activity',
    category: 'Organization',
  },
  {
    title: 'Search',
    description: 'Search across all items',
    icon: SearchIcon,
    path: '/search',
    category: 'Organization',
  },
  // Settings
  {
    title: 'Settings',
    description: 'Manage your preferences and profile',
    icon: Settings,
    path: '/settings',
    category: 'Settings',
  },
];

const categories = ['Main', 'Projects', 'Project Manager', 'Time & Expenses', 'Resources', 'Analytics', 'Organization', 'Settings'];

export default function MenuEnhanced() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Fetch real data from backend
  const { data: stats, isLoading: statsLoading } = useQuery<MenuStats>({
    queryKey: ['menuStats'],
    queryFn: () => menuService.getMenuStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: activeProjects = [] } = useQuery<ProjectQuickAccess[]>({
    queryKey: ['activeProjects'],
    queryFn: () => menuService.getActiveProjects(5),
    staleTime: 5 * 60 * 1000,
  });

  const { data: assignedTasks = [] } = useQuery<TaskQuickAccess[]>({
    queryKey: ['assignedTasks'],
    queryFn: () => menuService.getAssignedTasks(5),
    staleTime: 5 * 60 * 1000,
  });

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('menuFavorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
    const savedViewMode = localStorage.getItem('menuViewMode');
    if (savedViewMode) {
      setViewMode(savedViewMode as 'grid' | 'list');
    }
    const savedCategory = localStorage.getItem('menuCategory');
    if (savedCategory) {
      setSelectedCategory(savedCategory);
    }
  }, []);

  const savePreferences = (mode: 'grid' | 'list', category: string, favs: Set<string>) => {
    localStorage.setItem('menuViewMode', mode);
    localStorage.setItem('menuCategory', category);
    localStorage.setItem('menuFavorites', JSON.stringify(Array.from(favs)));
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddFavorite = (item: MenuItem) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(item.path)) {
      newFavorites.delete(item.path);
    } else {
      newFavorites.add(item.path);
    }
    setFavorites(newFavorites);
    savePreferences(viewMode, selectedCategory, newFavorites);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    savePreferences(mode, selectedCategory, favorites);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    savePreferences(viewMode, category, favorites);
  };

  const handleNavigate = (path: string, item?: MenuItem) => {
    if (item) {
      menuService.trackItemAccess(path, 'project');
    }
    navigate(path);
  };

  const favoriteItems = menuItems.filter(item => favorites.has(item.path)).slice(0, 3);

  return (
    <ScrollContainer>
      <div className="space-y-6 p-4">
        {/* Header with Stats Overview */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Menu</h1>
          <p className="text-gray-600 mt-1">Quick access to all features and sections</p>
        </div>

        {/* Stats Cards */}
        {stats && !statsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.activeProjects}</p>
                    <p className="text-xs text-gray-500">of {stats.totalProjects} total</p>
                  </div>
                  <FolderKanban className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Assigned Tasks</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.assignedTasksCount}</p>
                    <p className="text-xs text-gray-500">{stats.overdueTasks} overdue</p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Actions</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.pendingTimesheets + stats.pendingCosts}
                    </p>
                    <p className="text-xs text-gray-500">Timesheets & Costs</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Team Members</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalTeamMembers}</p>
                    <p className="text-xs text-gray-500">Active users</p>
                  </div>
                  <Users className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Access - Active Projects */}
        {activeProjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Your Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {activeProjects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleNavigate(`/projects/${project.id}`)}
                    className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 hover:shadow-md transition-shadow text-left"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold text-gray-900 text-sm">{project.name}</span>
                      <span className="text-xs font-mono text-blue-700">{project.code}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{project.progress}%</span>
                        <Badge variant="outline" className="text-xs">
                          {project.priority}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Access - Assigned Tasks */}
        {assignedTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-purple-500" />
                Your Assigned Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assignedTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => handleNavigate(`/projects/${task.projectId}`)}
                    className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 hover:shadow-md transition-shadow text-left flex items-center justify-between group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">{task.title}</span>
                        {task.status === 'IN_PROGRESS' && (
                          <ClockIcon className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{task.projectName}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Badge variant="outline" className="text-xs">
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <span className="text-xs text-gray-500">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & View Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange('all')}
                  >
                    All
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => handleViewModeChange('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => handleViewModeChange('list')}
                  >
                    <ListIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favorites Section */}
        {favoriteItems.length > 0 && (
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-yellow-500" />
                Your Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {favoriteItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path, item)}
                      className="p-4 rounded-lg bg-white border border-yellow-300 hover:bg-yellow-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium text-gray-900">{item.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Items Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const Icon = item.icon;
              const isFavorite = favorites.has(item.path);
              return (
                <Card
                  key={item.path}
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => handleNavigate(item.path, item)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddFavorite(item);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                          }`}
                        />
                      </button>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      {item.title}
                      {item.badge && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>

                    <Badge variant="outline">{item.category}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {filteredItems.map(item => {
                  const Icon = item.icon;
                  const isFavorite = favorites.has(item.path);
                  return (
                    <div
                      key={item.path}
                      onClick={() => handleNavigate(item.path, item)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-gray-900 flex items-center gap-2">
                            {item.title}
                            {item.badge && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge variant="outline">{item.category}</Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddFavorite(item);
                          }}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredItems.length === 0 && (
          <Card className="p-8 text-center">
            <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or category filter</p>
          </Card>
        )}
      </div>
    </ScrollContainer>
  );
}
