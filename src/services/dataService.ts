import { toast } from 'react-hot-toast';

// Database interfaces
export interface Project {
  id: string;
  code: string; // Unique project code (e.g., PROJ-001)
  name: string;
  description: string;
  status: 'planning' | 'active' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  progress: number;
  teamMembers: string[];
  projectManager?: string; // ID of the assigned PM
  budget: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignee?: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
  tags: string[];
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'developer' | 'designer';
  avatar?: string;
  department: string;
  skills: string[];
  workload: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'project' | 'task' | 'user' | 'comment';
  entityId: string;
  action: string;
  description: string;
  userId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class DataService {
  private dbName = 'ProjectManagementDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // Initialize IndexedDB
  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('status', 'status', { unique: false });
          projectStore.createIndex('priority', 'priority', { unique: false });
        }

        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('projectId', 'projectId', { unique: false });
          taskStore.createIndex('status', 'status', { unique: false });
          taskStore.createIndex('assignee', 'assignee', { unique: false });
        }

        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('role', 'role', { unique: false });
        }

        if (!db.objectStoreNames.contains('activities')) {
          const activityStore = db.createObjectStore('activities', { keyPath: 'id' });
          activityStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Generic CRUD operations
  private async add<T>(storeName: string, item: T): Promise<void> {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async update<T>(storeName: string, item: T, id: string): Promise<void> {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const existingItem = { ...item, id };
      const request = store.put(existingItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Project operations
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const newProject: Project = {
      ...project,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.add('projects', newProject);
    await this.addActivity('project', id, 'created', `Project "${project.name}" was created`, 'system');
    
    toast.success('Project created successfully!');
    return id;
  }

  async getProjects(): Promise<Project[]> {
    const projects = await this.getAll<Project>('projects');
    return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const projects = await this.getProjects();
    const project = projects.find(p => p.id === id);
    if (!project) throw new Error('Project not found');

    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.update('projects', updatedProject, id);
    await this.addActivity('project', id, 'updated', `Project "${project.name}" was updated`, 'system');
    
    toast.success('Project updated successfully!');
  }

  async deleteProject(id: string): Promise<void> {
    const projects = await this.getProjects();
    const project = projects.find(p => p.id === id);
    if (!project) throw new Error('Project not found');

    // Also delete related tasks
    const tasks = await this.getTasks();
    for (const task of tasks.filter(t => t.projectId === id)) {
      await this.delete('tasks', task.id);
    }

    await this.delete('projects', id);
    await this.addActivity('project', id, 'deleted', `Project "${project.name}" was deleted`, 'system');
    
    toast.success('Project deleted successfully!');
  }

  // Task operations
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const newTask: Task = {
      ...task,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.add('tasks', newTask);
    await this.addActivity('task', id, 'created', `Task "${task.title}" was created`, 'system');
    
    toast.success('Task created successfully!');
    return id;
  }

  async getTasks(projectId?: string): Promise<Task[]> {
    const tasks = await this.getAll<Task>('tasks');
    const filteredTasks = projectId 
      ? tasks.filter(t => t.projectId === projectId)
      : tasks;
    return filteredTasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');

    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.update('tasks', updatedTask, id);
    await this.addActivity('task', id, 'updated', `Task "${task.title}" was updated`, 'system');
    
    toast.success('Task updated successfully!');
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');

    await this.delete('tasks', id);
    await this.addActivity('task', id, 'deleted', `Task "${task.title}" was deleted`, 'system');
    
    toast.success('Task deleted successfully!');
  }

  // User operations
  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date().toISOString(),
    };

    await this.add('users', newUser);
    await this.addActivity('user', id, 'created', `User "${user.name}" was added to the team`, 'system');
    
    toast.success('User added successfully!');
    return id;
  }

  async getUsers(): Promise<User[]> {
    const users = await this.getAll<User>('users');
    return users.filter(u => u.status === 'active');
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const users = await this.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('User not found');

    const updatedUser = { ...user, ...updates };
    await this.update('users', updatedUser, id);
    await this.addActivity('user', id, 'updated', `User "${user.name}" was updated`, 'system');
    
    toast.success('User updated successfully!');
  }

  // Activity operations
  private async addActivity(
    type: Activity['type'],
    entityId: string,
    action: string,
    description: string,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const activity: Activity = {
      id: crypto.randomUUID(),
      type,
      entityId,
      action,
      description,
      userId,
      timestamp: new Date().toISOString(),
      metadata,
    };

    await this.add('activities', activity);
  }

  async getActivities(limit = 50): Promise<Activity[]> {
    const activities = await this.getAll<Activity>('activities');
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Analytics
  async getProjectStats() {
    const projects = await this.getProjects();
    const tasks = await this.getTasks();
    
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      tasksInProgress: tasks.filter(t => t.status === 'in-progress').length,
      overdueTasks: tasks.filter(t => 
        t.status !== 'completed' && new Date(t.dueDate) < new Date()
      ).length,
    };
  }

  // Initialize with sample data if database is empty
  async initializeSampleData(): Promise<void> {
    const existingProjects = await this.getProjects();
    if (existingProjects.length > 0) return; // Data already exists

    // Create sample users
    const users = [
      { name: 'John Doe', email: 'john@example.com', role: 'manager' as const, department: 'Engineering', skills: ['Project Management', 'React'], workload: 75, status: 'active' as const },
      { name: 'Sarah Chen', email: 'sarah@example.com', role: 'designer' as const, department: 'Design', skills: ['UI/UX', 'Figma'], workload: 60, status: 'active' as const },
      { name: 'Mike Johnson', email: 'mike@example.com', role: 'developer' as const, department: 'Engineering', skills: ['TypeScript', 'Node.js'], workload: 85, status: 'active' as const },
      { name: 'Emily Davis', email: 'emily@example.com', role: 'developer' as const, department: 'Engineering', skills: ['Python', 'Django'], workload: 70, status: 'active' as const },
    ];

    const userIds = [];
    for (const user of users) {
      const id = await this.createUser(user);
      userIds.push(id);
    }

    // Create sample projects
    const sampleProjects = [
      {
        name: 'Mobile App Development',
        description: 'Native mobile application for iOS and Android platforms',
        status: 'active' as const,
        priority: 'high' as const,
        startDate: '2024-01-15',
        endDate: '2024-06-30',
        progress: 45,
        teamMembers: [userIds[0], userIds[1], userIds[2]],
        budget: 150000,
        tags: ['mobile', 'react-native', 'ios', 'android'],
      },
      {
        name: 'Website Redesign',
        description: 'Complete redesign of the company website with modern UI/UX',
        status: 'active' as const,
        priority: 'medium' as const,
        startDate: '2024-02-01',
        endDate: '2024-04-15',
        progress: 70,
        teamMembers: [userIds[0], userIds[1], userIds[3]],
        budget: 80000,
        tags: ['web', 'design', 'ux'],
      },
      {
        name: 'API Integration',
        description: 'Integration with third-party APIs and microservices',
        status: 'planning' as const,
        priority: 'high' as const,
        startDate: '2024-03-01',
        endDate: '2024-05-30',
        progress: 0,
        teamMembers: [userIds[2], userIds[3]],
        budget: 60000,
        tags: ['api', 'backend', 'integration'],
      },
    ];

    const projectIds = [];
    for (const project of sampleProjects) {
      const id = await this.createProject(project);
      projectIds.push(id);
    }

    // Create sample tasks
    const sampleTasks = [
      {
        title: 'Design user authentication flow',
        description: 'Create wireframes and mockups for login, registration, and password reset',
        projectId: projectIds[1],
        assignee: userIds[1],
        status: 'in-progress' as const,
        priority: 'high' as const,
        startDate: '2024-02-05',
        dueDate: '2024-02-20',
        estimatedHours: 16,
        tags: ['design', 'auth', 'ux'],
        dependencies: [],
      },
      {
        title: 'Set up development environment',
        description: 'Configure development tools, CI/CD pipeline, and testing frameworks',
        projectId: projectIds[0],
        assignee: userIds[2],
        status: 'completed' as const,
        priority: 'medium' as const,
        startDate: '2024-01-15',
        dueDate: '2024-01-22',
        estimatedHours: 8,
        actualHours: 10,
        tags: ['setup', 'devops'],
        dependencies: [],
      },
      {
        title: 'Database schema design',
        description: 'Design and implement the database schema for the new system',
        projectId: projectIds[2],
        assignee: userIds[3],
        status: 'todo' as const,
        priority: 'high' as const,
        startDate: '2024-03-01',
        dueDate: '2024-03-15',
        estimatedHours: 24,
        tags: ['database', 'schema', 'backend'],
        dependencies: [],
      },
    ];

    for (const task of sampleTasks) {
      await this.createTask(task);
    }

    toast.success('Sample data initialized successfully!');
  }
}

export const dataService = new DataService();