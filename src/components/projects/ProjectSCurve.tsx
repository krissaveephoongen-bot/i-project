import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp } from 'lucide-react';

interface MilestonePoint {
  date: string;
  plannedProgress: number;
  actualProgress: number;
  label: string;
}

interface ProjectSCurveProps {
  milestones?: MilestonePoint[];
  currentProgress: number;
  startDate: string;
  endDate: string;
}

/**
 * S-Curve Component
 * Visualizes project progress using an S-curve pattern
 * Shows planned vs actual progress over timeline
 */
export function ProjectSCurve({
  milestones = [],
  currentProgress,
  startDate,
  endDate,
}: ProjectSCurveProps) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedPercent = (elapsedDays / totalDays) * 100;

  // Generate default milestones if not provided
  const defaultMilestones: MilestonePoint[] = [
    {
      date: startDate,
      plannedProgress: 0,
      actualProgress: Math.min(currentProgress, 5),
      label: 'Start',
    },
    {
      date: new Date(start.getTime() + (totalDays * 1000 * 60 * 60 * 24 * 0.25)).toISOString().split('T')[0],
      plannedProgress: 20,
      actualProgress: Math.min(currentProgress, 25),
      label: 'Phase 1',
    },
    {
      date: new Date(start.getTime() + (totalDays * 1000 * 60 * 60 * 24 * 0.5)).toISOString().split('T')[0],
      plannedProgress: 50,
      actualProgress: Math.min(currentProgress, 55),
      label: 'Mid-point',
    },
    {
      date: new Date(start.getTime() + (totalDays * 1000 * 60 * 60 * 24 * 0.75)).toISOString().split('T')[0],
      plannedProgress: 80,
      actualProgress: Math.min(currentProgress, 85),
      label: 'Phase 3',
    },
    {
      date: endDate,
      plannedProgress: 100,
      actualProgress: currentProgress,
      label: 'End',
    },
  ];

  const displayMilestones = milestones.length > 0 ? milestones : defaultMilestones;

  // Calculate curve path for SVG
  const chartWidth = 400;
  const chartHeight = 300;
  const padding = 40;
  const graphWidth = chartWidth - 2 * padding;
  const graphHeight = chartHeight - 2 * padding;

  // Generate path data
  const pointsToPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      path += ` Q ${xc} ${yc} ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  // Calculate planned progress curve (S-curve pattern)
  const plannedPoints = displayMilestones.map((m) => ({
    x: padding + (displayMilestones.indexOf(m) / (displayMilestones.length - 1)) * graphWidth,
    y: chartHeight - padding - (m.plannedProgress / 100) * graphHeight,
  }));

  // Calculate actual progress curve
  const actualPoints = displayMilestones.map((m) => ({
    x: padding + (displayMilestones.indexOf(m) / (displayMilestones.length - 1)) * graphWidth,
    y: chartHeight - padding - (m.actualProgress / 100) * graphHeight,
  }));

  // Current progress line
  const currentX = padding + (elapsedPercent / 100) * graphWidth;
  const currentY = chartHeight - padding - (currentProgress / 100) * graphHeight;

  // Determine if on track
  const isOnTrack = Math.abs(currentProgress - elapsedPercent) <= 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            S-Curve Progress
          </span>
          <Badge className={isOnTrack ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
            {isOnTrack ? 'On Track' : 'Behind Schedule'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SVG Chart */}
        <div className="w-full overflow-x-auto">
          <svg width={chartWidth} height={chartHeight} className="mx-auto">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((percent) => (
              <g key={`grid-${percent}`}>
                {/* Horizontal grid */}
                <line
                  x1={padding}
                  y1={chartHeight - padding - (percent / 100) * graphHeight}
                  x2={chartWidth - padding}
                  y2={chartHeight - padding - (percent / 100) * graphHeight}
                  stroke="#e5e7eb"
                  strokeDasharray="4"
                />
                {/* Y-axis labels */}
                <text
                  x={padding - 10}
                  y={chartHeight - padding - (percent / 100) * graphHeight + 4}
                  textAnchor="end"
                  className="text-xs text-gray-500"
                >
                  {percent}%
                </text>
              </g>
            ))}

            {/* Axes */}
            <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#374151" strokeWidth="2" />
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#374151" strokeWidth="2" />

            {/* Planned Progress Curve */}
            <path
              d={pointsToPath(plannedPoints)}
              stroke="#94a3b8"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              opacity="0.6"
            />

            {/* Actual Progress Curve */}
            <path
              d={pointsToPath(actualPoints)}
              stroke="#3b82f6"
              strokeWidth="3"
              fill="none"
            />

            {/* Milestones */}
            {displayMilestones.map((m, index) => (
              <g key={`milestone-${index}`}>
                {/* Planned point */}
                <circle
                  cx={plannedPoints[index].x}
                  cy={plannedPoints[index].y}
                  r="4"
                  fill="#cbd5e1"
                  opacity="0.6"
                />
                {/* Actual point */}
                <circle
                  cx={actualPoints[index].x}
                  cy={actualPoints[index].y}
                  r="5"
                  fill="#3b82f6"
                />
              </g>
            ))}

            {/* Current position line */}
            <line
              x1={currentX}
              y1={padding}
              x2={currentX}
              y2={chartHeight - padding}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="3,3"
              opacity="0.7"
            />

            {/* Current progress point */}
            <circle
              cx={currentX}
              cy={currentY}
              r="6"
              fill="#ef4444"
            />

            {/* X-axis labels */}
            <text
              x={padding}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              className="text-xs text-gray-500"
            >
              Start
            </text>
            <text
              x={chartWidth - padding}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              className="text-xs text-gray-500"
            >
              End
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-6 border-b-2 border-blue-500" />
            <span className="text-gray-600">Actual</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-6 border-b-2 border-gray-400 border-dashed" />
            <span className="text-gray-600">Planned</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-gray-600">Current</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600">Planned Progress</p>
            <p className="text-lg font-bold text-gray-900">{Math.round(elapsedPercent)}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Actual Progress</p>
            <p className="text-lg font-bold text-blue-600">{currentProgress}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Variance</p>
            <p className={`text-lg font-bold ${currentProgress >= elapsedPercent ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(currentProgress - Math.round(elapsedPercent))}%
            </p>
          </div>
        </div>

        {/* Milestones Table */}
        <div className="pt-4 border-t">
          <h4 className="font-medium text-gray-900 mb-3">Milestones Progress</h4>
          <div className="space-y-2">
            {displayMilestones.map((m, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-gray-700">{m.label}</span>
                  <span className="text-xs text-gray-500">({new Date(m.date).toLocaleDateString()})</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-gray-600">
                    Planned: <span className="font-medium">{m.plannedProgress}%</span>
                  </div>
                  <div className="text-blue-600">
                    Actual: <span className="font-bold">{m.actualProgress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Message */}
        <div className={`p-3 rounded-lg ${isOnTrack ? 'bg-green-50' : 'bg-orange-50'}`}>
          <p className={`text-sm ${isOnTrack ? 'text-green-700' : 'text-orange-700'}`}>
            {isOnTrack
              ? `Project is on track. Current progress (${currentProgress}%) matches timeline expectations (${Math.round(elapsedPercent)}%).`
              : `Project is behind schedule. Expected ${Math.round(elapsedPercent)}% but currently at ${currentProgress}% (${currentProgress - Math.round(elapsedPercent)}% behind).`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
