function ProjectDetailApp() {
  const [project, setProject] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    if (projectId) {
      loadProject(projectId);
    }
  }, []);

  const loadProject = async (projectId) => {
    try {
      if (typeof trickleGetObject !== 'function') {
        setLoading(false);
        return;
      }

      const proj = await trickleGetObject('project', projectId);
      setProject(proj);
    } catch (err) {
      console.error('Load project error:', err);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  const isProjectManager = userRole === 'manager' && project?.objectData.ProjectManager === userName;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <UserNav />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => window.history.back()} 
            className="px-4 py-2 text-sm text-[var(--primary-color)] hover:bg-blue-50 rounded-lg flex items-center gap-2">
            <div className="icon-arrow-left text-sm"></div>
            <span>ย้อนกลับ</span>
          </button>
          
          {isProjectManager && (
            <button onClick={() => window.location.href = `project-manage.html?id=${project.objectId}`}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
              <div className="icon-settings text-base"></div>
              <span>Manage Project</span>
            </button>
          )}
        </div>
        
        <ProjectDetailHeader project={project} />
        <InvoiceTable projectId={project?.objectId} />
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ProjectDetailApp />);