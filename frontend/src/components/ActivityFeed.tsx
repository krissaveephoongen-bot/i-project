import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  CheckCircle,
  Edit,
  Trash2,
  MessageSquare,
  User,
  MoreVertical,
} from 'lucide-react';

interface Activity {
  id: number;
  type: 'create' | 'update' | 'delete' | 'comment' | 'assign' | 'status_change';
  action: string;
  description?: string;
  entityType: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  createdAt: Date;
}

interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
  onActivityClick?: (activity: Activity) => void;
}

function getActivityIcon(type: Activity['type']) {
  switch (type) {
    case 'create':
      return <FileText className="h-5 w-5 text-blue-500" />;
    case 'update':
      return <Edit className="h-5 w-5 text-yellow-500" />;
    case 'delete':
      return <Trash2 className="h-5 w-5 text-red-500" />;
    case 'comment':
      return <MessageSquare className="h-5 w-5 text-green-500" />;
    case 'assign':
      return <User className="h-5 w-5 text-purple-500" />;
    case 'status_change':
      return <CheckCircle className="h-5 w-5 text-indigo-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
}

function getActivityColor(type: Activity['type']) {
  switch (type) {
    case 'create':
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    case 'update':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    case 'delete':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    case 'comment':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    case 'assign':
      return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
    case 'status_change':
      return 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800';
    default:
      return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
  }
}

export function ActivityFeed({
  activities,
  isLoading = false,
  onActivityClick,
}: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No activities yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          onClick={() => onActivityClick?.(activity)}
          className={`p-4 rounded-lg border cursor-pointer transition hover:shadow-md ${getActivityColor(
            activity.type
          )} ${onActivityClick ? 'hover:shadow-lg' : ''}`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activity.userAvatar && (
                    <img
                      src={activity.userAvatar}
                      alt={activity.userName}
                      className="h-6 w-6 rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.userName}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {activity.action}
              </p>

              {activity.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {activity.description}
                </p>
              )}

              <div className="mt-2">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600">
                  {activity.entityType}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityFeed;
