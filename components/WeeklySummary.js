function WeeklySummary() {
  try {
    const [summary, setSummary] = React.useState({
      hoursWorked: 0,
      tasksCompleted: 0,
      meetingsAttended: 0
    });

    React.useEffect(() => {
      loadWeeklySummary();
    }, []);

    const loadWeeklySummary = async () => {
      try {
        const mockSummary = {
          hoursWorked: 32.5,
          tasksCompleted: 12,
          meetingsAttended: 8
        };
        setSummary(mockSummary);
      } catch (error) {
        setSummary({ hoursWorked: 0, tasksCompleted: 0, meetingsAttended: 0 });
      }
    };

    const items = [
      { label: 'ชั่วโมงทำงาน', value: summary.hoursWorked, unit: 'ชม.', icon: 'clock', color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'งานที่เสร็จ', value: summary.tasksCompleted, unit: 'งาน', icon: 'check-circle', color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'ประชุม', value: summary.meetingsAttended, unit: 'ครั้ง', icon: 'users', color: 'text-purple-600', bg: 'bg-purple-50' }
    ];

    return (
      <div className="card" data-name="weekly-summary" data-file="components/WeeklySummary.js">
        <h2 className="text-lg font-semibold mb-4">สรุปสัปดาห์นี้</h2>
        <div className="grid grid-cols-3 gap-4">
          {items.map((item, index) => (
            <div key={index} className={`${item.bg} rounded-xl p-4 text-center`}>
              <div className={`icon-${item.icon} text-2xl ${item.color} mb-2`}></div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {item.value}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">{item.unit}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('WeeklySummary component error:', error);
    return null;
  }
}