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
  Target
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

  const getStatusColor = (status: ProjectCardProps['status']) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      planning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'on-hold': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[status] || colors.planning;
  };

  const getPriorityColor = (priority: ProjectCardProps['priority']) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    return colors[priority] || colors.medium;
  };

  const budgetUtilization = budget > 0 ? (spent / budget) * 100 : 0;
  const taskCompletion = tasksCount > 0 ? (completedTasks / tasksCount) * 100 : 0;
  
  const daysRemaining = Math.ceil(
    (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const isBudgetOverrun = budgetUtilization > 100;
  const isDelayed = progress < ((100 - ((new Date(endDate).getTime() - new Date().getTime()) / (new Date(endDate).getTime() - new Date(startDate).getTime())) * 100));

  return (
    <Card 
      className={`hover:shadow-xl transition-all duration-200 cursor-pointer group relative overflow-hidden ${
        isAtRisk ? 'border-l-4 border-red-500' : ''
      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {/* Background accent */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 transition-all ${
        status === 'completed' ? 'bg-green-500' : 
        status === 'active' ? 'bg-blue-500' :
        status === 'planning' ? 'bg-yellow-500' : 'bg-gray-500'
      }`} />

      {/* Header */}
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between gap-2">
          {/* Checkbox for bulk selection */}
          {onSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(id, checked as boolean)}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate flex-1 max-w-xs">
                {name}
              </h3>
              <Badge className={getStatusColor(status)}>
                {status.replace('-', ' ')}
              </Badge>
              <Badge className={getPriorityColor(priority)}>
                {priority}
              </Badge>
            </div>
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{code}</p>
          </div>

          {/* Action Menu */}
          <div className="flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView?.(id); }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShowInfo?.(id); }}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Project Info
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShowCharter?.(id); }}>
                  <FileText className="h-4 w-4 mr-2" />
                  Charter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(id); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-4 relative">
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
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Client</p>
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 truncate">{clientName}</p>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">PM</p>
            <p className="text-xs font-semibold text-purple-900 dark:text-purple-200 truncate">{projectManager}</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Budget */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Budget</span>
            </div>
            <span className={`text-xs font-medium ${isBudgetOverrun ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-200'}`}>
              {Math.round(budgetUtilization)}%
            </span>
          </div>
          <Progress 
            value={Math.min(budgetUtilization, 100)} 
            className={`h-2 ${isBudgetOverrun ? 'bg-red-100' : ''}`}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatCurrency(spent)} / {formatCurrency(budget)}
          </p>
        </div>

        {/* Tasks */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Tasks</span>
            </div>
            <span className="text-xs font-medium text-gray-900 dark:text-gray-200">
              {completedTasks}/{tasksCount} ({Math.round(taskCompletion)}%)
            </span>
          </div>
          <Progress value={taskCompletion} className="h-2" />
        </div>

        {/* Timeline & Team */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t dark:border-gray-700">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {daysRemaining > 0 ? `${daysRemaining}d left` : 'Overdue'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {teamMembers.length} members
            </span>
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
