import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Filter, Calendar } from 'lucide-react';
import ScrollContainer from '@/components/layout/ScrollContainer';

const projectData = [
  { month: 'Jan', planned: 20, actual: 18 },
  { month: 'Feb', planned: 35, actual: 32 },
  { month: 'Mar', planned: 28, actual: 30 },
  { month: 'Apr', planned: 42, actual: 40 },
  { month: 'May', planned: 38, actual: 39 },
  { month: 'Jun', planned: 45, actual: 44 },
];

const budgetData = [
  { month: 'Jan', budget: 50000, actual: 48000 },
  { month: 'Feb', budget: 60000, actual: 58000 },
  { month: 'Mar', budget: 55000, actual: 57000 },
  { month: 'Apr', budget: 70000, actual: 69000 },
  { month: 'May', budget: 65000, actual: 66000 },
  { month: 'Jun', budget: 80000, actual: 78000 },
];

const teamData = [
  { name: 'Sarah Chen', hours: 160, utilization: 95 },
  { name: 'John Doe', hours: 155, utilization: 92 },
  { name: 'Mike Johnson', hours: 150, utilization: 89 },
  { name: 'Alice Brown', hours: 165, utilization: 98 },
  { name: 'Jane Smith', hours: 145, utilization: 85 },
];

export default function AnalyticsEnhanced() {
  const [dateRange, setDateRange] = useState('6months');
  const [selectedProject, setSelectedProject] = useState('all');

  return (
    <ScrollContainer>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600 mt-1">Track project metrics and performance</p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Projects</option>
                  <option value="mobile">Mobile App</option>
                  <option value="backend">Backend API</option>
                  <option value="data">Data Migration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="1month">Last Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-2">Overall Progress</p>
              <p className="text-3xl font-bold text-gray-900">68%</p>
              <Badge className="mt-2 bg-green-100 text-green-800">+5% this month</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-2">Budget Utilization</p>
              <p className="text-3xl font-bold text-gray-900">78%</p>
              <Badge className="mt-2 bg-yellow-100 text-yellow-800">Within budget</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-2">Team Utilization</p>
              <p className="text-3xl font-bold text-gray-900">92%</p>
              <Badge className="mt-2 bg-blue-100 text-blue-800">Optimal</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-2">On-Time Projects</p>
              <p className="text-3xl font-bold text-gray-900">85%</p>
              <Badge className="mt-2 bg-green-100 text-green-800">7 of 8</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Project Progress Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={projectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="planned" stroke="#3b82f6" name="Planned" />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Budget Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value / 1000}K`} />
                  <Legend />
                  <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                  <Bar dataKey="actual" fill="#10b981" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Team Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Team Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamData.map((member, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.hours} hours logged</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {member.utilization}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            member.utilization >= 90
                              ? 'bg-green-600'
                              : member.utilization >= 75
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${member.utilization}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-medium text-yellow-900">Project Timeline</p>
                <p className="text-sm text-yellow-800 mt-1">
                  Mobile App project is slightly behind schedule. Consider allocating additional resources.
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-900">Team Performance</p>
                <p className="text-sm text-green-800 mt-1">
                  Team utilization is at optimal levels. Current team capacity is sufficient for ongoing projects.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900">Budget Status</p>
                <p className="text-sm text-blue-800 mt-1">
                  Current spending is tracking below budget. Budget allocation is on track for the year.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollContainer>
  );
}
