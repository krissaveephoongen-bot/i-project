import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Clock,
  Download,
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ScrollContainer from '../components/layout/ScrollContainer';

export default function Reports() {
  const { user } = useAuthContext();
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [filters, setFilters] = useState({
    projectId: '',
    userId: '',
    department: '',
  });

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    try {
      toast.success(`Report exported as ${format.toUpperCase()}`);
      // API call to export report
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setDateRange('30');
    setFilters({
      projectId: '',
      userId: '',
      department: '',
    });
    toast.success('Filters cleared');
  };

  const EmptyReportState = () => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-500 text-center max-w-md mb-4">
          Click "Generate Report" to fetch data based on your selected filters and date range.
        </p>
        <Button onClick={handleGenerateReport} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" />
          Generate Report
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <ScrollContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-600 mt-1">Current User: {user?.name} ({user?.id})</p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleExportReport('pdf')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportReport('excel')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportReport('csv')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Report Type and Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type
                  </label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Overview Report</SelectItem>
                      <SelectItem value="financial">Financial Report</SelectItem>
                      <SelectItem value="timesheet">Timesheet Report</SelectItem>
                      <SelectItem value="cost">Cost Report</SelectItem>
                      <SelectItem value="resource">Resource Report</SelectItem>
                      <SelectItem value="project">Project Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Date Range */}
              {dateRange === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Additional Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project
                  </label>
                  <Input
                    placeholder="Enter project ID or name"
                    value={filters.projectId}
                    onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User
                  </label>
                  <Input
                    placeholder="Enter user ID or name"
                    value={filters.userId}
                    onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <Input
                    placeholder="Enter department"
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4">
                <Button 
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
                <Button 
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Tabs */}
        <Tabs value={reportType} onValueChange={setReportType} className="w-full">
          <TabsList className="bg-white border-b border-gray-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
            <TabsTrigger value="cost">Cost</TabsTrigger>
            <TabsTrigger value="resource">Resources</TabsTrigger>
            <TabsTrigger value="project">Projects</TabsTrigger>
          </TabsList>

          {/* Overview Report */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <EmptyReportState />
          </TabsContent>

          {/* Financial Report */}
          <TabsContent value="financial" className="space-y-6 mt-6">
            <EmptyReportState />
          </TabsContent>

          {/* Timesheet Report */}
          <TabsContent value="timesheet" className="space-y-6 mt-6">
            <EmptyReportState />
          </TabsContent>

          {/* Cost Report */}
          <TabsContent value="cost" className="space-y-6 mt-6">
            <EmptyReportState />
          </TabsContent>

          {/* Resource Report */}
          <TabsContent value="resource" className="space-y-6 mt-6">
            <EmptyReportState />
          </TabsContent>

          {/* Project Report */}
          <TabsContent value="project" className="space-y-6 mt-6">
            <EmptyReportState />
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Report Information</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Select filters and click "Generate Report" to create customized reports. 
                  You can then export the data in PDF, Excel, or CSV format.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollContainer>
  );
}
