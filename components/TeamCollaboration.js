function TeamCollaboration() {
  try {
    const teamMembers = [
      { name: 'Alex Chen', role: 'Project Manager', avatar: 'AC', status: 'online', tasks: 5 },
      { name: 'Sarah Kim', role: 'Designer', avatar: 'SK', status: 'online', tasks: 3 },
      { name: 'Mike Wilson', role: 'Developer', avatar: 'MW', status: 'away', tasks: 7 },
      { name: 'Emily Davis', role: 'Developer', avatar: 'ED', status: 'offline', tasks: 4 }
    ];

    const getStatusColor = (status) => {
      switch(status) {
        case 'online': return 'bg-green-500';
        case 'away': return 'bg-yellow-500';
        default: return 'bg-gray-400';
      }
    };

    return (
      <div className="card" data-name="team-collaboration" data-file="components/TeamCollaboration.js">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Team Members</h3>
          <span className="text-sm text-[var(--text-secondary)]">{teamMembers.filter(m => m.status === 'online').length} online</span>
        </div>
        <div className="space-y-3">
          {teamMembers.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-xl hover:bg-white/80 transition-all cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white font-semibold">
                    {member.avatar}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
                </div>
                <div>
                  <div className="font-medium text-sm">{member.name}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{member.role}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-[var(--primary-color)]">{member.tasks} tasks</div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('TeamCollaboration error:', error);
    return null;
  }
}