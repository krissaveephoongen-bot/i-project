// Timesheet Related Types

export type WorkType = 'Onsite' | 'Office' | 'Leave' | 'Project-related' | 'General Office Work';

export interface TimesheetEntry {
  id: string;
  userId: string;
  date: Date;
  workType: WorkType;
  hours: number;
  description?: string;
  projectId?: string;
  taskId?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface TimesheetWeek {
  id: string;
  userId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  entries: TimesheetEntry[];
  totalHours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string; // userId of approver
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimesheetApproval {
  id: string;
  timesheetId: string;
  userId: string;
  approvedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimesheetSummary {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalHours: number;
  workTypeBreakdown: {
    [key in WorkType]: number;
  };
  projectsWorked: string[];
  approvalStatus: 'approved' | 'pending' | 'rejected';
}
