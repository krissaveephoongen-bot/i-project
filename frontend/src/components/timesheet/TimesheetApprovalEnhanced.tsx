import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Filter, Users, Clock, CheckCircle, XCircle, AlertCircle, User, Building2 } from 'lucide-react';
import ScrollContainer from '@/components/layout/ScrollContainer';
import { timesheetService } from '@/services/timesheetService';
import { useAuth } from '@/contexts/AuthContext';
import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import { parseApiError } from '@/lib/error-handler';
import { toast } from 'react-hot-toast';

interface TimesheetEntry {
  id: string;
  date: string;
  workType: string;
  startTime: string;
  endTime: string;
  hours: number;
  description: string;
  status: string;
  projectManagerApprovalStatus: string;
  supervisorApprovalStatus: string;
  projectManagerApprovalDate?: string;
  supervisorApprovalDate?: string;
  projectManagerId?: string;
  supervisorId?: string;
  user: {
    id: string;
    name: string;
    email: string;
    position: string;
    employeeCode?: string;
  };
  project: {
    id: string;
    name: string;
    code: string;
  };
  task?: {
    id: string;
    title: string;
  };
}

export default function TimesheetApproval() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending-pm' | 'pending-supervisor' | 'pm-approved' | 'rejected'>('pending-pm');
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [searchFilters, setSearchFilters] = useState({
    projectCode: '',
    affiliation: '',
    startDate: '',
    endDate: '',
    nameOrId: ''
  });

  useEffect(() => {
    loadTimesheets();
  }, [activeTab]);

  const loadTimesheets = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      switch (activeTab) {
        case 'pending-pm':
          data = await timesheetService.getPendingPMApprovals(user?.id);
          break;
        case 'pending-supervisor':
          data = await timesheetService.getPendingSupervisorApprovals(user?.id);
          break;
        case 'pm-approved':
          data = await timesheetService.getPMApprovedTimesheets(user?.id);
          break;
        case 'rejected':
          // Get all rejected timesheets
          data = await timesheetService.getTimesheets({ status: 'rejected' });
          break;
        default:
          data = [];
      }

      setTimesheets(data || []);
    } catch (err) {
      console.error('Error loading timesheets:', err);
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePMApprove = async (timesheetId: string) => {
    try {
      await timesheetService.pmApproveTimesheet(timesheetId, user?.id || '');
      toast.success('Timesheet approved successfully');
      loadTimesheets();
    } catch (error) {
      toast.error('Failed to approve timesheet');
      console.error('Approval error:', error);
    }
  };

  const handlePMReject = async (timesheetId: string, reason: string) => {
    try {
      await timesheetService.pmRejectTimesheet(timesheetId, user?.id || '', reason);
      toast.success('Timesheet rejected');
      loadTimesheets();
    } catch (error) {
      toast.error('Failed to reject timesheet');
      console.error('Rejection error:', error);
    }
  };

  const handleSupervisorApprove = async (timesheetId: string) => {
    try {
      await timesheetService.supervisorApproveTimesheet(timesheetId, user?.id || '');
      toast.success('Timesheet approved by supervisor');
      loadTimesheets();
    } catch (error) {
      toast.error('Failed to approve timesheet');
      console.error('Approval error:', error);
    }
  };

  const handleSupervisorReject = async (timesheetId: string, reason: string) => {
    try {
      await timesheetService.supervisorRejectTimesheet(timesheetId, user?.id || '', reason);
      toast.success('Timesheet rejected by supervisor');
      loadTimesheets();
    } catch (error) {
      toast.error('Failed to reject timesheet');
      console.error('Rejection error:', error);
    }
  };

  const getStatusColor = (pmStatus: string, supervisorStatus: string) => {
    if (pmStatus === 'rejected' || supervisorStatus === 'rejected') {
      return 'bg-red-100 text-red-800';
    }
    if (pmStatus === 'approved' && supervisorStatus === 'approved') {
      return 'bg-green-100 text-green-800';
    }
    if (pmStatus === 'approved' && supervisorStatus === 'pending') {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (pmStatus: string, supervisorStatus: string) => {
    if (pmStatus === 'rejected' || supervisorStatus === 'rejected') {
      return 'ถูกปฏิเรียน';
    }
    if (pmStatus === 'approved' && supervisorStatus === 'approved') {
      return 'อนุมัติแล้ว';
    }
    if (pmStatus === 'approved' && supervisorStatus === 'pending') {
      return 'รออนุมัติหัวหน้างาน';
    }
    return 'รออนุมัติ';
  };

  const filteredTimesheets = timesheets.filter(timesheet => {
    if (searchFilters.projectCode && !timesheet.project?.code.toLowerCase().includes(searchFilters.projectCode.toLowerCase())) {
      return false;
    }
    if (searchFilters.affiliation && !timesheet.project?.name.toLowerCase().includes(searchFilters.affiliation.toLowerCase())) {
      return false;
    }
    if (searchFilters.nameOrId) {
      const searchLower = searchFilters.nameOrId.toLowerCase();
      return timesheet.user.name.toLowerCase().includes(searchLower) ||
             timesheet.user.employeeCode?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  if (loading) {
    return (
      <ScrollContainer>
        <div className="space-y-6 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">การอนุมัติ</h1>
          </div>
          <LoadingState message="กำลงงานโหลดข้อมูล..." />
        </div>
      </ScrollContainer>
    );
  }

  if (error) {
    return (
      <ScrollContainer>
        <div className="space-y-6 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">การอนุมัติ</h1>
            <Button onClick={loadTimesheets} variant="outline" size="sm">
              ลองใหม่
            </Button>
          </div>
          <ErrorState
            error={error}
            onRetry={loadTimesheets}
          />
        </div>
      </ScrollContainer>
    );
  }

  return (
    <ScrollContainer>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">การอนุมัติ</h1>
          <Button onClick={loadTimesheets} variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            รีเฟรช
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('pending-pm')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending-pm'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              รายการรออนุมัติ (ผู้จัดการโครงการ)
            </button>
            <button
              onClick={() => setActiveTab('pending-supervisor')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending-supervisor'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              รายการรออนุมัติ (หัวหน้างาน)
            </button>
            <button
              onClick={() => setActiveTab('pm-approved')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pm-approved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              รายการผู้จัดการโครงการอนุมัติ
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rejected'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              รายการไม่อนุมัติ
            </button>
          </nav>
        </div>

        {/* Advanced Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              ค้นหาขั้นสูง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสโครงการ</label>
                <Input
                  placeholder="กรอกรหัสโครงการ"
                  value={searchFilters.projectCode}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, projectCode: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สังกัด</label>
                <Input
                  placeholder="กรอกสังกัด"
                  value={searchFilters.affiliation}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, affiliation: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
                <Input
                  type="date"
                  value={searchFilters.startDate}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
                <Input
                  type="date"
                  value={searchFilters.endDate}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ, นามสกุล หรือ รหัสพนักงาน</label>
                <Input
                  placeholder="กรอกชื่อ หรือรหัสพนักงาน"
                  value={searchFilters.nameOrId}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, nameOrId: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setSearchFilters({
                projectCode: '',
                affiliation: '',
                startDate: '',
                endDate: '',
                nameOrId: ''
              })}>
                ล้างข้อมูล
              </Button>
              <Button onClick={loadTimesheets}>
                <Search className="h-4 w-4 mr-2" />
                ค้นหา
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timesheet List */}
        {filteredTimesheets.length === 0 ? (
          <EmptyState
            icon="📋"
            title="ไม่พบรายการอนุมัติ"
            description="ไม่มีรายการอนุมัติที่ตรงกับเงื่อนที่ค้นหา"
            action={{
              label: "ล้างตัวกรอง",
              onClick: () => setSearchFilters({
                projectCode: '',
                affiliation: '',
                startDate: '',
                endDate: '',
                nameOrId: ''
              })
            }}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                รายการ{activeTab === 'pending-pm' ? 'รออนุมัติ (ผู้จัดการโครงการ)' : 
                       activeTab === 'pending-supervisor' ? 'รออนุมัติ (หัวหน้างาน)' :
                       activeTab === 'pm-approved' ? 'รายการผู้จัดการโครงการอนุมัติ' : 'รายการไม่อนุมัติ'}
                ({filteredTimesheets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ลำดับที่
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่รายงาน
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่สิ้นสุดอนุมัติ
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ดำเนินการ
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ชั่วโมงทํางาน
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ชื่อ - นามสกุล, ตำแหน่ง
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        รหัสโครงการ
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานะงาน
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ประเภทงาน
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        รายละเอียดการทํางาน
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTimesheets.map((timesheet, index) => (
                      <tr key={timesheet.id} className="border-b hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          {index + 1}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          {new Date(timesheet.date).toLocaleDateString('th-TH')}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          {timesheet.supervisorApprovalDate ? 
                            new Date(timesheet.supervisorApprovalDate).toLocaleDateString('th-TH') : 
                            timesheet.projectManagerApprovalDate ? 
                              new Date(timesheet.projectManagerApprovalDate).toLocaleDateString('th-TH') : 
                              '-'
                          }
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(timesheet.projectManagerApprovalStatus, timesheet.supervisorApprovalStatus)}>
                              {getStatusText(timesheet.projectManagerApprovalStatus, timesheet.supervisorApprovalStatus)}
                            </Badge>
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          {timesheet.hours}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          <div className="space-y-1">
                            <div className="font-medium">{timesheet.user.name}</div>
                            <div className="text-xs text-gray-500">{timesheet.user.position}</div>
                            {timesheet.user.employeeCode && (
                              <div className="text-xs text-gray-500">รหัส: {timesheet.user.employeeCode}</div>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="font-medium">{timesheet.project?.name}</div>
                                <div className="text-xs text-gray-500">{timesheet.project?.code}</div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          {timesheet.workType}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          <Badge variant="outline">
                            {timesheet.description || '-'}
                          </Badge>
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          <div className="flex gap-2">
                            {activeTab === 'pending-pm' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePMApprove(timesheet.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePMReject(timesheet.id, 'เหตุผลพัฒนาน')}
                                  className="text-red-600 hover:text-red-700 ml-2"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {activeTab === 'pending-supervisor' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSupervisorApprove(timesheet.id)}
                                  className="text-green-600 hover:text-green-700"
                                  disabled={timesheet.projectManagerApprovalStatus !== 'approved'}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSupervisorReject(timesheet.id, 'ไม่ผ่านเกณฑ')}
                                  className="text-red-600 hover:text-red-700 ml-2"
                                  disabled={timesheet.projectManagerApprovalStatus !== 'approved'}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollContainer>
  );
}
