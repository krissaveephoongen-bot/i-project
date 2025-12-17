function ActiveProjects({ projects }) {
  try {
    const activeProjects = projects.filter(p => p.status === 'active').slice(0, 2);

    return (
      <div className="card" data-name="active-projects" data-file="components/ActiveProjects.js">
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          My Active Projects
        </h3>
        <div className="space-y-4">
          {activeProjects.map(project => (
            <div key={project.id} className="p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-[var(--text-primary)]">{project.name}</h4>
                <span className="text-sm font-semibold text-[var(--primary-color)]">
                  {project.progress}%
                </span>
              </div>
              <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] h-2.5 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                Due: {new Date(project.dueDate).toLocaleDateString('th-TH')}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('ActiveProjects component error:', error);
    return null;
  }
}