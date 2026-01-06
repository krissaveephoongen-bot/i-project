import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatCurrency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportSummaryProps {
  data: any;
  type: 'projects' | 'tasks' | 'timesheets' | 'expenses' | 'financial' | 'overview';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ReportSummary({ data, type }: ReportSummaryProps) {
  if (!data) return null;

  const renderOverviewReport = () => {
    if (!data.projects) return null;
    
    const projectData = [
      { name: 'Active', value: data.projects.active, color: '#3b82f6' },
      { name: 'Completed', value: data.projects.completed, color: '#10b981' },
      { name: 'Overdue', value: data.projects.overdue, color: '#ef4444' },
    ];

    const taskData = [
      { name: 'Todo', value: data.tasks.todo, color: '#6b7280' },
      { name: 'In Progress', value: data.tasks.inProgress, color: '#f59e0b' },
      { name: 'In Review', value: data.tasks.inReview, color: '#8b5cf6' },
      { name: 'Completed', value: data.tasks.completed, color: '#10b981' },
    ];

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900">{data.projects.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{data.tasks.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{data.users.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Budget Utilization</p>
              <p className="text-3xl font-bold text-gray-900">{data.budget.utilizationRate}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={projectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderFinancialReport = () => {
    if (!data.budgetAnalysis) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget Analysis by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.budgetAnalysis.slice(0, 10).map((project: any) => (
                <div key={project.projectId} className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{project.projectName}</h4>
                      {project.projectCode && (
                        <p className="text-sm text-gray-500">{project.projectCode}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{project.utilization}%</p>
                      <p className="text-xs text-gray-500">utilized</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Budget</p>
                      <p className="font-medium">{formatCurrency(project.budget)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Spent</p>
                      <p className="font-medium text-red-600">{formatCurrency(project.spent)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Remaining</p>
                      <p className="font-medium text-green-600">{formatCurrency(project.remaining)}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${project.utilization > 90 ? 'bg-red-500' : project.utilization > 75 ? 'bg-orange-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(project.utilization, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {data.expenseBreakdown && (
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.expenseBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" name="Total" />
                  <Bar dataKey="approved" fill="#10b981" name="Approved" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {data.timeTrackingSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{data.timeTrackingSummary.totalHours}h</p>
                </div>
                <div className="p-4 border rounded-lg bg-blue-50">
                  <p className="text-sm text-gray-600">Billable Hours</p>
                  <p className="text-2xl font-bold text-blue-600">{data.timeTrackingSummary.billableHours}h</p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50">
                  <p className="text-sm text-gray-600">Approved Hours</p>
                  <p className="text-2xl font-bold text-green-600">{data.timeTrackingSummary.approvedHours}h</p>
                </div>
                <div className="p-4 border rounded-lg bg-orange-50">
                  <p className="text-sm text-gray-600">Pending Hours</p>
                  <p className="text-2xl font-bold text-orange-600">{data.timeTrackingSummary.pendingHours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderProjectReport = () => {
    if (!Array.isArray(data)) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Analytics Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((project: any) => (
              <div key={project.id} className="border-b pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-500">{project.code} · {project.status}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'done' ? 'bg-green-100 text-green-800' :
                    project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.progress}% Complete
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Tasks</p>
                    <p className="font-medium">{project.completedTasks}/{project.taskCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hours</p>
                    <p className="font-medium">{project.totalHours}h</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Budget</p>
                    <p className="font-medium">{formatCurrency(project.budget)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expenses</p>
                    <p className="font-medium">{formatCurrency(project.totalExpenses)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTimesheetReport = () => {
    if (!Array.isArray(data)) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Timesheet Report ({data.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left p-2 text-sm font-semibold text-gray-600">User</th>
                  <th className="text-left p-2 text-sm font-semibold text-gray-600">Project</th>
                  <th className="text-left p-2 text-sm font-semibold text-gray-600">Task</th>
                  <th className="text-right p-2 text-sm font-semibold text-gray-600">Hours</th>
                  <th className="text-center p-2 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-sm">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="p-2 text-sm">{entry.userName}</td>
                    <td className="p-2 text-sm">{entry.projectName || 'N/A'}</td>
                    <td className="p-2 text-sm">{entry.taskTitle || entry.description || 'N/A'}</td>
                    <td className="p-2 text-sm text-right font-medium">{entry.hours}h</td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                        entry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderExpenseReport = () => {
    if (!Array.isArray(data)) return null;

    const totalAmount = data.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{data.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Average Expense</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.length > 0 ? totalAmount / data.length : 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expense Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left p-2 text-sm font-semibold text-gray-600">User</th>
                    <th className="text-left p-2 text-sm font-semibold text-gray-600">Category</th>
                    <th className="text-left p-2 text-sm font-semibold text-gray-600">Description</th>
                    <th className="text-right p-2 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-center p-2 text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((expense: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="p-2 text-sm">{expense.userName}</td>
                      <td className="p-2 text-sm capitalize">{expense.category}</td>
                      <td className="p-2 text-sm">{expense.description}</td>
                      <td className="p-2 text-sm text-right font-medium">{formatCurrency(expense.amount)}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                          expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {expense.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  switch (type) {
    case 'overview':
      return renderOverviewReport();
    case 'financial':
      return renderFinancialReport();
    case 'projects':
      return renderProjectReport();
    case 'timesheets':
      return renderTimesheetReport();
    case 'expenses':
      return renderExpenseReport();
    default:
      return <div className="text-center py-8 text-gray-500">No data available</div>;
  }
}