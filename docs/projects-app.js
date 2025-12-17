function UserProjects() {
  const [projects, setProjects] = React.useState([]);
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [userName] = React.useState(localStorage.getItem('userName') || 'User');
  const [userRole] = React.useState(localStorage.getItem('userRole') || 'employee');
  const [showProjectForm, setShowProjectForm] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState(null);

  const isManager = userRole === 'manager';

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      window.location.href = '../login.html';
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (typeof trickleListObjects !== 'function') {
        console.error('Trickle database functions not available');
        setLoading(false);
        return;
      }

      const [projectsRes, tasksRes] = await Promise.all([
        trickleListObjects('project', 50, true).catch(() => ({ items: [] })),
        trickleListObjects('task', 100, true).catch(() => ({ items: [] }))
      ]);
      
      const myProjects = (projectsRes.items || []).filter(p => 
        p.objectData.TeamMembers?.includes(userName) || 
        p.objectData.ProjectManager === userName
      );
      
      setProjects(myProjects);
      setTasks(tasksRes.items || []);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProjectTasks = (projectId) => {
    return tasks.filter(t => t.objectData.ProjectId === projectId);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowProjectForm(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        await trickleUpdateObject('project', editingProject.objectId, projectData);
      } else {
        await trickleCreateObject('project', projectData);
      }
      setShowProjectForm(false);
      setEditingProject(null);
      await loadData();
    } catch (error) {
      console.error('Save project error:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกโครงการ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="icon-loader-2 text-4xl text-blue-500 animate-spin mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <UserNav currentPage="projects" />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Projects</h1>
          {isManager && (
            <button onClick={handleCreateProject} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
              <div className="icon-plus text-lg"></div>
              <span>New Project</span>
            </button>
          )}
        </div>
        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="icon-briefcase text-6xl text-gray-300 mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects assigned</h3>
            <p className="text-gray-500">You don't have any projects assigned yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
          {projects.map(project => {
            const projectTasks = getProjectTasks(project.objectId);
            const completedTasks = projectTasks.filter(t => t.objectData.Status === 'completed').length;
            
            return (
              <div key={project.objectId} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{project.objectData.Name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{project.objectData.Description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs ${
                    project.objectData.Status === 'active' ? 'bg-green-100 text-green-700' :
                    project.objectData.Status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{project.objectData.Status}</span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">{project.objectData.Progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" 
                         style={{width: `${project.objectData.Progress || 0}%`}}></div>
                  </div>
                </div>
                
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <div className="icon-check-circle text-base inline mr-1"></div>
                      {completedTasks}/{projectTasks.length} tasks
                    </div>
                    <button onClick={() => window.location.href = `project-detail.html?id=${project.objectId}`} 
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                      View Details
                    </button>
                  </div>
                  {isManager && project.objectData.ProjectManager === userName && (
                    <div className="flex gap-2">
                      <button onClick={() => handleEditProject(project)} 
                              className="w-full px-3 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 text-sm flex items-center justify-center gap-2">
                        <div className="icon-edit text-base"></div>
                        <span>Edit Project</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        )}
        
        {showProjectForm && (
          <ProjectFormModal 
            project={editingProject}
            onSave={handleSaveProject}
            onClose={() => {
              setShowProjectForm(false);
              setEditingProject(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

function ProjectFormModal({ project, onSave, onClose }) {
  const [formData, setFormData] = React.useState({
    Name: project?.objectData.Name || '',
    Description: project?.objectData.Description || '',
    StartDate: project?.objectData.StartDate || '',
    EndDate: project?.objectData.EndDate || '',
    Budget: project?.objectData.Budget || 0,
    Status: project?.objectData.Status || 'planning',
    ProjectManager: project?.objectData.ProjectManager || localStorage.getItem('userName'),
    TeamMembers: project?.objectData.TeamMembers || '',
    Customer: project?.objectData.Customer || '',
    Priority: project?.objectData.Priority || 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4">{project ? 'Edit Project' : 'New Project'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input type="text" value={formData.Name} onChange={e => setFormData({...formData, Name: e.target.value})} 
                   className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={formData.Description} onChange={e => setFormData({...formData, Description: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg" rows="3"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" value={formData.StartDate} onChange={e => setFormData({...formData, StartDate: e.target.value})} 
                     className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" value={formData.EndDate} onChange={e => setFormData({...formData, EndDate: e.target.value})} 
                     className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Budget (฿)</label>
              <input type="number" value={formData.Budget} onChange={e => setFormData({...formData, Budget: Number(e.target.value)})} 
                     className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={formData.Status} onChange={e => setFormData({...formData, Status: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg">
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Customer</label>
            <input type="text" value={formData.Customer} onChange={e => setFormData({...formData, Customer: e.target.value})} 
                   className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Team Members (comma separated)</label>
            <input type="text" value={formData.TeamMembers} onChange={e => setFormData({...formData, TeamMembers: e.target.value})} 
                   className="w-full px-3 py-2 border rounded-lg" placeholder="John, Jane, Mike" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<UserProjects />);
