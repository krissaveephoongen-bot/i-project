/**
 * Reports Page - Comprehensive project reports with data from database
 * Displays project summary, timesheet, expense, and budget reports
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  BarChart3,
  Download,
  TrendingUp,
  DollarSign,
  // Clock, Users, CheckCircle, AlertCircle intentionally omitted (unused)
  Calendar,
  FileText,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { useProjects, useTimeEntries, useExpenses } from '../hooks/useProjectData';
import TimesheetSummary from '../components/timesheet/TimesheetSummary';
import ExpenseSummary from '../components/expense/ExpenseSummary';

interface ProjectReport {
  id: number;
  name: string;
  code: string;
  status: string;
  budget: number;
  spent: number;
  remaining: number;
  progress: number;
  manager: string;
  client: string;
  startDate: string;
  endDate: string;
  taskCount: number;
  completedTasks: number;
}

const ReportsNew: React.FC = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { entries: timeEntries, loading: timesheetLoading } = useTimeEntries();
  const { expenses, loading: expensesLoading } = useExpenses();

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectReports, setProjectReports] = useState<ProjectReport[]>([]);

  // Calculate project reports
  useEffect(() => {
    if (projects.length > 0) {
      const reports: ProjectReport[] = projects.map(project => ({
        id: project.id,
        name: project.name,
        code: project.code,
        status: project.status,
        budget: parseFloat(project.budget as any),
        spent: parseFloat(project.spent as any),
        remaining: parseFloat(project.remaining as any),
        progress:
          parseFloat(project.budget as any) > 0
            ? Math.round(
                (parseFloat(project.spent as any) / parseFloat(project.budget as any)) * 100
              )
            : 0,
        manager: 'Project Manager', // Will be populated from data
        client: 'Client Name', // Will be populated from data
        startDate: new Date(project.startDate).toLocaleDateString('th-TH'),
        endDate: new Date(project.endDate).toLocaleDateString('th-TH'),
        taskCount: 0, // Will be calculated
        completedTasks: 0, // Will be calculated
      }));

      setProjectReports(reports);
      if (reports.length > 0 && !selectedProjectId) {
        setSelectedProjectId(reports[0]!.id);
      }
    }
  }, [projects, selectedProjectId]);

  // Filter data by selected project
  const selectedProject = projectReports.find(p => p.id === selectedProjectId);
  const projectTimeEntries = timeEntries.filter(e => e.projectId === selectedProjectId);
  const projectExpenses = expenses.filter(e => e.projectId === selectedProjectId);

  // Calculate totals
  const totalBudget = projectReports.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projectReports.reduce((sum, p) => sum + p.spent, 0);
  const totalHours = timeEntries.reduce((sum, e) => sum + parseFloat(e.hours as any), 0);
  const approvedTimeHours = timeEntries
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + parseFloat(e.hours as any), 0);
  const approvedExpenses = expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + parseFloat(e.amount as any), 0);

  const handleExportReport = () => {
    // Placeholder for export functionality
    alert('Export report functionality - PDF export will be implemented');
  };

  const isLoading = projectsLoading || timesheetLoading || expensesLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Project summary, timesheet, and expense reports</p>
        </div>
        <Button
          onClick={handleExportReport}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Budget */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((totalSpent / totalBudget) * 100)}% of budget
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Total Hours */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours Logged</p>
                <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
                <p className="text-xs text-gray-500 mt-1">
                  {approvedTimeHours.toFixed(1)}h approved
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Project Count */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projectReports.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {projectReports.filter(p => p.status === 'done').length} completed
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Summary Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Project</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Budget</th>
                      <th className="text-right py-3 px-4 font-medium">Spent</th>
                      <th className="text-right py-3 px-4 font-medium">Remaining</th>
                      <th className="text-right py-3 px-4 font-medium">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectReports.map(report => (
                      <tr key={report.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{report.name}</p>
                            <p className="text-xs text-gray-500">{report.code}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              report.status === 'done'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }
                          >
                            {report.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">{formatCurrency(report.budget)}</td>
                        <td className="py-3 px-4 text-right text-red-600">
                          {formatCurrency(report.spent)}
                        </td>
                        <td className="py-3 px-4 text-right text-green-600">
                          {formatCurrency(report.remaining)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${report.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{report.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timesheet Tab */}
        <TabsContent value="timesheet" className="space-y-4">
          <TimesheetSummary entries={timeEntries} loading={timesheetLoading} />

          {selectedProjectId && projectTimeEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Timesheet Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">User</th>
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-right py-3 px-4 font-medium">Hours</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectTimeEntries.slice(0, 10).map(entry => (
                        <tr key={entry.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {new Date(entry.date).toLocaleDateString('th-TH')}
                          </td>
                          <td className="py-3 px-4">User {entry.userId}</td>
                          <td className="py-3 px-4 capitalize">{entry.workType}</td>
                          <td className="py-3 px-4 text-right font-medium">
                            {entry.hours}h
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                entry.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {entry.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{entry.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <ExpenseSummary expenses={expenses} loading={expensesLoading} />

          {selectedProjectId && projectExpenses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Category</th>
                        <th className="text-right py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectExpenses.slice(0, 10).map(expense => (
                        <tr key={expense.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {new Date(expense.date).toLocaleDateString('th-TH')}
                          </td>
                          <td className="py-3 px-4 capitalize">{expense.category}</td>
                          <td className="py-3 px-4 text-right font-medium">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                expense.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : expense.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {expense.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{expense.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Budget vs Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projectReports.map(project => (
                  <div key={project.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{project.name}</p>
                        <p className="text-sm text-gray-500">{project.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(project.spent)}/{formatCurrency(project.budget)}
                        </p>
                        <p className="text-sm text-gray-500">{project.progress}% spent</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsNew;
