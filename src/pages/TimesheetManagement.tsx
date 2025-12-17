import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Check, X, Clock, AlertCircle, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TimesheetEntry, TimesheetWeek, WorkType } from '@/types/timesheet';
import { timesheetService } from '@/services/timesheetService';
import ScrollContainer from '@/components/layout/ScrollContainer';

const WORK_TYPES: WorkType[] = ['Onsite', 'Office', 'Leave', 'Project-related', 'General Office Work'];

export default function TimesheetManagement() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'submit' | 'approve'>('submit');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [timesheetWeeks, setTimesheetWeeks] = useState<TimesheetWeek[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<TimesheetWeek[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);

  const [entryForm, setEntryForm] = useState({
    workType: 'Onsite' as WorkType,
    hours: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    projectId: '',
    taskId: '',
  });

  // Get week start date (Monday)
  const getWeekStartDate = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStartDate(currentWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Load timesheets
  const loadTimesheets = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const weeks = await timesheetService.getTimesheetWeeks(user.id);
        setTimesheetWeeks(weeks);
      }
    } catch (error) {
      console.error('Failed to load timesheets:', error);
      toast.error('Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  };

  // Load pending approvals (for managers)
  const loadPendingApprovals = async () => {
    try {
      if (user?.role === 'manager' || user?.role === 'admin') {
        const approvals = await timesheetService.getPendingApprovals(user.id);
        setPendingApprovals(approvals);
      }
    } catch (error) {
      console.error('Failed to load pending approvals:', error);
    }
  };

  useEffect(() => {
    loadTimesheets();
    loadPendingApprovals();
  }, [user?.id]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!entryForm.workType || entryForm.hours <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const entry: Omit<TimesheetEntry, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user?.id || '',
        date: new Date(entryForm.date),
        workType: entryForm.workType,
        hours: entryForm.hours,
        description: entryForm.description,
        projectId: entryForm.projectId,
        taskId: entryForm.taskId,
        status: 'draft',
      };

      await timesheetService.createTimesheetEntry(entry);
      toast.success('Timesheet entry added successfully');
      
      setShowAddEntry(false);
      resetForm();
      await loadTimesheets();
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error('Failed to add timesheet entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        setLoading(true);
        await timesheetService.deleteTimesheetEntry(entryId);
        toast.success('Entry deleted successfully');
        await loadTimesheets();
      } catch (error) {
        console.error('Error deleting entry:', error);
        toast.error('Failed to delete entry');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmitTimesheet = async (timesheetId: string) => {
    try {
      setLoading(true);
      await timesheetService.submitTimesheetWeek(timesheetId);
      toast.success('Timesheet submitted successfully');
      await loadTimesheets();
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      toast.error('Failed to submit timesheet');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (timesheetId: string) => {
    try {
      setLoading(true);
      await timesheetService.approveTimesheet(timesheetId);
      toast.success('Timesheet approved successfully');
      await loadPendingApprovals();
    } catch (error) {
      console.error('Error approving timesheet:', error);
      toast.error('Failed to approve timesheet');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (timesheetId: string) => {
    const reason = window.prompt('Please provide rejection reason:');
    if (!reason) return;

    try {
      setLoading(true);
      await timesheetService.rejectTimesheet(timesheetId, reason);
      toast.success('Timesheet rejected successfully');
      await loadPendingApprovals();
    } catch (error) {
      console.error('Error rejecting timesheet:', error);
      toast.error('Failed to reject timesheet');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEntryForm({
      workType: 'Onsite',
      hours: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      projectId: '',
      taskId: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      submitted: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getWorkTypeColor = (workType: WorkType) => {
    const colors = {
      'Onsite': 'bg-blue-100 text-blue-700',
      'Office': 'bg-purple-100 text-purple-700',
      'Leave': 'bg-red-100 text-red-700',
      'Project-related': 'bg-green-100 text-green-700',
      'General Office Work': 'bg-yellow-100 text-yellow-700',
    };
    return colors[workType] || 'bg-gray-100 text-gray-700';
  };

  return (
    <ScrollContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Timesheet Management</h1>
            <p className="text-sm text-gray-600 mt-1">Current User: {user?.name} ({user?.id})</p>
          </div>
          {activeTab === 'submit' && (
            <Button 
              onClick={() => {
                resetForm();
                setShowAddEntry(!showAddEntry);
              }}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'submit' | 'approve')}>
          <TabsList className="bg-white border-b border-gray-200">
            <TabsTrigger value="submit" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Submit Timesheet
            </TabsTrigger>
            {(user?.role === 'manager' || user?.role === 'admin') && (
              <TabsTrigger value="approve" className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Approve Timesheets
              </TabsTrigger>
            )}
          </TabsList>

          {/* Submit Tab */}
          <TabsContent value="submit" className="space-y-6 mt-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Week of {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
                >
                  Previous Week
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentWeek(new Date())}
                >
                  This Week
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
                >
                  Next Week
                </Button>
              </div>
            </div>

            {/* Add Entry Form */}
            {showAddEntry && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Add Timesheet Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddEntry} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date *
                        </label>
                        <Input
                          type="date"
                          value={entryForm.date}
                          onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Work Type *
                        </label>
                        <Select 
                          value={entryForm.workType} 
                          onValueChange={(v) => setEntryForm({ ...entryForm, workType: v as WorkType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WORK_TYPES.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hours *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={entryForm.hours}
                          onChange={(e) => setEntryForm({ ...entryForm, hours: parseFloat(e.target.value) })}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project ID
                        </label>
                        <Input
                          value={entryForm.projectId}
                          onChange={(e) => setEntryForm({ ...entryForm, projectId: e.target.value })}
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={entryForm.description}
                        onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
                        placeholder="What did you work on?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddEntry(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {loading ? 'Adding...' : 'Add Entry'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Current Week Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timesheet Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading entries...</div>
                ) : timesheetWeeks.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No entries yet. Add your first entry to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {timesheetWeeks.map((week) =>
                      week.entries?.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getWorkTypeColor(entry.workType)}`}>
                                {entry.workType}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(entry.date).toLocaleDateString()}
                              </span>
                            </div>
                            {entry.description && (
                              <p className="text-sm text-gray-600">{entry.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-semibold text-gray-900">{entry.hours}h</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadge(entry.status)}`}>
                              {entry.status}
                            </span>
                            {entry.status === 'draft' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteEntry(entry.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Summary */}
            {timesheetWeeks.length > 0 && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {WORK_TYPES.map((type) => {
                      const totalHours = timesheetWeeks.reduce((sum, week) =>
                        sum + (week.entries?.filter(e => e.workType === type).reduce((s, e) => s + e.hours, 0) || 0),
                        0
                      );
                      return (
                        <div key={type} className="text-center">
                          <p className="text-sm text-gray-600">{type}</p>
                          <p className="text-2xl font-bold text-gray-900">{totalHours}h</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-blue-200 mt-4 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Hours</span>
                      <span className="text-3xl font-bold text-blue-600">
                        {timesheetWeeks.reduce((sum, week) =>
                          sum + (week.entries?.reduce((s, e) => s + e.hours, 0) || 0),
                          0
                        )}h
                      </span>
                    </div>
                  </div>

                  {timesheetWeeks[0]?.status === 'draft' && (
                    <Button
                      onClick={() => handleSubmitTimesheet(timesheetWeeks[0].id)}
                      disabled={loading}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Submit Timesheet
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Approval Tab */}
          {(user?.role === 'manager' || user?.role === 'admin') && (
            <TabsContent value="approve" className="space-y-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>

              {loading ? (
                <div className="text-center py-8">Loading pending approvals...</div>
              ) : pendingApprovals.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Check className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No pending timesheets to approve</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((timesheet) => (
                    <Card key={timesheet.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Week of {new Date(timesheet.weekStartDate).toLocaleDateString()}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {timesheet.entries?.length || 0} entries • {timesheet.totalHours}h total
                              </p>
                            </div>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(timesheet.status)}`}>
                              {timesheet.status}
                            </span>
                          </div>

                          {/* Entries Preview */}
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            {timesheet.entries?.slice(0, 3).map((entry) => (
                              <div key={entry.id} className="flex justify-between text-sm">
                                <span className="text-gray-600">{entry.workType} ({new Date(entry.date).toLocaleDateString()})</span>
                                <span className="font-medium text-gray-900">{entry.hours}h</span>
                              </div>
                            ))}
                            {(timesheet.entries?.length || 0) > 3 && (
                              <div className="text-sm text-gray-500 pt-2 border-t border-gray-200">
                                +{(timesheet.entries?.length || 0) - 3} more entries
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(timesheet.id)}
                              disabled={loading}
                              className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(timesheet.id)}
                              disabled={loading}
                              variant="destructive"
                              className="flex-1 gap-2"
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </ScrollContainer>
  );
}
