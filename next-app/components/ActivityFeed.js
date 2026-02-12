function ActivityFeed() {
  try {
    const { activities, loading, error, refreshActivities } = useActivity();

    const getActivityIcon = (type) => {
      switch (type) {
        case 'task_completed': return 'check-circle';
        case 'project_created': return 'plus-circle';
        case 'comment_added': return 'message-circle';
        case 'status_updated': return 'refresh-cw';
        default: return 'activity';
      }
    };

    const getActivityColor = (type) => {
      switch (type) {
        case 'task_completed': return 'text-green-600';
        case 'project_created': return 'text-blue-600';
        case 'comment_added': return 'text-purple-600';
        case 'status_updated': return 'text-orange-600';
        default: return 'text-gray-600';
      }
    };

    if (loading) {
      return (
        <div className="card" data-name="activity-feed" data-file="components/ActivityFeed.js">
          <h2 className="text-lg font-semibold mb-4">กิจกรรมล่าสุด</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="card" data-name="activity-feed" data-file="components/ActivityFeed.js">
          <h2 className="text-lg font-semibold mb-4">กิจกรรมล่าสุด</h2>
          <div className="text-center py-4 text-red-600">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </div>
        </div>
      );
    }

    return (
      <div className="card" data-name="activity-feed" data-file="components/ActivityFeed.js">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">กิจกรรมล่าสุด</h2>
          <button onClick={refreshActivities} className="p-1 hover:bg-[var(--secondary-color)] rounded-lg transition-colors">
            <div className="icon-refresh-cw text-lg text-[var(--text-secondary)]"></div>
          </button>
        </div>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map(activity => (
              <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-[var(--secondary-color)] transition-colors">
                <div className={`w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'task_completed' ? 'border-green-200' :
                  activity.type === 'project_created' ? 'border-blue-200' :
                  activity.type === 'comment_added' ? 'border-purple-200' :
                  'border-orange-200'
                }`}>
                  <div className={`icon-${getActivityIcon(activity.type)} text-sm ${getActivityColor(activity.type)}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[var(--text-primary)]">
                    <span className="font-semibold">{activity.user}</span>
                    {' '}
                    <span className="text-[var(--text-secondary)]">{activity.action}</span>
                    {' '}
                    <span className="font-medium text-[var(--primary-color)]">{activity.target}</span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1 flex items-center">
                    <div className="icon-clock text-xs mr-1"></div>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-[var(--text-secondary)]">
              ไม่มีกิจกรรมล่าสุด
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
          <button className="text-sm text-[var(--primary-color)] hover:text-blue-700 font-medium flex items-center">
            ดูกิจกรรมทั้งหมด
            <div className="icon-arrow-right text-sm ml-1"></div>
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ActivityFeed component error:', error);
    return null;
  }
}