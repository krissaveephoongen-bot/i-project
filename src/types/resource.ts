// Resource Related Types

export interface ResourceCapacity {
  userId: string;
  totalCapacity: number; // hours per week or month
  availableCapacity: number; // remaining available hours
  allocatedCapacity: number; // currently allocated hours
  projects: ResourceAllocation[];
  updatedAt: Date;
}

export interface ResourceAllocation {
  projectId: string;
  projectName: string;
  allocatedHours: number;
  startDate: Date;
  endDate: Date;
  role: string;
  status: 'active' | 'completed' | 'on-hold';
}

export interface ResourceUtilization {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalCapacity: number;
  utilizedHours: number;
  utilizationRate: number; // percentage
  byProject: {
    projectId: string;
    hours: number;
    percentage: number;
  }[];
}

export interface TeamCapacity {
  projectId: string;
  period: {
    start: Date;
    end: Date;
  };
  teamMembers: {
    userId: string;
    userName: string;
    role: string;
    allocatedHours: number;
    actualHours: number;
    utilizationRate: number;
  }[];
  totalAllocatedHours: number;
  totalActualHours: number;
}
