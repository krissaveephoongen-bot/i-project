import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  FileText,
  BarChart3,
  ArrowRight,
  Clock,
  Target,
  X
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';

export interface ProjectCardProps {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  budget: number;
  spent: number;
  clientName: string;
  projectManager: string;
  teamMembers: string[];
  startDate: string;
  endDate: string;
  tasksCount: number;
  completedTasks: number;
  charter?: any;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShowCharter?: (id: string) => void;
  onShowInfo?: (id: string) => void;
  isAtRisk?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  code,
  description,
  status,
  priority,
  progress,
  budget,
  spent,
  clientName,
  projectManager,
  teamMembers,
  startDate,
  endDate,
  tasksCount,
  completedTasks,
  charter,
  isSelected = false,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onShowCharter,
  onShowInfo,
  isAtRisk = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Status and color mappings
  const statusConfig = {
    completed: { 
      bg: 'bg-green-100 dark:bg-green-900/30', 
      text: 'text-green-800 dark:text-green-300',
      icon: <CheckCircle2 className="h-4 w-4 mr-1" />
    },
    active: { 
      bg: 'bg-blue-100 dark:bg-blue-900/30', 
      text: 'text-blue-800 dark:text-blue-300',
      icon: <TrendingUp className="h-4 w-4 mr-1" />
    },
    planning: { 
      bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
      text: 'text-yellow-800 dark:text-yellow-300',
      icon: <Clock className="h-4 w-4 mr-1" />
    },
    'on-hold': { 
      bg: 'bg-orange-100 dark:bg-orange-900/30', 
      text: 'text-orange-800 dark:text-orange-300',
      icon: <AlertCircle className="h-4 w-4 mr-1" />
    },
    cancelled: { 
      bg: 'bg-red-100 dark:bg-red-900/30', 
      text: 'text-red-800 dark:text-red-300',
      icon: <X className="h-4 w-4 mr-1" />
    }
  };

