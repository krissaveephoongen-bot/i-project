export type WorkType = 'project' | 'support' | 'training' | 'admin' | 'other';

export interface TimeEntry {
  id: string;
  projectId: string;
  date: string;
  workType: WorkType;
  hours: number;
  description?: string;
}
