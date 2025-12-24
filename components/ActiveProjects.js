function ActiveProjects({ projects }) {
  try {
    const activeProjects = projects.filter(p => p.status === 'active').slice(0, 2);

    return (
      <div className="bg-background-base rounded-lg border border-neutral-200 p-6 shadow-sm" data-name="active-projects" data-file="components/ActiveProjects.js">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4">
          My Active Projects
        </h3>
        <div className="space-y-4">
          {activeProjects.map(project => (
            <div key={project.id} className="p-4 bg-background-light rounded-lg border border-neutral-200 shadow-xs hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-neutral-900">{project.name}</h4>
                <span className="text-sm font-semibold text-primary-600">
                  {project.progress}%
                </span>
              </div>
              {/* Progress bar with light gray background and primary green fill */}
              <div className="w-full bg-neutral-200 rounded-full h-2.5 shadow-xs">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
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