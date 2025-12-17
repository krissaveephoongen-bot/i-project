function ProjectCard({ project, detailed = false }) {
  try {
    const getStatusColor = (status) => {
      switch (status) {
        case 'completed': return 'status-completed';
        case 'active': return 'status-progress';
        case 'planning': return 'status-todo';
        case 'on-hold': return 'status-review';
        default: return 'status-todo';
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'completed': return 'เสร็จแล้ว';
        case 'active': return 'กำลังดำเนินการ';
        case 'planning': return 'วางแผน';
        case 'on-hold': return 'หยุดชั่วคราว';
        default: return 'ไม่ทราบสถานะ';
      }
    };

    return (
      <div className={`${detailed ? 'card hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer' : 'bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-4 hover:shadow-md transition-shadow'}`} 
           data-name="project-card" 
           data-file="components/ProjectCard.js">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
              project.color === 'blue' ? 'bg-gradient-to-br from-blue-50 to-blue-100' :
              project.color === 'green' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' :
              project.color === 'purple' ? 'bg-gradient-to-br from-purple-50 to-purple-100' :
              project.color === 'orange' ? 'bg-gradient-to-br from-amber-50 to-amber-100' :
              'bg-gradient-to-br from-gray-50 to-gray-100'
            }`}>
              <div className={`icon-folder text-lg ${
                project.color === 'blue' ? 'text-blue-600' :
                project.color === 'green' ? 'text-emerald-600' :
                project.color === 'purple' ? 'text-purple-600' :
                project.color === 'orange' ? 'text-amber-600' :
                'text-gray-600'
              }`}></div>
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-[var(--text-primary)]">{project.name}</h3>
              {detailed && (
                <p className="text-sm text-[var(--text-secondary)] mt-1">{project.description}</p>
              )}
            </div>
          </div>
          <span className={`status-badge ${getStatusColor(project.status)}`}>
            {getStatusText(project.status)}
          </span>
        </div>
        
        {detailed && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">ความคืบหน้า</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[var(--primary-color)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-[var(--text-secondary)]">
                <div className="icon-calendar text-sm mr-1"></div>
                <span>กำหนดส่ง: {new Date(project.dueDate).toLocaleDateString('th-TH')}</span>
              </div>
              <div className="flex items-center text-[var(--text-secondary)]">
                <div className="icon-users text-sm mr-1"></div>
                <span>{project.teamSize} คน</span>
              </div>
            </div>
          </div>
        )}
        
        {!detailed && (
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-[var(--text-secondary)]">
              ความคืบหน้า {project.progress}%
            </div>
            <div className="flex -space-x-2">
              {project.team && project.team.slice(0, 3).map((member, index) => (
                <div key={index} className="w-6 h-6 bg-[var(--primary-color)] rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{member.charAt(0)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('ProjectCard component error:', error);
    return null;
  }
}