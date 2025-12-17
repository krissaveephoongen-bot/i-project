import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Target,
  Zap
} from 'lucide-react';

interface SCurveStatusCardsProps {
  plannedPercentage: number;
  actualPercentage: number;
  variance: number;
  completedTasks: number;
  totalTasks: number;
  status: string;
}

const SCurveStatusCards: React.FC<SCurveStatusCardsProps> = ({
  plannedPercentage,
  actualPercentage,
  variance,
  completedTasks,
  totalTasks,
  status
}) => {
  const isOnTrack = actualPercentage >= plannedPercentage;
  const variancePercent = Math.abs(variance);
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Planned Progress Card */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Planned Progress</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{plannedPercentage.toFixed(1)}%</p>
            </div>
            <Target className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
          <Progress value={plannedPercentage} className="h-2" />
          <p className="text-xs text-gray-500 mt-2">Target trajectory based on task due dates</p>
        </CardContent>
      </Card>

      {/* Actual Progress Card */}
      <Card className={`border ${isOnTrack ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Actual Progress</p>
              <p className={`text-2xl font-bold mt-1 ${isOnTrack ? 'text-green-600' : 'text-orange-600'}`}>
                {actualPercentage.toFixed(1)}%
              </p>
            </div>
            {isOnTrack ? (
              <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
            ) : (
              <AlertCircle className="h-8 w-8 text-orange-500 opacity-20" />
            )}
          </div>
          <Progress value={actualPercentage} className="h-2" />
          <p className="text-xs text-gray-500 mt-2">Real completion based on finished tasks</p>
        </CardContent>
      </Card>

      {/* Variance Card */}
      <Card className={`border ${variance >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Schedule Variance</p>
              <p className={`text-2xl font-bold mt-1 ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
              </p>
            </div>
            {variance >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-500 opacity-20" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              className={
                variance >= 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }
            >
              {variance >= 0 ? 'Ahead of Schedule' : 'Behind Schedule'}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {variance >= 0
              ? `Running ${variancePercent.toFixed(1)}% ahead of plan`
              : `Running ${variancePercent.toFixed(1)}% behind plan`}
          </p>
        </CardContent>
      </Card>

      {/* Task Completion Card */}
      <Card className="border border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Task Completion</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {completedTasks}/{totalTasks}
              </p>
            </div>
            <Zap className="h-8 w-8 text-purple-500 opacity-20" />
          </div>
          <Progress value={taskCompletionRate} className="h-2" />
          <p className="text-xs text-gray-500 mt-2">
            {taskCompletionRate.toFixed(1)}% of tasks completed
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SCurveStatusCards;
