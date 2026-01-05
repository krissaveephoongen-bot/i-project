// Trickle Database API functions for projects and tasks

// Check if Trickle Database API is available
const isDatabaseAvailable = () => {
  try {
    return typeof trickleListObjects === 'function' && 
           typeof trickleCreateObject === 'function' &&
           typeof trickleUpdateObject === 'function' &&
           typeof trickleDeleteObject === 'function';
  } catch (error) {
    console.log('Database check failed:', error.message);
    return false;
  }
};

// Safe wrapper for database calls
const safeDatabaseCall = async (fn, fallback = []) => {
  if (!isDatabaseAvailable()) {
    console.log('Database not available, using fallback data');
    return fallback;
  }
  
  try {
    return await fn();
  } catch (error) {
    console.error('Database call failed:', error);
    return fallback;
  }
};

// Sample data for when database is empty or unavailable
const SAMPLE_PROJECTS = [
  {
    id: 'sample-1',
    code: 'PRJ-001',
    name: 'Website Redesign',
    description: 'Complete redesign of company website',
    manager: 'สมชาย ใจดี',
    status: 'active',
    progress: 65,
    startDate: '2025-01-15',
    dueDate: '2025-12-31',
    budget: 500000,
    teamSize: 3,
    color: 'blue',
    team: ['Alex', 'Sarah', 'Mike']
  },
  {
    id: 'sample-2',
    code: 'PRJ-002',
    name: 'Mobile App Development',
    description: 'Native iOS and Android app',
    manager: 'วิชญ์ รักดี',
    status: 'active',
    progress: 40,
    startDate: '2025-02-01',
    dueDate: '2026-03-15',
    budget: 800000,
    teamSize: 2,
    color: 'green',
    team: ['John', 'Emily']
  }
];

async function getProjects() {
  return safeDatabaseCall(async () => {
    const result = await trickleListObjects('project', 50, true);
    
    if (!result || !result.items || result.items.length === 0) {
      console.log('No projects in database');
      return SAMPLE_PROJECTS;
    }
    
    const projects = result.items.map(item => ({
      id: item.objectId,
      code: item.objectData?.Code || '',
      name: item.objectData?.Name || 'Untitled Project',
      description: item.objectData?.Description || '',
      manager: item.objectData?.ProjectManager || item.objectData?.Manager || '',
      status: item.objectData?.Status || 'planning',
      progress: item.objectData?.Progress || 0,
      startDate: item.objectData?.StartDate || '',
      dueDate: item.objectData?.EndDate || item.objectData?.DueDate || '',
      budget: item.objectData?.Budget || 0,
      teamSize: item.objectData?.TeamSize || 0,
      color: item.objectData?.Color || 'blue',
      team: item.objectData?.Team ? item.objectData.Team.split(',') : []
    })).filter(p => p !== null);
    
    return projects.length > 0 ? projects : SAMPLE_PROJECTS;
  }, SAMPLE_PROJECTS);
}

const SAMPLE_TASKS = [
  {
    id: 'task-1',
    title: 'Design homepage mockup',
    description: 'Create initial design for new homepage',
    status: 'progress',
    priority: 'high',
    assignee: 'Sarah',
    dueDate: '2025-12-01',
    projectId: 'sample-1'
  },
  {
    id: 'task-2',
    title: 'Setup development environment',
    description: 'Configure tools and frameworks',
    status: 'completed',
    priority: 'high',
    assignee: 'Mike',
    dueDate: '2025-11-20',
    projectId: 'sample-2'
  }
];

async function getTasks() {
  return safeDatabaseCall(async () => {
    const result = await trickleListObjects('task', 50, true);
    
    if (!result || !result.items || result.items.length === 0) {
      console.log('No tasks in database');
      return SAMPLE_TASKS;
    }
    
    return result.items.map(item => ({
      id: item.objectId,
      title: item.objectData?.Name || item.objectData?.Title || 'Untitled Task',
      description: item.objectData?.Description || '',
      status: item.objectData?.Status || 'todo',
      priority: item.objectData?.Priority || 'medium',
      assignee: item.objectData?.Assignee || '',
      dueDate: item.objectData?.DueDate || '',
      projectId: item.objectData?.ProjectId || ''
    }));
  }, SAMPLE_TASKS);
}

async function getProjectById(id) {
  return safeDatabaseCall(async () => {
    const project = await trickleGetObject('project', id);
    
    if (!project) {
      return SAMPLE_PROJECTS.find(p => p.id === id) || SAMPLE_PROJECTS[0] || null;
    }
    
    return {
      id: project.objectId,
      code: project.objectData?.Code || '',
      name: project.objectData?.Name || 'Untitled Project',
      description: project.objectData?.Description || '',
      manager: project.objectData?.ProjectManager || project.objectData?.Manager || '',
      status: project.objectData?.Status || 'active',
      progress: project.objectData?.Progress || 0,
      startDate: project.objectData?.StartDate || '',
      dueDate: project.objectData?.EndDate || project.objectData?.DueDate || '',
      budget: project.objectData?.Budget || 0,
      teamSize: project.objectData?.TeamSize || 0,
      color: project.objectData?.Color || 'blue',
      team: project.objectData?.Team ? project.objectData.Team.split(',') : []
    };
  }, SAMPLE_PROJECTS.find(p => p.id === id) || SAMPLE_PROJECTS[0] || null);
}

async function getTasksByProject(projectId) {
  return safeDatabaseCall(async () => {
    const result = await trickleListObjects('task', 50, true);
    
    if (!result || !result.items) {
      return SAMPLE_TASKS.filter(t => t.projectId === projectId);
    }
    
    return result.items
      .filter(item => item.objectData?.ProjectId === projectId)
      .map(item => ({
        id: item.objectId,
        title: item.objectData?.Name || item.objectData?.Title || 'Untitled Task',
        description: item.objectData?.Description || '',
        status: item.objectData?.Status || 'todo',
        priority: item.objectData?.Priority || 'medium',
        assignee: item.objectData?.Assignee || '',
        dueDate: item.objectData?.DueDate || '',
        projectId: item.objectData?.ProjectId || ''
      }));
  }, SAMPLE_TASKS.filter(t => t.projectId === projectId));
}
