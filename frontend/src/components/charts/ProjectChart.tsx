import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  change?: number;
  color?: string;
  maxValue?: number;
}

interface ProjectChartProps {
  title: string;
  type: 'bar' | 'pie' | 'progress';
  data: ChartData[];
  height?: number;
}

export function ProjectChart({ title, type, data, height = 200 }: ProjectChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-orange-500',
    ];
    return colors[index % colors.length];
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-blue-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (type === 'progress') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{item.value}%</span>
                    {item.change && (
                      <div className={`flex items-center text-xs ${
                        item.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.change > 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(item.change)}%
                      </div>
                    )}
                    {data[0]?.change !== undefined && (
                      <div className="flex items-center text-xs text-green-600">
                        {data[0].change >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(data[0].change)}% from last month
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Progress 
                    value={item.value} 
                    className={`h-2 ${getProgressColor(item.value)}`}
                  />
                  {hoveredIndex === index && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                      {item.value}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'bar') {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3" style={{ height: `${height}px` }}>
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-20 text-sm text-gray-600 truncate">
                  {item.name}
                </div>
                <div className="flex-1 relative">
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getColor(index)} transition-all duration-500`}
                      style={{ width: `${(item.value / maxValue) * 100}%` }}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  </div>
                  {hoveredIndex === index && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                      {item.value}
                    </div>
                  )}
                </div>
                <div className="w-12 text-right text-sm font-medium text-gray-900">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <PieChart className="h-5 w-5 text-gray-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
            <div className="relative w-32 h-32">
              {/* Simple pie chart using conic gradient */}
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(
                    ${data.map((item, index) => {
                      const percentage = (item.value / total) * 100;
                      const color = index === 0 ? '#3B82F6' : 
                                   index === 1 ? '#10B981' : 
                                   index === 2 ? '#F59E0B' : 
                                   '#EF4444';
                      return `${color} ${index === 0 ? 0 : data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 100, 0)}% ${percentage}%`;
                    }).join(', ')}
                  )`
                }}
              />
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{total}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: index === 0 ? '#3B82F6' :
                                       index === 1 ? '#10B981' :
                                       index === 2 ? '#F59E0B' :
                                       '#EF4444'
                    }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {item.value} ({Math.round((item.value / total) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