  const priorityConfig = {
    critical: { 
      bg: 'bg-red-100 dark:bg-red-900/30', 
      text: 'text-red-800 dark:text-red-300',
      label: 'Critical'
    },
    high: { 
      bg: 'bg-orange-100 dark:bg-orange-900/30', 
      text: 'text-orange-800 dark:text-orange-300',
      label: 'High'
    },
    medium: { 
      bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
      text: 'text-yellow-800 dark:text-yellow-300',
      label: 'Medium'
    },
    low: { 
      bg: 'bg-green-100 dark:bg-green-900/30', 
      text: 'text-green-800 dark:text-green-300',
      label: 'Low'
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.planning;
  const currentPriority = priorityConfig[priority] || priorityConfig.medium;

  // Calculate metrics
  const budgetUtilization = budget > 0 ? (spent / budget) * 100 : 0;
  const taskCompletion = tasksCount > 0 ? (completedTasks / tasksCount) * 100 : 0;
  
  const daysRemaining = Math.ceil(
    (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const isBudgetOverrun = budgetUtilization > 100;
  const isDelayed = progress < ((100 - ((new Date(endDate).getTime() - new Date().getTime()) / (new Date(endDate).getTime() - new Date(startDate).getTime())) * 100));

  return (
    <Card 
      className={`transition-all duration-200 cursor-pointer group relative overflow-hidden
        hover:shadow-lg hover:-translate-y-0.5
        ${isAtRisk ? 'border-l-4 border-red-500' : 'border-l-4 border-transparent'}
        ${isSelected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200 dark:ring-gray-700'}
        ${isHovered ? 'shadow-md' : 'shadow-sm'}
        h-full flex flex-col`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onClick={() => onView?.(id)}
      onKeyDown={(e) => e.key === 'Enter' && onView?.(id)}
      aria-label={`View ${name} project details`}
    >
      {/* Status indicator bar */}
      <div 
        className={`absolute top-0 left-0 w-1 h-full ${
          status === 'completed' ? 'bg-green-500' : 
          status === 'active' ? 'bg-blue-500' :
          status === 'planning' ? 'bg-yellow-500' : 'bg-gray-500'
        }`} 
        aria-hidden="true"
      />

      {/* Header */}
      <CardHeader className="pb-3 relative pl-5">
        <div className="flex items-start justify-between gap-3">
          {/* Checkbox for bulk selection */}
          {onSelect && (
            <div className="pt-1" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked: boolean) => onSelect && onSelect(id, checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-label={`Select ${name} project`}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate flex-1 max-w-xs">
                {name}
              </h3>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge className={`${currentStatus.bg} ${currentStatus.text} px-2 py-0.5 text-xs font-medium flex items-center`}>
                  {currentStatus.icon}
                  <span className="capitalize">{status.replace('-', ' ')}</span>
                </Badge>
                <Badge className={`${currentPriority.bg} ${currentPriority.text} px-2 py-0.5 text-xs font-medium`}>
                  {currentPriority.label}
                </Badge>
              </div>
            </div>
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 font-medium">{code}</p>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Action Menu */}
          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className={`h-8 w-8 p-0 rounded-full transition-all ${
                    isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Project actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onView?.(id); }}
                  className="text-sm py-2 px-3"
                >
                  <Eye className="h-4 w-4 mr-2 text-gray-600" />
                  <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onShowInfo?.(id); }}
                  className="text-sm py-2 px-3"
                >
                  <BarChart3 className="h-4 w-4 mr-2 text-gray-600" />
                  <span>Project Analytics</span>
                </DropdownMenuItem>
                {charter && (
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onShowCharter?.(id); }}
                    className="text-sm py-2 px-3"
                  >
                    <FileText className="h-4 w-4 mr-2 text-gray-600" />
                    <span>View Charter</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onEdit?.(id); }}
                  className="text-sm py-2 px-3"
                >
                  <Edit className="h-4 w-4 mr-2 text-gray-600" />
                  <span>Edit Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}
                  className="text-sm py-2 px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-4 relative flex-1 flex flex-col">
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {description}
        </p>

        {/* Risk alerts */}
        <div className="flex flex-col gap-2">
          {isAtRisk && (
            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-xs font-medium text-red-700 dark:text-red-400">Project at risk</span>
            </div>
          )}
          {isBudgetOverrun && (
            <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <span className="text-xs font-medium text-orange-700 dark:text-orange-400">Budget overrun</span>
            </div>
          )}
        </div>

        {/* Key Info Cards */}
        <div className="grid grid-cols-2 gap-2">
          <div 
            className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30"
            aria-label={`Client: ${clientName}`}
          >
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Client</span>
            </p>
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 truncate mt-1">
              {clientName}
            </p>
          </div>
          <div 
            className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg transition-colors hover:bg-purple-100 dark:hover:bg-purple-900/30"
            aria-label={`Project Manager: ${projectManager}`}
          >
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>PM</span>
            </p>
            <p className="text-xs font-semibold text-purple-900 dark:text-purple-200 truncate mt-1">
              {projectManager}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono font-medium text-gray-900 dark:text-gray-200">
                {progress}%
              </span>
              {isDelayed && (
                <span className="text-xs text-red-500 dark:text-red-400" title="Project is behind schedule">
                  <AlertCircle className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="relative h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className={`h-full ${
                  progress < 30 ? 'bg-red-500' : 
                  progress < 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${progress}%` }}
                aria-label={`Project progress: ${progress}%`}
              />
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Budget</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-xs font-mono font-medium ${
                isBudgetOverrun ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-200'
              }`}>
                {Math.round(budgetUtilization)}%
              </span>
              {isBudgetOverrun && (
                <span className="text-xs text-red-500 dark:text-red-400" title="Budget overrun">
                  <AlertCircle className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="relative h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className={`h-full ${
                  isBudgetOverrun ? 'bg-red-500' : 
                  budgetUtilization > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                aria-label={`Budget utilization: ${Math.round(budgetUtilization)}%`}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
            <span>{formatCurrency(spent)}</span>
            <span>{formatCurrency(budget)}</span>
          </p>
        </div>

        {/* Tasks */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Tasks</span>
            </div>
            <span className="text-xs font-mono font-medium text-gray-900 dark:text-gray-200">
              {completedTasks}/{tasksCount} ({Math.round(taskCompletion)}%)
            </span>
          </div>
          <div className="relative">
            <div className="relative h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className={`h-full ${
                  taskCompletion < 30 ? 'bg-red-500' : 
                  taskCompletion < 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${taskCompletion}%` }}
                aria-label={`Task completion: ${Math.round(taskCompletion)}%`}
              />
            </div>
          </div>
        </div>

        {/* Timeline & Team */}
        <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-gray-100 dark:border-gray-700">
          <div 
            className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            title={`Due in ${daysRemaining} days`}
          >
            <div className={`p-1 rounded-full ${
              daysRemaining <= 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
              daysRemaining <= 7 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
              'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            }`}>
              <Calendar className="h-3 w-3" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {daysRemaining > 0 ? `${daysRemaining}d left` : 'Overdue'}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {new Date(endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div 
            className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            title={`${teamMembers.length} team members`}
          >
            <div className="p-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <Users className="h-3 w-3" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {teamMembers.slice(0, 2).join(', ')}{teamMembers.length > 2 ? '...' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Charter Status */}
        {charter && (
          <div className="flex items-center gap-1 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
            <FileText className="h-3 w-3" />
            Charter Created
          </div>
        )}

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-1 p-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
        >
          {isExpanded ? 'Show less' : 'Show more details'}
          <ArrowRight className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-2 pt-2 border-t dark:border-gray-700">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Timeline</p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Team Members</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {teamMembers.slice(0, 5).map((member, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {member}
                  </Badge>
                ))}
                {teamMembers.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{teamMembers.length - 5}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
