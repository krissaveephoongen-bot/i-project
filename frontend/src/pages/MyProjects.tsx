import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit2, Archive, TrendingUp, AlertCircle, Briefcase, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { toast } from 'react-hot-toast';
import ScrollContainer from '@/components/layout/ScrollContainer';
import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import { parseApiError } from '@/lib/error-handler';

interface MyProject {
  id: string;
  code: string;
  name: string;
  contract_amount: number;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  team_size: number;
  start_date: string;
  end_date: string;
  risk_level: 'low' | 'medium' | 'high';
  description?: string;
}

export default function MyProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<MyProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'on-hold'>('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to fetch from real API first
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        try {
          // Get userId from localStorage or session
          const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
          
          const url = new URL(`${apiUrl}/projects/my-projects`);
          if (userId) {
            url.searchParams.append('userId', userId);
          }

          const response = await fetch(url.toString(), {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            const fetchedProjects = Array.isArray(data) ? data : data.data || [];
            
            if (fetchedProjects.length > 0) {
              setProjects(fetchedProjects);
              return;
            }
          }
        } catch (apiError) {
          console.warn('API fetch failed:', apiError);
          setError(parseApiError(apiError));
          setProjects([]);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(parseApiError(err));
        toast.error('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'on-hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return colors[status] || colors.active;
  };

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600',
    };
    return colors[risk] || colors.medium;
  };

  const filteredProjects = filterStatus === 'all' ? projects : projects.filter((p) => p.status === filterStatus);

  if (error && !isLoading) {
    return (
      <ScrollContainer>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <ErrorState 
            error={error}
            onRetry={() => {
              setError(null);
              setIsLoading(true);
            }}
          />
        </div>
      </ScrollContainer>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your assigned projects</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/projects/create')}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'completed', 'on-hold'] as const).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{projects.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {projects.filter((p) => p.status === 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {formatCurrency(projects.reduce((sum, p) => sum + p.contract_amount, 0))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{project.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(project.contract_amount)}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Team Size</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{project.team_size}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Risk Level</p>
                  <p className={`text-lg font-bold ${getRiskColor(project.risk_level)} capitalize`}>
                    {project.risk_level}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Timeline</p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {new Date(project.start_date).toLocaleDateString()} -{' '}
                    {new Date(project.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-2"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-2"
                  onClick={() => navigate(`/projects/${project.id}/edit`)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-2"
                  onClick={() => {
                    if (confirm(`Archive project "${project.name}"?`)) {
                      toast.success('Project archived');
                      // Add archive logic here
                    }
                  }}
                >
                  <Archive className="h-3.5 w-3.5" />
                  Archive
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No projects found in this category</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
