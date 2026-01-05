import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  FileUp,
  Users,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Edit2,
  Clock,
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'update' | 'file' | 'member' | 'comment' | 'milestone' | 'alert';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: {
    [key: string]: any;
  };
}

interface ProjectActivityProps {
  activities: Activity[];
  maxDisplay?: number;
}

export function ProjectActivity({
  activities,
  maxDisplay = 5,
}: ProjectActivityProps) {
  const displayActivities = activities.slice(0, maxDisplay);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <FileUp className="h-4 w-4 text-blue-500" />;
      case 'member':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'milestone':
        return <CheckCircle2 className="h-4 w-4 text-purple-500" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-orange-500" />;
      default:
        return <Edit2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'file':
        return 'bg-blue-50 text-blue-800';
      case 'member':
        return 'bg-green-50 text-green-800';
      case 'milestone':
        return 'bg-purple-50 text-purple-800';
      case 'alert':
        return 'bg-red-50 text-red-800';
      case 'comment':
        return 'bg-orange-50 text-orange-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Activity</span>
          {activities.length > maxDisplay && (
            <Badge variant="outline">{activities.length} total</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 pb-4 last:pb-0"
              >
                {/* Timeline Dot */}
                <div className="mt-1 flex-shrink-0">
                  <div className="relative h-8 w-8 flex items-center justify-center rounded-full bg-gray-100">
                    {getActivityIcon(activity.type)}
                  </div>
                  {index < displayActivities.length - 1 && (
                    <div className="absolute left-4 top-8 h-4 w-0.5 bg-gray-200"></div>
                  )}
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                    </div>
                    <Badge className={`flex-shrink-0 text-xs ${getActivityBadgeColor(activity.type)}`}>
                      {activity.type}
                    </Badge>
                  </div>

                  {/* Activity Meta */}
                  <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{getTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* View All Link */}
            {activities.length > maxDisplay && (
              <div className="text-center pt-4 border-t">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  View all {activities.length} activities →
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
