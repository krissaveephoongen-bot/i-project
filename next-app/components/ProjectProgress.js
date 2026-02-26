function ProjectProgress({ projects }) {
  try {
    const activeProjects = projects
      .filter((p) => p.status === "active")
      .slice(0, 4);

    return (
      <div
        className="card"
        data-name="project-progress"
        data-file="components/ProjectProgress.js"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">ความคืบหน้าโครงการ</h3>
          <button
            onClick={() => (window.location.href = "projects.html")}
            className="text-sm text-[var(--primary-color)] hover:underline flex items-center"
          >
            ดูทั้งหมด
            <div className="icon-arrow-right text-sm ml-1"></div>
          </button>
        </div>
        <div className="space-y-4">
          {activeProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => (window.location.href = "projects.html")}
              className="p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] hover:border-[var(--primary-color)] hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="mb-2">
                <h4 className="font-medium text-[var(--text-primary)]">
                  {project.name}
                </h4>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[var(--text-secondary)]">
                  Actual Progress
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[var(--primary-color)]">
                    {project.progress}%
                  </span>
                  {project.progress >= 75 && (
                    <div className="icon-trending-up text-sm text-green-600"></div>
                  )}
                  {project.progress >= 50 && project.progress < 75 && (
                    <div className="icon-minus text-sm text-yellow-600"></div>
                  )}
                  {project.progress < 50 && (
                    <div className="icon-alert-circle text-sm text-red-600"></div>
                  )}
                </div>
              </div>
              <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2.5 mb-2 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-[shimmer_2s_infinite]"></div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <div className="flex items-center">
                  <div className="icon-calendar text-xs mr-1"></div>
                  <span>
                    {new Date(project.dueDate).toLocaleDateString("th-TH")}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="icon-users text-xs mr-1"></div>
                  <span>{project.teamSize} คน</span>
                </div>
              </div>
            </div>
          ))}
          {activeProjects.length === 0 && (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              ไม่มีโครงการที่กำลังดำเนินการ
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("ProjectProgress component error:", error);
    return null;
  }
}
