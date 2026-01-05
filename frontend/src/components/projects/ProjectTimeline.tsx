import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface TimelineData {
  label: string;
  date: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'pending';
}

interface ProjectTimelineProps {
  startDate: string;
  endDate: string;
  currentProgress: number;
  milestones?: TimelineData[];
}

export function ProjectTimeline({
  startDate,
  endDate,
  currentProgress,
  milestones = [],
}: ProjectTimelineProps) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, totalDays - elapsedDays);
  
  const timelineProgress = (elapsedDays / totalDays) * 100;
  const isOnTrack = Math.abs(currentProgress - timelineProgress) <= 10;
  
  // Default milestones if not provided
  const defaultMilestones: TimelineData[] = [
    {
      label: 'Project Start',
      date: startDate,
      progress: 0,
      status: 'completed',
    },
    {
      label: 'Phase 1',
      date: new Date(start.getTime() + (totalDays * 1000 * 60 * 60 * 24 * 0.25)).toISOString().split('T')[0],
      progress: 25,
      status: currentProgress >= 25 ? 'completed' : elapsedDays >= totalDays * 0.25 ? 'in-progress' : 'pending',
    },
    {
      label: 'Phase 2',
      date: new Date(start.getTime() + (totalDays * 1000 * 60 * 60 * 24 * 0.5)).toISOString().split('T')[0],
      progress: 50,
      status: currentProgress >= 50 ? 'completed' : elapsedDays >= totalDays * 0.5 ? 'in-progress' : 'pending',
    },
    {
      label: 'Phase 3',
      date: new Date(start.getTime() + (totalDays * 1000 * 60 * 60 * 24 * 0.75)).toISOString().split('T')[0],
      progress: 75,
      status: currentProgress >= 75 ? 'completed' : elapsedDays >= totalDays * 0.75 ? 'in-progress' : 'pending',
    },
    {
      label: 'Project End',
      date: endDate,
      progress: 100,
      status: currentProgress >= 100 ? 'completed' : 'pending',
    },
  ];

  const displayMilestones = milestones.length > 0 ? milestones : defaultMilestones;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project Timeline</span>
            {isOnTrack ? (
              <Badge className="bg-green-100 text-green-800">On Track</Badge>
            ) : (
              <Badge className="bg-orange-100 text-orange-800">At Risk</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timeline Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Timeline Progress</span>
              <span className="font-medium">{Math.round(timelineProgress)}%</span>
            </div>
            <Progress value={timelineProgress} className="h-2" />
          </div>

          {/* Project Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Project Progress</span>
              <span className="font-medium">{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>

          {/* Timeline Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 mb-1">Elapsed Time</p>
              <p className="font-semibold text-gray-900">{elapsedDays} days</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 mb-1">Remaining</p>
              <p className="font-semibold text-gray-900">{remainingDays} days</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 mb-1">Start Date</p>
              <p className="font-semibold text-gray-900">{start.toLocaleDateString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 mb-1">End Date</p>
              <p className="font-semibold text-gray-900">{end.toLocaleDateString()}</p>
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Milestones</h4>
            <div className="space-y-3">
              {displayMilestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="mt-1">{getStatusIcon(milestone.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{milestone.label}</p>
                      <Badge variant="outline" className="text-xs">
                        {milestone.progress}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      {new Date(milestone.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
