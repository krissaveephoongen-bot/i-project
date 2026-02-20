
import { WorkType } from '@/app/timesheet/types';

export interface ActivityType {
  id: string;
  name: string;
  workType: WorkType; // Link to WorkType (Project, Office, etc.)
  isActive: boolean;
}

const DEFAULT_ACTIVITIES: ActivityType[] = [
  { id: '1', name: 'Development', workType: WorkType.PROJECT, isActive: true },
  { id: '2', name: 'Design', workType: WorkType.PROJECT, isActive: true },
  { id: '3', name: 'Testing', workType: WorkType.PROJECT, isActive: true },
  { id: '4', name: 'Deployment', workType: WorkType.PROJECT, isActive: true },
  { id: '5', name: 'Meeting', workType: WorkType.PROJECT, isActive: true },
  { id: '6', name: 'Internal Meeting', workType: WorkType.OFFICE, isActive: true },
  { id: '7', name: 'Training', workType: WorkType.OFFICE, isActive: true },
  { id: '8', name: 'Admin Tasks', workType: WorkType.OFFICE, isActive: true },
  { id: '9', name: 'Sick Leave', workType: WorkType.LEAVE, isActive: true },
  { id: '10', name: 'Personal Leave', workType: WorkType.LEAVE, isActive: true },
  { id: '11', name: 'Annual Leave', workType: WorkType.LEAVE, isActive: true },
];

const STORAGE_KEY = 'activity_types_config';

export const activityService = {
  getAll: async (): Promise<ActivityType[]> => {
    if (typeof window === 'undefined') return DEFAULT_ACTIVITIES;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Initialize if empty
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACTIVITIES));
      return DEFAULT_ACTIVITIES;
    }
    return JSON.parse(stored);
  },

  getByWorkType: async (type: WorkType): Promise<ActivityType[]> => {
    const all = await activityService.getAll();
    return all.filter(a => a.workType === type && a.isActive);
  },

  add: async (activity: Omit<ActivityType, 'id'>): Promise<ActivityType> => {
    const all = await activityService.getAll();
    const newActivity = { ...activity, id: Date.now().toString() };
    const updated = [...all, newActivity];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newActivity;
  },

  update: async (activity: ActivityType): Promise<void> => {
    const all = await activityService.getAll();
    const updated = all.map(a => a.id === activity.id ? activity : a);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  delete: async (id: string): Promise<void> => {
    const all = await activityService.getAll();
    const updated = all.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};
