export const WorkType = {
  PROJECT: 'project' as const,
  SUPPORT: 'support' as const,
  TRAINING: 'training' as const,
  ADMIN: 'admin' as const,
  OTHER: 'other' as const,
};

export type WorkType = typeof WorkType[keyof typeof WorkType];

export interface TimeEntry {
  id: string;
  projectId: string;
  date: string;
  workType: WorkType;
  hours: number;
  description?: string;
}
