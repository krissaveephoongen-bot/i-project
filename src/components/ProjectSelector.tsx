import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, FolderKanban } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface Project {
  id: string;
  code: string;
  name: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
}

export const ProjectSelector = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const selected = projects.find(p => p.id === projectId);
      setCurrentProject(selected || null);
    }
  }, [projectId, projects]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/projects`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : data.data || []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const otherProjects = projects.filter(p => p.status !== 'active');

  // Only show selector if we're in a project detail page
  if (!projectId || !currentProject) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 hidden sm:flex"
        >
          <FolderKanban className="h-4 w-4" />
          <span className="truncate max-w-xs">{currentProject.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="start">
        <DropdownMenuLabel className="px-2 py-1.5">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Current Project</p>
            <p className="text-sm font-semibold text-gray-900 truncate mt-1">
              {currentProject.name}
            </p>
            <p className="text-xs text-gray-500">{currentProject.code}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {activeProjects.length > 0 && (
          <>
            <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-gray-500">
              ACTIVE PROJECTS
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {activeProjects.map(project => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  className={`cursor-pointer transition-colors ${
                    projectId === project.id
                      ? 'bg-blue-200 text-blue-900 hover:bg-blue-300'
                      : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="text-xs">{project.code}</p>
                  </div>
                  {projectId === project.id && (
                    <span className="h-2 w-2 rounded-full bg-blue-600 ml-2" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}

        {otherProjects.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-gray-500">
              OTHER PROJECTS
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {otherProjects.map(project => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  className="bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{project.name}</p>
                    <p className="text-xs text-gray-500">
                      {project.code} • {project.status}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => navigate('/projects')}
          className="bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
        >
          <FolderKanban className="mr-2 h-4 w-4" />
          <span>View All Projects</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectSelector;
