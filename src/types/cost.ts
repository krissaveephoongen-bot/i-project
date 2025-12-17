// Cost Related Types

export interface Cost {
  id: string;
  projectId: string;
  description: string;
  amount: number;
  category: 'labor' | 'materials' | 'equipment' | 'other';
  date: Date;
  submittedBy: string; // userId
  approvedBy?: string; // userId
  status: 'pending' | 'approved' | 'rejected';
  invoiceNumber?: string;
  attachments?: string[]; // file URLs
  createdAt: Date;
  updatedAt: Date;
}

export interface CostApproval {
  id: string;
  costId: string;
  approvedBy: string;
  status: 'approved' | 'rejected';
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostSummary {
  projectId: string;
  period: {
    start: Date;
    end: Date;
  };
  byCategory: {
    labor: number;
    materials: number;
    equipment: number;
    other: number;
  };
  total: number;
  budgeted: number;
  variance: number;
  percentageOfBudget: number;
}

export interface BudgetAllocation {
  projectId: string;
  labor: number;
  materials: number;
  equipment: number;
  other: number;
  total: number;
  currency: string;
}
