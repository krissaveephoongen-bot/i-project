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

const SAMPLE_PROJECTS = [];

async function getProjects() {
  try {
    const res = await fetch('/api/projects', { cache: 'no-store' });
    if (!res.ok) return SAMPLE_PROJECTS;
    const rows = await res.json();
    return (rows || []).map(p => ({
      id: p.id,
      code: p.code || '',
      name: p.name || '',
      description: p.description || '',
      manager: p.managerId || '',
      status: p.status || 'planning',
      progress: p.progress || 0,
      startDate: p.startDate || '',
      dueDate: p.endDate || '',
      budget: p.budget || 0,
      teamSize: p.teamSize || 0,
      color: p.color || 'blue',
      team: Array.isArray(p.team) ? p.team : []
    }));
  } catch {
    return SAMPLE_PROJECTS;
  }
}

const SAMPLE_TASKS = [];

async function getTasks() {
  try {
    const res = await fetch('/api/projects/tasks');
    if (!res.ok) return SAMPLE_TASKS;
    const rows = await res.json();
    return (rows || []).map(t => ({
      id: t.id,
      title: t.title || t.name || '',
      description: t.description || '',
      status: t.status || 'todo',
      priority: t.priority || 'medium',
      assignee: t.assignedTo || '',
      dueDate: t.dueDate || '',
      projectId: t.projectId || ''
    }));
  } catch {
    return SAMPLE_TASKS;
  }
}

async function getProjectById(id) {
  try {
    const res = await fetch(`/api/projects?q=${encodeURIComponent(id)}`);
    if (!res.ok) return SAMPLE_PROJECTS[0] || null;
    const rows = await res.json();
    const p = (rows || []).find(x => x.id === id) || rows[0];
    if (!p) return SAMPLE_PROJECTS[0] || null;
    return {
      id: p.id,
      code: p.code || '',
      name: p.name || '',
      description: p.description || '',
      manager: p.managerId || '',
      status: p.status || 'active',
      progress: p.progress || 0,
      startDate: p.startDate || '',
      dueDate: p.endDate || '',
      budget: p.budget || 0,
      teamSize: p.teamSize || 0,
      color: p.color || 'blue',
      team: Array.isArray(p.team) ? p.team : []
    };
  } catch {
    return SAMPLE_PROJECTS[0] || null;
  }
}

async function getTasksByProject(projectId) {
  try {
    const res = await fetch(`/api/projects/tasks?projectId=${encodeURIComponent(projectId)}`);
    if (!res.ok) return SAMPLE_TASKS.filter(t => t.projectId === projectId);
    const rows = await res.json();
    return (rows || []).map(t => ({
      id: t.id,
      title: t.title || t.name || '',
      description: t.description || '',
      status: t.status || 'todo',
      priority: t.priority || 'medium',
      assignee: t.assignedTo || '',
      dueDate: t.dueDate || '',
      projectId: t.projectId || ''
    }));
  } catch {
    return SAMPLE_TASKS.filter(t => t.projectId === projectId);
  }
}
