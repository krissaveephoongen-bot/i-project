import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SCurveDataPoint } from '@/types/project';

interface SCurveChartProps {
  data: SCurveDataPoint[];
  title?: string;
  height?: number;
}

export default function SCurveChart({ 
  data, 
  title = 'Project Progress S-Curve', 
  height = 400 
}: SCurveChartProps) {
  
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <p className="text-gray-500">No data available to display chart</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for display
  const chartData = data.map(point => ({
    week: `Week ${point.week}`,
    plannedProgress: Math.round(point.plannedProgress),
    actualProgress: Math.round(point.actualProgress),
    variance: Math.round(point.variance),
    date: new Date(point.date).toLocaleDateString(),
  }));

  // Calculate current variance
  const lastDataPoint = data[data.length - 1];
  const currentVariance = lastDataPoint.variance;
  const isOnTrack = currentVariance >= -5 && currentVariance <= 5;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className={`text-sm font-medium px-3 py-1 rounded-full ${
            isOnTrack 
              ? 'bg-green-100 text-green-700' 
              : currentVariance < 0 
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            Variance: {currentVariance > 0 ? '+' : ''}{currentVariance.toFixed(1)}%
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {isOnTrack ? 'Project is on track' : currentVariance < 0 ? 'Project is behind schedule' : 'Project is ahead of schedule'}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="week" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
              formatter={(value: any) => `${value}%`}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <ReferenceLine 
              y={100} 
              stroke="#d1d5db" 
              strokeDasharray="5 5"
              label={{ value: '100% Target', position: 'right', fill: '#6b7280', fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="plannedProgress"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              name="Planned Progress"
            />
            <Line
              type="monotone"
              dataKey="actualProgress"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              name="Actual Progress"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600">Planned Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(data[data.length - 1].plannedProgress)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Actual Progress</p>
            <p className="text-2xl font-bold text-green-600">
              {Math.round(data[data.length - 1].actualProgress)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Variance</p>
            <p className={`text-2xl font-bold ${
              currentVariance >= 0 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {currentVariance > 0 ? '+' : ''}{currentVariance.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
